import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { UserTask } from '../entities/UserTask.entity';
import { paginate, PaginatedResult } from 'src/utils/paginate.util';
import { UserTaskStatus } from 'src/utils/constants/Task.constant';
import { User } from 'src/auth/entities/User.entity';
import { GetTaskMembersFilterDto } from '../dto/Task.dto';
import { UserReferral } from 'src/auth/entities/UserReferral.entity';
import { UserScore } from 'src/auth/entities/UserScore.entity';
import { TaskMembersListResponseDto } from '../rto/Task.rto';
import { GetFacilitatorContributorsFilterDto } from 'src/auth/dto/User.dto';
import { Task } from '../entities/Task.entity';
import { DataSet } from 'src/data_set/entities/DataSet.entity';

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
      const member = manager.create(UserTask, taskData);
      return manager.save(UserTask, member);
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

  async getUserTasks(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Task>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const [memberships, count] = await this.userTaskRepository.findAndCount({
      where: {
        user_id: userId,
        status: 'Active',
        task: { is_archived: false },
      },
      relations: { task: { taskType: true, taskRequirement: true } },
      skip: (page - 1) * limit,
      take: limit,
    });
    const tasks = memberships.map((membership) => membership.task);
    return paginate(tasks, count, page, limit);
  }
  async getQATasks(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Task>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const [memberships, count] = await this.userTaskRepository.findAndCount({
      where: {
        user_id: userId,
        status: 'Active',
        task: { is_archived: false },
      },
      relations: {
        task: { taskType: true, taskRequirement: true, qaInstruction: true },
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    const tasks = memberships.map((membership) => membership.task);
    return paginate(tasks, count, page, limit);
  }

  /**
   * Finds task members of a task with pagination.
   * @param taskId The id of the task.
   * @param userTaskOption The query options to filter user tasks.
   * @param userQueryOption The query options to filter users.
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated result of task members.
   */
  async findTaskMembersByQuery(
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
  async getTaskMembers(
    taskId: string,
    searchQuery: GetTaskMembersFilterDto,
  ): Promise<PaginatedResult<TaskMembersListResponseDto>> {
    const role = searchQuery.role || 'Contributor';
    if (role == 'Contributor') {
      return this.getTaskContributors(taskId, searchQuery);
    } else if (role === 'Reviewer') {
      return this.getTaskReviewers(taskId, searchQuery);
    } else if (role === 'QualityAssurance') {
      return this.getTaskQAs(taskId, searchQuery);
    } else {
      return this.getTaskFacilitators(taskId, searchQuery);
    }
  }
  async getTaskFacilitators(
    taskId: string,
    searchQuery: GetTaskMembersFilterDto,
  ): Promise<PaginatedResult<TaskMembersListResponseDto>> {
    const page = searchQuery.page || 1;
    const limit = searchQuery.limit || 10;
    const skip = (page - 1) * limit;
    const memberQueryBuilder = this.userTaskRepository
      .createQueryBuilder('facilitator_task')
      .leftJoinAndSelect('facilitator_task.user', 'facilitator')

      // referrals made by facilitator
      .leftJoin(UserReferral, 'ur', 'ur.referrer_id = facilitator.id')
      // contributor user tasks (same task)
      .leftJoin(
        UserTask,
        'contributor_task',
        `
        contributor_task.user_id = ur.referred_id
        AND contributor_task.task_id = :taskId
        AND contributor_task.role = :contributorRole
      `,
      )

      // contributor scores
      .leftJoin(UserScore, 'us', 'us.user_id = contributor_task.user_id')
      .where('facilitator_task.task_id=:taskId::uuid', { taskId })
      .andWhere('facilitator_task.role=:role', { role: 'Facilitator' })
      .setParameter('contributorRole', 'Contributor');
    if (searchQuery.search) {
      memberQueryBuilder.andWhere(
        '(facilitator.first_name ILIKE :search OR facilitator.last_name ILIKE :search OR facilitator.email ILIKE :search OR facilitator.phone_number ILIKE :search)',
        { search: `%${searchQuery.search}%` },
      );
    }
    if (searchQuery.first_name) {
      memberQueryBuilder.andWhere('facilitator.first_name ILIKE :first_name', {
        first_name: `%${searchQuery.first_name}%`,
      });
    }
    if (searchQuery.last_name) {
      memberQueryBuilder.andWhere('facilitator.last_name ILIKE :last_name', {
        last_name: `%${searchQuery.last_name}%`,
      });
    }
    if (searchQuery.email) {
      memberQueryBuilder.andWhere('facilitator.email ILIKE :email', {
        email: `%${searchQuery.email}%`,
      });
    }
    if (searchQuery.phone_number) {
      memberQueryBuilder.andWhere(
        'facilitator.phone_number ILIKE :phone_number',
        { phone_number: `%${searchQuery.phone_number}%` },
      );
    }
    if (searchQuery.gender) {
      memberQueryBuilder.andWhere('facilitator.gender=:gender', {
        gender: `%${searchQuery.gender}%`,
      });
    }
    if (searchQuery.is_active !== undefined) {
      memberQueryBuilder.andWhere('facilitator.is_active=:is_active', {
        is_active: searchQuery.is_active,
      });
    }
    if (searchQuery.status) {
      memberQueryBuilder.andWhere('facilitator_task.status=:status', {
        status: searchQuery.status,
      });
    }

    memberQueryBuilder
      .select([
        'facilitator_task.id AS membership_id',
        'facilitator.id AS id',
        'facilitator.first_name AS first_name',
        'facilitator.last_name AS last_name',
        'facilitator.email AS email',
        'facilitator.phone_number AS phone_number',
        'facilitator.gender AS gender',
        'facilitator.is_active AS is_active',
        'facilitator_task.status AS status',
        'facilitator_task.role AS role',
        'facilitator.referral_code AS referral_code',
        // 'COALESCE(AVG(us.score), 0) AS score',
      ])
      .addSelect('COALESCE(AVG(us.score), 0)', 'score') // Add aggregate separately

      // EVERYTHING in select must be here
      .groupBy('facilitator_task.id')
      .addGroupBy('facilitator.id')
      .addGroupBy('facilitator.first_name')
      .addGroupBy('facilitator.last_name')
      .addGroupBy('facilitator.email')
      .addGroupBy('facilitator.phone_number')
      .addGroupBy('facilitator.gender')
      .addGroupBy('facilitator_task.status')
      .addGroupBy('facilitator_task.role')
      .addGroupBy('facilitator.is_active');
    if (searchQuery.order_by) {
      if (searchQuery.order_by === 'score') {
        memberQueryBuilder.orderBy(
          'COALESCE(AVG(us.score), 0)',
          searchQuery.order_direction || 'DESC',
        );
      } else {
        memberQueryBuilder.orderBy(
          `facilitator.${searchQuery.order_by}`,
          searchQuery.order_direction || 'ASC',
        );
      }
    }
    const users = await memberQueryBuilder.getRawMany();
    const paginated = users.slice(skip, skip + limit);
    return paginate(paginated, users.length, page, limit);
  }
  async getTaskContributors(
    taskId: string,
    searchQuery: GetTaskMembersFilterDto,
  ): Promise<PaginatedResult<any>> {
    const page = searchQuery.page || 1;
    const limit = searchQuery.limit || 10;
    const memberQueryBuilder = this.userTaskRepository
      .createQueryBuilder('contributor_task')
      .leftJoinAndSelect('contributor_task.user', 'contributor')
      .leftJoinAndSelect('contributor.score', 'contributor_score')
      .where('contributor_task.task_id=:taskId', { taskId })
      .andWhere('contributor_task.role=:role', { role: 'Contributor' });

    if (searchQuery.search) {
      memberQueryBuilder.andWhere(
        '(contributor.first_name ILIKE :search OR contributor.last_name ILIKE :search OR contributor.email ILIKE :search OR contributor.phone_number ILIKE :search)',
        { search: `%${searchQuery.search}%` },
      );
    }
    if (searchQuery.first_name) {
      memberQueryBuilder.andWhere('contributor.first_name ILIKE :first_name', {
        first_name: `%${searchQuery.first_name}%`,
      });
    }
    if (searchQuery.last_name) {
      memberQueryBuilder.andWhere('contributor.last_name ILIKE :last_name', {
        last_name: `%${searchQuery.last_name}%`,
      });
    }
    if (searchQuery.email) {
      memberQueryBuilder.andWhere('contributor.email ILIKE :email', {
        email: `%${searchQuery.email}%`,
      });
    }
    if (searchQuery.phone_number) {
      memberQueryBuilder.andWhere(
        'contributor.phone_number ILIKE :phone_number',
        { phone_number: `%${searchQuery.phone_number}%` },
      );
    }
    if (searchQuery.gender) {
      memberQueryBuilder.andWhere('contributor.gender=:gender', {
        gender: `%${searchQuery.gender}%`,
      });
    }
    if (searchQuery.is_active !== undefined) {
      memberQueryBuilder.andWhere('contributor.is_active=:is_active', {
        is_active: searchQuery.is_active,
      });
    }
    if (searchQuery.status) {
      memberQueryBuilder.andWhere('contributor_task.status=:status', {
        status: searchQuery.status,
      });
    }

    memberQueryBuilder.select([
      'contributor_task.id AS membership_id',
      'contributor.id AS id',
      'contributor.first_name AS first_name',
      'contributor.middle_name AS middle_name',
      'contributor.last_name AS last_name',
      'contributor.email AS email',
      'contributor.phone_number AS phone_number',
      'contributor.gender AS gender',
      'contributor.is_active AS is_active',
      'contributor_task.status AS status',
      'contributor_task.role AS role',
      'COALESCE(contributor_score.score, 0) AS score',
    ]);
    // Correlated subquery rather than a join+GROUP BY -- keeps the existing
    // getRawMany()/getCount() pair (which relies on one row per contributor)
    // working unchanged. Scoped to this task's audio submissions specifically
    // (excludes drafts and onboarding test-batch clips, matching the same
    // "real submission" definition the HF export uses) so the count reflects
    // actual dataset contribution, not qualification attempts.
    memberQueryBuilder.addSelect((subQuery) => {
      return subQuery
        .select('COUNT(ds.id)::int', 'count')
        .from(DataSet, 'ds')
        .leftJoin('ds.microTask', 'ds_micro_task')
        .where('ds_micro_task.task_id = :dsTaskId', { dsTaskId: taskId })
        .andWhere('ds.contributor_id = contributor.id')
        .andWhere('ds.type = :dsType', { dsType: 'audio' })
        .andWhere('ds.is_draft = false')
        .andWhere('ds.is_test = false');
    }, 'submission_count');
    if (searchQuery.order_by) {
      if (searchQuery.order_by === 'score') {
        memberQueryBuilder.orderBy(
          'COALESCE(contributor_score.score, 0)',
          searchQuery.order_direction || 'DESC',
        );
      } else {
        memberQueryBuilder.orderBy(
          `contributor.${searchQuery.order_by}`,
          searchQuery.order_direction || 'DESC',
        );
      }
    }
    const [users, total] = await Promise.all([
      memberQueryBuilder.getRawMany(),
      memberQueryBuilder.getCount(),
    ]);
    const skip = (page - 1) * limit;
    const paginated = users.slice(skip, skip + limit);
    return paginate(paginated, total, page, limit);
  }
  async getUnassignedTaskContributors(
    taskId: string,
    searchSchema: GetFacilitatorContributorsFilterDto,
    unAssignedContributorIds: string[],
  ): Promise<PaginatedResult<any>> {
    let search: string | undefined = searchSchema.search;
    const page = searchSchema.page || 1;
    const limit = searchSchema.limit || 10;
    // Clean up
    // Clean up
    delete searchSchema.page;
    delete searchSchema.limit;
    delete searchSchema.search;
    searchSchema.search = undefined;
    const baseFilters: FindOptionsWhere<User> = {};
    const searchFilters: FindOptionsWhere<User>[] = [];

    // Build exact match filters from searchSchema
    if (searchSchema.email) {
      baseFilters['email'] = ILike(`%${searchSchema.email}%`);
    }
    if (searchSchema.first_name) {
      baseFilters['first_name'] = ILike(`%${searchSchema.first_name}%`);
    }
    if (searchSchema.gender) {
      baseFilters['gender'] = searchSchema.gender;
    }
    if (searchSchema.last_name) {
      baseFilters['last_name'] = ILike(`%${searchSchema.last_name}%`);
    }
    if (searchSchema.middle_name) {
      baseFilters['middle_name'] = ILike(`%${searchSchema.middle_name}%`);
    }
    if (searchSchema.phone_number) {
      baseFilters['phone_number'] = ILike(`%${searchSchema.phone_number}%`);
    }
    // if(searchSchema.role){
    //   baseFilters['role'] = { name: searchSchema.role };
    // }
    if (searchSchema.email) {
      baseFilters['email'] = ILike(`%${searchSchema.email}%`);
    }
    if (search) {
      search = search.trim();
      searchFilters.push(
        { ...baseFilters, email: ILike(`%${search}%`) },
        { ...baseFilters, first_name: ILike(`%${search}%`) },
        { ...baseFilters, last_name: ILike(`%${search}%`) },
        { ...baseFilters, middle_name: ILike(`%${search}%`) },
        { ...baseFilters, phone_number: ILike(`%${search}%`) },
      );
    }
    if (searchSchema.facilitator_id_for_referral) {
      baseFilters['receivedReferral'] = {
        referrer_id: searchSchema.facilitator_id_for_referral,
      };
      searchFilters.filter((filter) => {
        filter['receivedReferral'] = {
          referrer_id: searchSchema.facilitator_id_for_referral,
        };
        return filter;
      });
    }
    console.log('Base Filters:', baseFilters.receivedReferral);
    const query: QueryOptions<User> = {
      where: search ? searchFilters : baseFilters,
    };
    const [userTask, count] = await this.userTaskRepository.findAndCount({
      where: {
        task_id: taskId,
        role: 'Contributor',
        user: query.where,
        user_id:
          unAssignedContributorIds.length > 0
            ? In(unAssignedContributorIds)
            : undefined,
      },
      relations: { user: true },
    });
    const contributors = userTask.map((userTask) => userTask.user);
    return paginate(contributors, count, page, limit);
  }
  async getTaskReviewers(
    taskId: string,
    searchQuery: GetTaskMembersFilterDto,
  ): Promise<PaginatedResult<any>> {
    const page = searchQuery.page || 1;
    const limit = searchQuery.limit || 10;
    const memberQueryBuilder = this.userTaskRepository
      .createQueryBuilder('reviewer_task')
      .leftJoinAndSelect('reviewer_task.user', 'reviewer')
      .leftJoin(
        UserScore,
        'reviewer_score',
        'reviewer_score.user_id = reviewer.id',
      )
      .where('reviewer_task.task_id=:taskId', { taskId })
      .andWhere('reviewer_task.role=:role', { role: 'Reviewer' });

    if (searchQuery.search) {
      memberQueryBuilder.andWhere(
        '(reviewer.first_name ILIKE :search OR reviewer.last_name ILIKE :search OR reviewer.email ILIKE :search OR reviewer.phone_number ILIKE :search)',
        { search: `%${searchQuery.search}%` },
      );
    }
    if (searchQuery.first_name) {
      memberQueryBuilder.andWhere('reviewer.first_name ILIKE :first_name', {
        first_name: `%${searchQuery.first_name}%`,
      });
    }
    if (searchQuery.last_name) {
      memberQueryBuilder.andWhere('reviewer.last_name ILIKE :last_name', {
        last_name: `%${searchQuery.last_name}%`,
      });
    }
    if (searchQuery.email) {
      memberQueryBuilder.andWhere('reviewer.email ILIKE :email', {
        email: `%${searchQuery.email}%`,
      });
    }
    if (searchQuery.phone_number) {
      memberQueryBuilder.andWhere('reviewer.phone_number ILIKE :phone_number', {
        phone_number: `%${searchQuery.phone_number}%`,
      });
    }
    if (searchQuery.gender) {
      memberQueryBuilder.andWhere('reviewer.gender=:gender', {
        gender: `%${searchQuery.gender}%`,
      });
    }
    if (searchQuery.is_active !== undefined) {
      memberQueryBuilder.andWhere('reviewer.is_active=:is_active', {
        is_active: searchQuery.is_active,
      });
    }
    if (searchQuery.status) {
      memberQueryBuilder.andWhere('reviewer_task.status=:status', {
        status: searchQuery.status,
      });
    }

    memberQueryBuilder.select([
      'reviewer_task.id AS membership_id',
      'reviewer.id AS id',
      'reviewer.first_name AS first_name',
      'reviewer.last_name AS last_name',
      'reviewer.email AS email',
      'reviewer.phone_number AS phone_number',
      'reviewer.gender AS gender',
      'reviewer.is_active AS  is_active',
      'reviewer_task.status AS status',
      'reviewer_task.role AS role',
      'COALESCE(reviewer_score.score, 0) AS score',
    ]);
    if (searchQuery.order_by) {
      if (searchQuery.order_by === 'score') {
        memberQueryBuilder.orderBy(
          'COALESCE(score, 0)',
          searchQuery.order_direction || 'DESC',
        );
      } else {
        memberQueryBuilder.orderBy(
          `reviewer.${searchQuery.order_by}`,
          searchQuery.order_direction || 'ASC',
        );
      }
    }
    const [users, total] = await Promise.all([
      memberQueryBuilder.getRawMany(),
      memberQueryBuilder.getCount(),
    ]);
    const skip = (page - 1) * limit;
    const paginated = users.slice(skip, skip + limit);
    return paginate(paginated, total, page, limit);
  }

  async getTaskQAs(
    taskId: string,
    searchQuery: GetTaskMembersFilterDto,
  ): Promise<PaginatedResult<any>> {
    const page = searchQuery.page || 1;
    const limit = searchQuery.limit || 10;
    const memberQueryBuilder = this.userTaskRepository
      .createQueryBuilder('reviewer_task')
      .leftJoinAndSelect('reviewer_task.user', 'reviewer')
      .leftJoin(
        UserScore,
        'reviewer_score',
        'reviewer_score.user_id = reviewer.id',
      )
      .where('reviewer_task.task_id=:taskId', { taskId })
      .andWhere('reviewer_task.role=:role', { role: 'QualityAssurance' });

    if (searchQuery.search) {
      memberQueryBuilder.andWhere(
        '(reviewer.first_name ILIKE :search OR reviewer.last_name ILIKE :search OR reviewer.email ILIKE :search OR reviewer.phone_number ILIKE :search)',
        { search: `%${searchQuery.search}%` },
      );
    }
    if (searchQuery.first_name) {
      memberQueryBuilder.andWhere('reviewer.first_name ILIKE :first_name', {
        first_name: `%${searchQuery.first_name}%`,
      });
    }
    if (searchQuery.last_name) {
      memberQueryBuilder.andWhere('reviewer.last_name ILIKE :last_name', {
        last_name: `%${searchQuery.last_name}%`,
      });
    }
    if (searchQuery.email) {
      memberQueryBuilder.andWhere('reviewer.email ILIKE :email', {
        email: `%${searchQuery.email}%`,
      });
    }
    if (searchQuery.phone_number) {
      memberQueryBuilder.andWhere('reviewer.phone_number ILIKE :phone_number', {
        phone_number: `%${searchQuery.phone_number}%`,
      });
    }
    if (searchQuery.gender) {
      memberQueryBuilder.andWhere('reviewer.gender=:gender', {
        gender: `%${searchQuery.gender}%`,
      });
    }
    if (searchQuery.is_active !== undefined) {
      memberQueryBuilder.andWhere('reviewer.is_active=:is_active', {
        is_active: searchQuery.is_active,
      });
    }
    if (searchQuery.status) {
      memberQueryBuilder.andWhere('reviewer_task.status=:status', {
        status: searchQuery.status,
      });
    }

    memberQueryBuilder.select([
      'reviewer_task.id AS membership_id',
      'reviewer.id AS id',
      'reviewer.first_name AS first_name',
      'reviewer.last_name AS last_name',
      'reviewer.email AS email',
      'reviewer.phone_number AS phone_number',
      'reviewer.gender AS gender',
      'reviewer.is_active AS  is_active',
      'reviewer_task.status AS status',
      'reviewer_task.role AS role',
      'COALESCE(reviewer_score.score, 0) AS score',
    ]);
    if (searchQuery.order_by) {
      if (searchQuery.order_by === 'score') {
        memberQueryBuilder.orderBy(
          'COALESCE(score, 0)',
          searchQuery.order_direction || 'DESC',
        );
      } else {
        memberQueryBuilder.orderBy(
          `reviewer.${searchQuery.order_by}`,
          searchQuery.order_direction || 'ASC',
        );
      }
    }
    const [users, total] = await Promise.all([
      memberQueryBuilder.getRawMany(),
      memberQueryBuilder.getCount(),
    ]);
    const skip = (page - 1) * limit;
    const paginated = users.slice(skip, skip + limit);
    return paginate(paginated, total, page, limit);
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
  ): Promise<UserTask> {
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
