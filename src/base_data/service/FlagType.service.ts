import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { FlagType } from '../entities/FlagType.entity';
@Injectable()
export class FlagTypeService {
  constructor(
    @InjectRepository(FlagType)
    private flagTypeRepository: Repository<FlagType>,
    private readonly paginationService: PaginationService<FlagType>,
  ) {
    this.paginationService = new PaginationService<FlagType>(
      this.flagTypeRepository,
    );
  }

  async create(rejectionType: Partial<FlagType>): Promise<FlagType> {
    const rejection: FlagType | null = await this.flagTypeRepository.findOne({
      where: { name: rejectionType.name },
      withDeleted: true,
    });
    if (rejection) {
      if (rejection.deletedAt == null) {
        throw new BadRequestException('Language already exist');
      }
      await this.flagTypeRepository.restore(rejection.id);
      return rejection;
    }
    return await this.flagTypeRepository.save(rejectionType);
  }

  async findAll(query: Partial<FlagType>): Promise<FlagType[]> {
    return await this.flagTypeRepository.find({ where: query });
  }
  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<FlagType>> {
    return this.paginationService.paginate(paginationDto, 'rejection_type');
  }
  async findOne(query: Partial<FlagType>): Promise<FlagType | null> {
    return await this.flagTypeRepository.findOne({ where: query });
  }

  async update(
    id: string,
    flagType: Partial<FlagType>,
  ): Promise<FlagType | null> {
    delete flagType.id;
    const manager = this.flagTypeRepository;
    await manager.update(id, flagType);
    return await manager.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.flagTypeRepository.softDelete({ id });
  }
}
