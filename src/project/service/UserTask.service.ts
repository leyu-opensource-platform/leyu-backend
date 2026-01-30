import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { UserTask } from '../entities/UserTask.entity';
import { paginate, PaginatedResult } from 'src/utils/paginate.util';
import { UserTaskStatus } from 'src/utils/constants/Task.constant';
import { User } from 'src/auth/entities/User.entity';

@Injectable()
export class UserTaskService {
  constructor(
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
    private readonly paginateService: PaginationService<UserTask>,
    private readonly dataSource: DataSource,
  ) {
    this.paginateService = new PaginationService<UserTask>(
      this.userTaskRepository,
    );
  }

  /**
   * Creates a new user task.
   * @param taskData The user task data
   * @param queryRunner The query runner
   * @returns Promise<UserTask> The created user task
   */
  async create(
    taskData: Partial<UserTask>,
    queryRunner?: QueryRunner,
  ): Promise<UserTask> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const project = manager.create(UserTask, taskData);
      return await manager.save(UserTask, project);
    } else {
      const manager = this.userTaskRepository;
      const task = manager.create(taskData);
      return await manager.save(task);
    }
  }

  async findAll(
    queryOption: QueryOptions<UserTask>,
    queryRunner?: QueryRunner,
  ): Promise<UserTask[]> {
    const options: any = {
      where: queryOption.where,
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }
    const manager = queryRunner ? queryRunner.manager : this.userTaskRepository;
    return await manager.find(options);
  }

  /**
   * Finds task members of a task with pagination.
   * @param taskId The id of the task.
   * @param userTaskOption The query options to filter user tasks.
   * @param userQueryOption The query options to filter users.
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated result of task members.
   */
  async findTaskMembers(
    taskId: string,
    userTaskOption: FindOptionsWhere<UserTask>,
    userQueryOption: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserTask>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const [users, count] = await this.dataSource
      .getRepository(UserTask)
      .findAndCount({
        relations: { user: true },
        where: {
          ...userTaskOption,
          user: userQueryOption,
          task_id: taskId,
        },
        skip: (page - 1) * limit,
        take: limit,
      });
    return paginate(users, count, page, limit);
  }

  async findPaginate(
    queryOption: QueryOptions<UserTask>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserTask>> {
    const options: any = {
      where: queryOption.where,
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }
    return await this.paginateService.paginateWithOptionQuery(
      paginationDto,
      'user_task',
      queryOption,
    );
  }
  /**
   * Finds unique task members of a task with pagination.
   * @param taskIds The ids of the tasks.
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated result of unique task members.
   */
  async findPaginateUniqueMembers(
    taskIds: string[],
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserTask>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const [users, count] = await this.dataSource
      .getRepository(UserTask)
      .createQueryBuilder('ut')
      .leftJoinAndSelect('ut.user', 'user')
      .where('ut.task_id IN (:...taskIds)', { taskIds })
      .andWhere(
        `(ut.id IN (
      SELECT MAX(ut2.id::TEXT)::UUID
      FROM user_task ut2
      WHERE ut2.task_id IN (:...taskIds)
      GROUP BY ut2.user_id
    ))`,
        { taskIds },
      )
      .orderBy('ut.created_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return paginate(users, count, page, limit);
  }
  async findAndCount(
    queryOption: QueryOptions<UserTask>,
    paginationDto: PaginationDto,
  ): Promise<[UserTask[], number]> {
    const options: any = {
      where: queryOption.where,
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;

    return await this.userTaskRepository.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(
    queryOption: QueryOptions<UserTask>,
    queryRunner?: QueryRunner,
  ): Promise<UserTask | null> {
    const options: any = {
      where: queryOption.where,
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }

    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(UserTask, options);
    } else {
      const manager = this.userTaskRepository;
      return await manager.findOne(options);
    }
  }
  /**
   * Finds a user task by the given query options or creates a new one if it doesn't exist.
   * @param queryOption - The query options to filter user tasks.
   * @param data - The partial user task to create.
   * @param queryRunner - The query runner to use for the transaction.
   * @returns - A promise that resolves to the found user task or null if not found.
   */
  async findOneOrCreate(
    queryOption: QueryOptions<UserTask>,
    data: Partial<UserTask>,
    queryRunner: QueryRunner,
  ): Promise<UserTask | null> {
    const options: any = {
      where: queryOption.where,
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }
    const userTask: UserTask | null = await queryRunner.manager.findOne(
      UserTask,
      options,
    );
    if (userTask) {
      return userTask;
    } else {
      const userTask = queryRunner.manager.create(UserTask, data);
      await queryRunner.manager.save(UserTask, userTask);
      return userTask;
    }
  }
  async update(
    id: string,
    taskData: Partial<UserTask>,
    queryRunner?: QueryRunner,
  ): Promise<UserTask | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.update(UserTask, id, taskData);
      return await manager.findOne(UserTask, { where: { id } });
    } else {
      const manager = this.userTaskRepository;
      await manager.update(id, taskData);
      return await manager.findOne({ where: { id } });
    }
  }

  async remove(id: string): Promise<void> {
    await this.userTaskRepository.delete(id);
    return;
  }
  async activateUserTask(id: string, queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    await manager.update(UserTask, id, { status: UserTaskStatus.ACTIVE });
    return;
  }
  async rejectUserTask(
    userTaskData: { user_id: string; task_id: string },
    queryRunner: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner.manager;
    const userTask: UserTask | null = await manager.findOne(UserTask, {
      where: { user_id: userTaskData.user_id, task_id: userTaskData.task_id },
    });
    if (!userTask) return;
    await manager.update(UserTask, userTask.id, {
      status: UserTaskStatus.REJECTED,
    });
    return;
  }
  async createMultipleTaskMembers(userTasks: Partial<UserTask>[]) {
    await this.userTaskRepository.insert(userTasks);
  }
}
