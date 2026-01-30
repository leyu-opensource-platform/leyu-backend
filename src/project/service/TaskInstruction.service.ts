import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { TaskInstruction } from '../entities/TaskInstruction.entity';
import { PaginatedResult } from 'src/utils/paginate.util';

@Injectable()
export class TaskInstructionService {
  constructor(
    @InjectRepository(TaskInstruction)
    private readonly taskInstructionRepository: Repository<TaskInstruction>,
    private readonly paginateService: PaginationService<TaskInstruction>,
  ) {
    this.paginateService = new PaginationService<TaskInstruction>(
      this.taskInstructionRepository,
    );
  }

  async create(
    taskInstructionData: Partial<TaskInstruction>,
    queryRunner?: QueryRunner,
  ): Promise<TaskInstruction> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const taskInstruction = manager.create(
        TaskInstruction,
        taskInstructionData,
      );
      return await manager.save(TaskInstruction, taskInstruction);
    } else {
      const manager = this.taskInstructionRepository;
      const taskInstruction = manager.create(taskInstructionData);
      return await manager.save(taskInstruction);
    }
  }

  async findAll(
    queryOption: QueryOptions<TaskInstruction>,
    queryRunner?: QueryRunner,
  ): Promise<TaskInstruction[]> {
    return await this.taskInstructionRepository.find(queryOption);
  }

  async findPaginate(
    queryOption: QueryOptions<TaskInstruction>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TaskInstruction>> {
    return await this.paginateService.paginateWithOptionQuery(
      paginationDto,
      'task_instruction',
      queryOption,
    );
  }

  async findOne(
    queryOption: QueryOptions<TaskInstruction>,
    // queryRunner?: QueryRunner,
  ): Promise<TaskInstruction | null> {
    return await this.taskInstructionRepository.findOne(queryOption);
  }

  async update(
    id: string,
    taskInstructionData: Partial<TaskInstruction>,
    queryRunner?: QueryRunner,
  ): Promise<TaskInstruction | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.update(TaskInstruction, id, taskInstructionData);
      return await manager.findOne(TaskInstruction, { where: { id } });
    } else {
      const manager = this.taskInstructionRepository;
      await manager.update(id, taskInstructionData);
      return await manager.findOne({ where: { id } });
    }
  }

  async remove(id: string): Promise<any> {
    await this.taskInstructionRepository.delete(id);
    return;
  }
}
