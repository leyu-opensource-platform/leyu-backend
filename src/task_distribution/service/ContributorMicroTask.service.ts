import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ContributorMicroTasks } from '../enitities/ContributorMicroTasks.entity';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';
import { ContributorMicroTasksConstantStatus } from 'src/utils/constants/ContributorMicroTasks.constant';
import { UserService } from 'src/auth/service/User.service';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { User } from 'src/auth/entities/User.entity';
import { paginate, PaginatedResult } from 'src/utils/paginate.util';

@Injectable()
export class ContributorMicroTaskService {
  constructor(
    @InjectRepository(ContributorMicroTasks)
    private readonly contributorMicroTaskRepository: Repository<ContributorMicroTasks>,
    private readonly paginateService: PaginationService<ContributorMicroTasks>,
    private readonly userService: UserService,
  ) {}

  async findAll(
    queryOption: QueryOptions<ContributorMicroTasks>,
  ): Promise<ContributorMicroTasks[]> {
    return this.contributorMicroTaskRepository.find({
      where: queryOption.where,
      relations: queryOption.relations || [],
    });
  }
  /**
   * @brief Returns a promise that resolves to the completed contributors with limited number of microtask.
   * @param task_id - The task id.
   * @returns Promise<ContributorMicrotasks[]>
   * @param contributorMicrotasks - The tasks with limited number of microtask.
   */
  async findCompletedContributorsWithLimitedNoOfMicroTask(
    task_id: string,
  ): Promise<ContributorMicroTasks[]> {
    const contributorMicroTasks: ContributorMicroTasks[] =
      await this.contributorMicroTaskRepository.find({
        where: { task_id, status: ContributorMicroTasksConstantStatus.NEW },
      });
    return contributorMicroTasks.filter(
      (contributorTask) =>
        contributorTask.total_micro_tasks <
        contributorTask.expected_micro_task_for_contributor,
    );
  }
  async findOne(
    query: QueryOptions<ContributorMicroTasks>,
  ): Promise<ContributorMicroTasks | null> {
    return this.contributorMicroTaskRepository.findOne({ where: query.where });
  }

  async create(
    contributorMicroTask: Partial<ContributorMicroTasks>,
    queryRunner?: QueryRunner,
  ): Promise<ContributorMicroTasks> {
    if (queryRunner) {
      return queryRunner.manager.save(
        ContributorMicroTasks,
        contributorMicroTask,
      );
    }
    return this.contributorMicroTaskRepository.save(contributorMicroTask);
  }
  async createMany(
    contributorMicroTasks: {
      contributor_id: string;
      micro_task_ids: string[];
      status: string;
      expected_micro_task_for_contributor: number;
      gender?: string;
    }[],
    task_id: string,
    batch: number,
    queryRunner: QueryRunner, // Adjust type as needed, e.g., QueryRunner if using TypeORM
    dead_line?: Date,
  ) {
    const manager = queryRunner.manager;
    const createMultiple = contributorMicroTasks.map((contributorMicroTask) =>
      manager.create(ContributorMicroTasks, {
        contributor_id: contributorMicroTask.contributor_id,
        micro_task_ids: contributorMicroTask.micro_task_ids,
        status: contributorMicroTask.status,
        expected_micro_task_for_contributor:
          contributorMicroTask.expected_micro_task_for_contributor,
        gender: contributorMicroTask.gender,
        batch,
        total_micro_tasks: contributorMicroTask.micro_task_ids?.length,
        task_id: task_id,
        dead_line,
      }),
    );
    return manager.save(ContributorMicroTasks, createMultiple);
  }

  async upsertMany(
    contributorMicroTasks: Partial<ContributorMicroTasks>[],
    queryRunner: QueryRunner,
  ): Promise<ContributorMicroTasks[]> {
    const manager = queryRunner.manager;
    return manager.save(ContributorMicroTasks, contributorMicroTasks);
  }

