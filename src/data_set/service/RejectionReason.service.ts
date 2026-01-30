import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { DataSet } from '../entities/DataSet.entity';
import { RejectionReason } from '../entities/RejectionReason.entity';
import { PaginatedResult } from 'src/utils/paginate.util';
@Injectable()
export class RejectionReasonService {
  constructor(
    @InjectRepository(RejectionReason)
    private readonly rejectionReasonRepository: Repository<RejectionReason>,

    private readonly paginateService: PaginationService<RejectionReason>,
  ) {
    this.paginateService = new PaginationService<RejectionReason>(
      this.rejectionReasonRepository,
    );
  }

  async create(
    rejectionReason: Partial<RejectionReason>,
    queryRunner?: QueryRunner,
  ): Promise<RejectionReason> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const data = manager.create(RejectionReason, rejectionReason);
      return await manager.save(RejectionReason, data);
    } else {
      const manager = this.rejectionReasonRepository;
      const data = manager.create(rejectionReason);
      return await manager.save(data);
    }
  }
  async createBulk(
    rejectionReason: Partial<RejectionReason>[],
    queryRunner?: QueryRunner,
  ) {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const data = manager.create(RejectionReason, rejectionReason);
      return await manager.save(RejectionReason, data);
    } else {
      const manager = this.rejectionReasonRepository;
      const data = manager.create(rejectionReason);
      return await manager.save(data);
    }
  }

  async findAll(
    queryOption: QueryOptions<RejectionReason>,
    queryRunner?: QueryRunner,
  ): Promise<RejectionReason[]> {
    const options: any = {
      where: queryOption.where,
      order: queryOption.order || {},
      relations: queryOption.relations || [],
    };
    if (queryOption.select) {
      options.select = queryOption.select;
    }
    const manager = queryRunner
      ? queryRunner.manager
      : this.rejectionReasonRepository;
    return await manager.find(options);
  }

  async findPaginate(
    queryOption: QueryOptions<DataSet>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<RejectionReason>> {
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
      'rejection_reason',
      queryOption,
    );
  }

  async findOne(
    queryOption: QueryOptions<DataSet>,
    queryRunner?: QueryRunner,
  ): Promise<RejectionReason | null> {
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
      return await manager.findOne(RejectionReason, options);
    }

    const manager = this.rejectionReasonRepository;
    return await manager.findOne(options);
  }

  async update(
    id: string,
    dataSet: Partial<RejectionReason>,
    queryRunner?: QueryRunner,
  ): Promise<RejectionReason | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.update(RejectionReason, id, dataSet);
      return await manager.findOne(RejectionReason, { where: { id } });
    } else {
      const manager = this.rejectionReasonRepository;
      await manager.update(id, dataSet);
      return await manager.findOne({ where: { id } });
    }
  }

  async remove(id: string): Promise<void> {
    await this.rejectionReasonRepository.delete(id);
    return;
  }
}
