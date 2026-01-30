import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilitatorContributor } from '../entities/FacilitatorContributor.entity';
import { FindOptionsWhere, In, QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginationService } from 'src/common/service/pagination.service';
import { paginate, PaginatedResult } from 'src/utils/paginate.util';
import { QueryOptions } from 'src/utils/queryOption.util';
import { UserService } from 'src/auth/service/User.service';
import { User } from 'src/auth/entities/User.entity';
import { UserTaskService } from './UserTask.service';
import { Role } from 'src/auth/decorators/roles.enum';
import { UserTask } from '../entities/UserTask.entity';
import { TaskService } from './Task.service';
import { Task } from '../entities/Task.entity';

export interface FacilitatorContributorDto extends FacilitatorContributor {
  contributors?: User[];
  total_contributors?: number;
}
@Injectable()
export class FacilitatorContributorService {
  constructor(
    @InjectRepository(FacilitatorContributor)
    private readonly facilitatorContributorRepository: Repository<FacilitatorContributor>,
    private readonly paginationService: PaginationService<FacilitatorContributor>,
    private readonly userService: UserService,

    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,

    private readonly userTaskService: UserTaskService, // Assuming UserService has methods to handle user tasks
  ) {
    this.paginationService = new PaginationService<FacilitatorContributor>(
      this.facilitatorContributorRepository,
    );
  }

