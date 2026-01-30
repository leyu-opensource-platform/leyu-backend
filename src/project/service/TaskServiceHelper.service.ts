import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/Task.entity';
import { UserTaskService } from './UserTask.service';
import { UserTask } from '../entities/UserTask.entity';
import {
  ExportContributorsOfATaskDto,
  ImportContributorFromOtherTaskDto,
} from '../dto/Task.dto';
import { UserTaskStatus } from 'src/utils/constants/Task.constant';

export interface Contributors {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  contribution_count: string;
}

@Injectable()
export class TaskServiceHelperService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
    // private readonly notificationService:NotificationService,

    private readonly userTaskService: UserTaskService,
  ) {}

  /**
   * Import contributors from other task.
   *
   * @param taskId: the task id from which to import contributors.
   * @param importDto: the import contributor dto.
   * @returns { message: string }: 'Contributors imported successfully'
   * @throws NotFoundException: if no members are found
   */
  async importContributorsFromOtherTask(
    taskId: string,
    importDto: ImportContributorFromOtherTaskDto,
  ) {
    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.is_public) {
      throw new BadRequestException(
        'Cannot import contributors for public task',
      );
    }
    const targetTaskMembers = await this.userTaskService.findAll({
      where: {
        task_id: taskId,
        role: 'Contributor',
      },
    });
    const targetTaskMembersUserId = targetTaskMembers.map(
      (member) => member.user_id,
    );

    const members = await this.getMembersWithMinContributions(
      targetTaskMembersUserId,
      importDto,
    );
    if (members.length == 0) {
      throw new NotFoundException('No members found');
    }

    const status = task.require_contributor_test
      ? UserTaskStatus.PENDING
      : UserTaskStatus.ACTIVE;
    const taskMemberImages: Partial<UserTask>[] = members.map((m) => {
      return {
        task_id: task.id,
        user_id: m.id,
        role: 'Contributor',
        status: status,
      };
    });
    await this.userTaskService.createMultipleTaskMembers(taskMemberImages);
    return { message: 'Contributors imported successfully' };
  }
  /**
   * Get contributors of a task.
   * @param task_id The task id.
   * @param exportDto The export contributor dto.
   * @returns { message: string }: 'Contributors exported successfully'
   * @throws NotFoundException: if no members are found
   */
  async getTaskContributors(
    task_id: string,
    exportDto: ExportContributorsOfATaskDto,
  ) {
    return await this.getMembersWithMinContributions([], {
      ...exportDto,
      sourceTaskId: task_id,
    });
  }
  /**
   * Retrieves contributors of a task that have a minimum number of accepted data sets.
   * - param: excludedMemberIds - an array of member ids to exclude from the results
   * - param: importDto - an object containing the task id, dataset status, status, min number of accepted data sets and limit
   * - returns: a promise that resolves to a list of contributors
   */
  async getMembersWithMinContributions(
    excludedMemberIds: string[],
    importDto: ImportContributorFromOtherTaskDto,
  ): Promise<Contributors[]> {
    const query = this.userTaskRepository
      .createQueryBuilder('user_task')
      // Filter by role
      .where('user_task.role = :role', { role: 'Contributor' })

      // Filter by task
      .andWhere('user_task.task_id = :taskId', {
        taskId: importDto.sourceTaskId,
      })

      // Join User to get user details
      .innerJoin('user_task.user', 'user');

    // Optionally exclude members
    if (excludedMemberIds.length > 0) {
      query.andWhere('user.id NOT IN (:...excludedMemberIds)', {
        excludedMemberIds,
      });
    }

    // Join contributions and microtasks (LEFT JOIN to include users with 0 contributions)
    query
      .leftJoin('user.contributes', 'contributes')
      .leftJoin('contributes.microTask', 'microTask')

      // Ensure contributions belong to microtasks of the same task (or none)
      .andWhere('(microTask.task_id = :taskId OR microTask.task_id IS NULL)', {
        taskId: importDto.sourceTaskId,
      });
    // Optional filter by dataset status
    if (importDto.datasetStatus && importDto.datasetStatus != 'All') {
      query.andWhere('contributes.status = :datasetStatus', {
        datasetStatus: importDto.datasetStatus,
      });
    }
    // Optional filter by status
    if (importDto.status && importDto.status != 'All') {
      query.andWhere('user_task.status = :status', {
        status: importDto.status,
      });
    }

    // Group by user and user_task to count contributions
    query
      .groupBy('user.id')
      .addGroupBy('user_task.id')
      .select([
        'user.id AS id',
        'user.first_name AS first_name',
        'user.middle_name AS middle_name',
        'user.last_name AS last_name',
        'user.email AS email',
        'user.phone_number AS phone_number',
        'user.gender AS gender',
      ])
      .addSelect('COUNT(contributes.id)', 'contribution_count');

    // Having clause (minimum contribution count)
    if (
      importDto.minNumberOfAcceptedDataSets &&
      importDto.minNumberOfAcceptedDataSets > 0
    ) {
      query.having('COUNT(contributes.id) >= :limit', {
        limit: importDto.minNumberOfAcceptedDataSets,
      });
    }
    // Limit number of results
    if (importDto.limit) {
      query.take(importDto.limit);
    }
    // Execute query and return raw results
    return await query.getRawMany();
  }
}
