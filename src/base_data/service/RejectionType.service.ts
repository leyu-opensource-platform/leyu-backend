import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RejectionType } from '../entities/RejectionType.entity';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';

@Injectable()
export class RejectionTypeService {
  constructor(
    @InjectRepository(RejectionType)
    private rejectionTypeRepository: Repository<RejectionType>,
    private readonly paginationService: PaginationService<RejectionType>,
  ) {
    this.paginationService = new PaginationService<RejectionType>(
      this.rejectionTypeRepository,
    );
  }

  async create(rejectionType: Partial<RejectionType>): Promise<RejectionType> {
    const rejection: RejectionType | null =
      await this.rejectionTypeRepository.findOne({
        where: { name: rejectionType.name },
        withDeleted: true,
      });
    if (rejection) {
      if (rejection.deletedAt == null) {
        throw new BadRequestException('Language already exist');
      }
      await this.rejectionTypeRepository.restore(rejection.id);
      return rejection;
    }
    return await this.rejectionTypeRepository.save(rejectionType);
  }

  async findAll(query: Partial<RejectionType>): Promise<RejectionType[]> {
    return await this.rejectionTypeRepository.find({ where: query });
  }
  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<RejectionType>> {
    return this.paginationService.paginate(paginationDto, 'rejection_type');
  }
  async findOne(query: Partial<RejectionType>): Promise<RejectionType | null> {
    return await this.rejectionTypeRepository.findOne({ where: query });
  }

  async update(
    id: string,
    rejectionType: Partial<RejectionType>,
  ): Promise<RejectionType | null> {
    delete rejectionType.id;
    const manager = this.rejectionTypeRepository;
    await manager.update(id, rejectionType);
    return await manager.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.rejectionTypeRepository.softDelete({ id });
  }
}