  /**
   * Assigns contributors to a facilitator in a task.
   * If the facilitator already exists, it will be updated with the new contributor ids.
   * If the facilitator does not exist, it will be created with the given contributor ids.
   * @param task_id The id of the task.
   * @param facilitator_id The id of the facilitator.
   * @param contributor_ids The ids of the contributors to assign.
   * @param queryRunner The query runner to use for the operation.
   * @returns The saved facilitator contributor entity.
   */
  async assignContributors(
    task_id: string,
    facilitator_id: string,
    contributor_ids: string[],
    queryRunner: QueryRunner,
  ): Promise<FacilitatorContributor> {
    // const facilitatorContributor=await this.facilitatorContributorRepository.findOne({where:{task_id:task_id,facilitator_id:facilitator_id}});
    const manager = queryRunner.manager.getRepository(FacilitatorContributor);
    let facilitatorContributor = await manager.findOne({
      where: { task_id, facilitator_id },
    });
    if (facilitatorContributor) {
      const uniqueContributors = Array.from(
        new Set([
          ...facilitatorContributor.contributor_ids,
          ...contributor_ids,
        ]),
      );
      facilitatorContributor.contributor_ids = uniqueContributors;
      return await manager.save(facilitatorContributor); // ✅ use repo based on queryRunner
    } else {
      facilitatorContributor = manager.create({
        task_id,
        facilitator_id,
        contributor_ids,
      });
      return await manager.save(facilitatorContributor); // ✅ same here
    }
  }
  /**
   * Retrieves the ids of all contributors in a task that are not already assigned to any facilitator.
   * @param task_id The id of the task.
   * @returns A promise that resolves to an array of strings containing the ids of the unassigned contributors.
   */
  async getUnassignedContributorIds(task_id: string): Promise<string[]> {
    const taskContributors: UserTask[] = await this.userTaskService.findAll({
      where: { task_id: task_id, role: Role.CONTRIBUTOR },
    });
    const contributorIds: string[] = taskContributors.map(
      (contributor) => contributor.user_id,
    );
    const contributorFacilitators: FacilitatorContributor[] =
      await this.findAllTaskFacilitators(task_id);
    console.log('Contributor Facilitators', contributorFacilitators);
    // create a net set of contributors
    let assignedcontributorIds: Set<string> = new Set<string>();
    for (const cf of contributorFacilitators) {
      assignedcontributorIds = new Set([
        ...assignedcontributorIds,
        ...cf.contributor_ids,
      ]);
    }
    const unAssignedContributorIds = contributorIds.filter(
      (contributorId) => !assignedcontributorIds.has(contributorId),
    );
    // const assigned_contributor_ids:string[]=contributor_ids_in_facilitators.map((contributor) => contributor.contributor_id);
    return unAssignedContributorIds;
  }
  /**
   * Retrieves the unassigned contributors of a task.
   * @param task_id The id of the task.
   * @param userQueryOption The query options for the users.
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated result of unassigned contributors.
   */
  async getUnassignedContributors(
    task_id: string,
    userQueryOption: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserTask>> {
    const unassignUserIds = await this.getUnassignedContributorIds(task_id);
    const userOptions = { ...userQueryOption, id: In(unassignUserIds) };
    return await this.userTaskService.findTaskMembers(
      task_id,
      { role: 'Contributor' },
      userOptions,
      paginationDto,
    );
  }
  /**
   * Automatically assigns contributors to facilitators of a task.
   * @param task_id The id of the task.
   * @param queryRunner The query runner to use for the transaction.
   * @returns A promise that resolves to the result of the upsert.
   *
   * This function will assign contributors to facilitators of a task, based on the
   * task requirement for max contributor per facilitator.
   * If a facilitator is already full, the function will skip it.
   * If there are no contributors left for any facilitator, the function will stop.
   */
  async assignContributorsAutomatically(
    task_id: string,
    queryRunner?: QueryRunner,
  ): Promise<any> {
    const task: Task | null = await this.taskService.findOne({
      where: { id: task_id },
      relations: { taskRequirement: true },
    });
    if (!task) {
      throw new NotFoundException(`Task not found`);
    }
    const existingFacilitators: UserTask[] = await this.userTaskService.findAll(
      {
        where: { task_id: task_id, role: Role.FACILITATOR },
      },
    );
    const unassignedContributorIds =
      await this.getUnassignedContributorIds(task_id);

    const contributorFacilitator: FacilitatorContributor[] =
      await this.facilitatorContributorRepository.find({
        where: { task_id: task_id },
      });
    let allContributorFacilitators: FacilitatorContributor[] = [];
    allContributorFacilitators = [...contributorFacilitator];

    // create a contributorFacilitator for non existing facilitators
    for (let index = 0; index < existingFacilitators.length; index++) {
      // check if facilitator is in contributorFacilitator
      const facilitator = existingFacilitators[index];
      let facilitatorContributor = allContributorFacilitators.find(
        (fc) => fc.facilitator_id === facilitator.user_id,
      );
      if (!facilitatorContributor) {
        facilitatorContributor = new FacilitatorContributor();
        facilitatorContributor.task_id = task_id;
        facilitatorContributor.facilitator_id = facilitator.user_id;
        facilitatorContributor.contributor_ids = [];
        allContributorFacilitators.push(facilitatorContributor);
      }
    }
    const maxContributorPerFacilitator =
      task.taskRequirement?.max_contributor_per_facilitator || 10;

    for (let i = 0; i < allContributorFacilitators.length; i++) {
      const facilitatorContributor = allContributorFacilitators[i];

      // Skip if this facilitator is already full
      if (
        facilitatorContributor.contributor_ids.length >=
        maxContributorPerFacilitator
      ) {
        continue;
      }

      const j = 0;
      while (j < unassignedContributorIds.length) {
        // Stop if no contributors left
        if (unassignedContributorIds.length === 0) {
          break;
        }

        // Stop if this facilitator reached max
        if (
          facilitatorContributor.contributor_ids.length >=
          maxContributorPerFacilitator
        ) {
          break;
        }

        const contributorId = unassignedContributorIds[j];
        facilitatorContributor.contributor_ids.push(contributorId);

        // Remove assigned contributor
        unassignedContributorIds.splice(j, 1);
      }

      // Stop if no contributors left for any facilitator
      if (unassignedContributorIds.length === 0) {
        break;
      }
    }

    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.upsert(
        FacilitatorContributor,
        allContributorFacilitators,
        { conflictPaths: ['task_id', 'facilitator_id'] },
      );
    } else {
      const manager = this.facilitatorContributorRepository;
      return await manager.upsert(allContributorFacilitators, {
        conflictPaths: ['task_id', 'facilitator_id'],
      });
    }
  }