  async update(
    id: string,
    contributorMicroTask: Partial<ContributorMicroTasks>,
    queryRunner: QueryRunner,
  ): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.update(
        ContributorMicroTasks,
        id,
        contributorMicroTask,
      );
    } else {
      await this.contributorMicroTaskRepository.update(
        id,
        contributorMicroTask,
      );
    }
  }

  async removeMany(
    deleteOption: { contributor_id: string; task_id: string }[],
    queryRunner: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner.manager;
    for (const option of deleteOption) {
      await manager.delete(ContributorMicroTasks, {
        contributor_id: option.contributor_id,
        task_id: option.task_id,
      });
    }
  }
  /**
   * This method will get the distribution statistics of contributors for a task.
   * It will return the count of contributors for each language and dialect.
   * @param task_id The id of the task
   * @returns a promise that resolves to an object with language and dialect as keys and the count of contributors as values.
   */
  async getContributorLanguageAndDialectDistributionStatistics(
    task_id: string,
  ): Promise<any> {
    const contributorMicroTaskStatistics =
      await this.contributorMicroTaskRepository.find({
        where: { task_id },
      });
    const contributor_ids = contributorMicroTaskStatistics.map(
      (cmt) => cmt.contributor_id,
    );
    const languageStatistics =
      await this.userService.getUserGroupByLanguageAndDialect(contributor_ids);
    return languageStatistics;
  }
  /**
   * This method will get the distribution statistics of contributors for a task by gender.
   * It will return the count of contributors for each gender.
   * @param task_id The id of the task
   * @returns a promise that resolves to an object with gender as keys and the count of contributors as values.
   */
  async getContributorGenderDistributionStatistics(
    task_id: string,
  ): Promise<any> {
    const contributorMicroTaskStatistics =
      await this.contributorMicroTaskRepository.find({
        where: { task_id },
      });
    const contributor_ids = contributorMicroTaskStatistics.map(
      (cmt) => cmt.contributor_id,
    );
    const genderStatistics =
      await this.userService.getUserGroupByGender(contributor_ids);
    return genderStatistics;
  }

  /**
   * Returns a list of distinct task ids for the given contributor id and status.
   * @param {string} cid - The contributor id to filter by.
   * @param {string | string[]} status - The status to filter by.
   * @returns {Promise<string[]>} - A promise resolving to a list of distinct task ids.
   */
  async getDistinctTaskIdsByContributorId(
    cid: string,
    status?: string | string[],
  ): Promise<string[]> {
    if (Array.isArray(status)) {
      const result = await this.contributorMicroTaskRepository
        .createQueryBuilder('cmt')
        .select('DISTINCT cmt.task_id', 'task_id')
        // FIND WHERE CONTRIBUTOR ID AND STATUS IS NEW OR IN_PROGRESS
        .where('cmt.contributor_id = :cid AND cmt.status IN (:...status)', {
          cid,
          status,
        })
        .getRawMany();
      return result.map((row) => row.task_id);
    } else if (status) {
      const result = await this.contributorMicroTaskRepository
        .createQueryBuilder('cmt')
        .select('DISTINCT cmt.task_id', 'task_id')
        // FIND WHERE CONTRIBUTOR ID AND STATUS IS NEW OR IN_PROGRESS
        .where('cmt.contributor_id = :cid AND cmt.status = :status', {
          cid,
          status,
        })
        .getRawMany();
      return result.map((row) => row.task_id);
    }
    const result = await this.contributorMicroTaskRepository
      .createQueryBuilder('cmt')
      .select('DISTINCT cmt.task_id', 'task_id')
      // FIND WHERE CONTRIBUTOR ID AND STATUS IS NEW OR IN_PROGRESS
      .where('cmt.contributor_id = :cid AND cmt.status IN (:...status)', {
        cid,
        status: [
          ContributorMicroTasksConstantStatus.NEW,
          ContributorMicroTasksConstantStatus.IN_PROGRESS,
        ],
      })
      .getRawMany();

    return result.map((row) => row.task_id);
  }

  /**
   * Returns a promise resolving to a Record of contributor statistics grouped by status.
   * - param: task_id - task id
   * - returns: Promise<Record<string, number>> - a promise resolving to a Record of contributor statistics grouped by status.
   */
  async getTotalContributorsGroupedByStatus(
    task_id: string,
  ): Promise<Record<string, number>> {
    const statistics = await this.contributorMicroTaskRepository
      .createQueryBuilder('cmt')
      .select('cmt.status', 'status')
      .addSelect('COUNT(cmt.id)', 'count')
      .where('cmt.task_id = :task_id', { task_id })
      .groupBy('cmt.status')
      .getRawMany();

    const groupedStatistics: Record<string, number> = {};
    statistics.forEach((stat) => {
      groupedStatistics[stat.status] = parseInt(stat.count, 10);
    });
    return groupedStatistics;
  }
  /**
   * Retrieves a list of contributors associated with a task.
   * The list is paginated with the given options.
   * @param task_id - the id of the task
   * @param paginationDto - pagination options
   * @returns a promise resolving to a paginated result of contributors
   */
  async getTaskContributors(
    task_id: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<any>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const offset = (page - 1) * limit;
    const [contributorMicroTask, count] =
      await this.contributorMicroTaskRepository
        .createQueryBuilder('cmt')
        .leftJoinAndMapOne(
          'cmt.contributor',
          User,
          'contributor',
          'contributor.id = cmt.contributor_id',
        )
        .where('cmt.task_id = :task_id', { task_id })
        .skip(offset)
        .take(limit)
        .getManyAndCount();
    return paginate(contributorMicroTask, count, page, limit);
  }
}