  /**
   * Removes contributors from a facilitator in a task.
   * If the facilitator does not exist, it will throw a NotFoundException.
   * @param task_id The id of the task.
   * @param facilitator_id The id of the facilitator.
   * @param removeable_contributors The ids of the contributors to remove.
   * @param queryRunner The query runner to use for the operation.
   * @returns A promise that resolves to the saved facilitator contributor entity.
   */
  async removeContributors(
    task_id: string,
    facilitator_id: string,
    removeable_contributors: string[],
    queryRunner?: QueryRunner,
  ): Promise<FacilitatorContributor> {
    const facilitatorContributor =
      await this.facilitatorContributorRepository.findOne({
        where: { task_id: task_id, facilitator_id: facilitator_id },
      });
    if (!facilitatorContributor) {
      throw new NotFoundException(`Facilitator not found`);
    }
    const left_contributors = facilitatorContributor.contributor_ids.filter(
      (contributor_id) => !removeable_contributors.includes(contributor_id),
    );
    if (queryRunner) {
      const manager = queryRunner.manager;
      const factilitator = manager.create(FacilitatorContributor, {
        task_id,
        facilitator_id,
        contributor_ids: left_contributors,
      });
      return await manager.save(FacilitatorContributor, factilitator);
    } else {
      const manager = this.facilitatorContributorRepository;
      const facilitatorContributor = manager.create({
        task_id,
        facilitator_id,
        contributor_ids: removeable_contributors,
      });
      return await manager.save(facilitatorContributor);
    }
  }
  /**
   * Finds facilitators of a task with pagination.
   * @param task_id The id of the task.
   * @param queryOption The query options for the facilitators.
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated result of facilitators.
   */
  async findPaginateTaskFacilitators(
    task_id: string,
    queryOption: QueryOptions<FacilitatorContributor>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<FacilitatorContributorDto>> {
    const options: any = {
      where: { ...queryOption.where, task_id: task_id },
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }
    return await this.paginationService.paginateWithOptionQuery(
      paginationDto,
      'facilitator_contributor',
      options,
    );
  }
  /**
   * Finds contributors of a task assigned to a facilitator with pagination.
   * @param task_id The id of the task.
   * @param facilitator_id The id of the facilitator.
   * @param paginationDto The pagination options.
   * @returns A promise that resolves to a paginated result of contributors.
   * @throws {BadRequestException} - If the facilitator is not found or not assigned to the task.
   */
  async findFacilitatorContributorsByTaskId(
    task_id: string,
    facilitator_id: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<User>> {
    const userTask: UserTask | null = await this.userTaskService.findOne({
      where: {
        task_id: task_id,
        user_id: facilitator_id,
        role: Role.FACILITATOR,
      },
    });
    if (!userTask) {
      throw new BadRequestException(
        `Facilitator not found or not assigned to the task`,
      );
    }
    const facilitatorContributors: FacilitatorContributor | null =
      await this.facilitatorContributorRepository.findOne({
        where: { task_id: task_id, facilitator_id: facilitator_id },
      });
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const offset_index = (page - 1) * limit;
    if (facilitatorContributors == null) {
      return { result: [], total: 0, page: page, limit: limit, totalPages: 0 };
    }
    const total_contributors = facilitatorContributors.contributor_ids.length;
    let endIdx = offset_index + limit;
    endIdx = endIdx > total_contributors ? total_contributors : endIdx;

    const sliced_contributors_id: string[] =
      facilitatorContributors.contributor_ids.slice(offset_index, endIdx);
    const contributors: User[] = await this.userService.findMany({
      where: { id: In(sliced_contributors_id) },
    });
    return paginate(contributors, total_contributors, page, limit);
  }
  /**
   * Finds the ids of all contributors assigned to a facilitator in a task.
   * If the facilitator is not found, it will return an empty array.
   * @param task_id The id of the task.
   * @param facilitator_id The id of the facilitator.
   * @returns A promise that resolves to an array of strings containing the ids of the contributors.
   */
  async findFacilitatorContributorIdsByTaskId(
    task_id: string,
    facilitator_id: string,
  ): Promise<string[]> {
    const facilitatorContributors: FacilitatorContributor | null =
      await this.facilitatorContributorRepository.findOne({
        where: { task_id: task_id, facilitator_id: facilitator_id },
      });
    return facilitatorContributors?.contributor_ids || [];
  }
  /**
   * Finds all facilitators of a task with their contributor ids.
   * @param task_id The id of the task.
   * @returns A promise that resolves to an array of facilitator contributor entities.
   */
  async findAllTaskFacilitators(
    task_id: string,
  ): Promise<FacilitatorContributor[]> {
    return this.facilitatorContributorRepository.find({
      where: { task_id: task_id },
      relations: { facilitator: true },
    });
  }
  /**
   * Removes contributors from a facilitator in a task.
   * @param task_id The id of the task.
   * @param facilitator_id The id of the facilitator.
   * @param contributor_ids The ids of the contributors to remove.
   * @throws {NotFoundException} - If the facilitator is not found.
   * @returns A promise that resolves to the saved facilitator contributor entity.
   */
  async removeContributorsFromFacilitator(
    task_id: string,
    facilitator_id: string,
    contributor_ids: string[],
  ) {
    const facilitatorContributors: FacilitatorContributor | null =
      await this.facilitatorContributorRepository.findOne({
        where: { task_id: task_id, facilitator_id: facilitator_id },
      });
    if (!facilitatorContributors) {
      throw new NotFoundException(`Facilitator not found`);
    }
    facilitatorContributors.contributor_ids =
      facilitatorContributors.contributor_ids.filter(
        (contributor_id) => !contributor_ids.includes(contributor_id),
      );
    return await this.facilitatorContributorRepository.save(
      facilitatorContributors,
    );
  }
  async remove(id: number): Promise<void> {
    await this.facilitatorContributorRepository.delete(id);
  }
}
