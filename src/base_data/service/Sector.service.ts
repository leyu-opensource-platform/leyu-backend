import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sector } from '../entities/Sector.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';

@Injectable()
export class SectorService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    private readonly paginationService: PaginationService<Sector>,
  ) {
    this.paginationService = new PaginationService<Sector>(
      this.sectorRepository,
    );
  }

  async findOne(query: any, queryRunner?: QueryRunner): Promise<Sector | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Sector, { where: query });
    } else {
      return await this.sectorRepository.findOne({ where: query });
    }
  }
  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Sector>> {
    return this.paginationService.paginate(paginationDto, 'sector');
  }
  async findMany(query: any, queryRunner?: QueryRunner): Promise<Sector[]> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.find(Sector, { where: query });
    } else {
      return await this.sectorRepository.find({ where: query });
    }
  }

  async create(
    sectorData: Partial<Sector>,
    queryRunner?: QueryRunner,
  ): Promise<Sector> {
    const sector: Sector | null = await this.sectorRepository.findOne({
      where: { name: sectorData.name },
      withDeleted: true,
    });
    if (sector) {
      if (sector.deletedAt == null) {
        throw new BadRequestException('Sector already exists');
      }
      await this.sectorRepository.restore(sector.id);
      return sector;
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      const sector = manager.create(Sector, sectorData);
      return await manager.save(Sector, sector);
    } else {
      const sector = this.sectorRepository.create(sectorData);
      return await this.sectorRepository.save(sector);
    }
  }

  async update(
    id: any,
    sectorData: Partial<Sector>,
    queryRunner?: QueryRunner,
  ) {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const sector = await manager.preload(Sector, { id, ...sectorData });
      if (!sector) {
        throw new NotFoundException('Sector not found');
      }
      return await manager.save(Sector, sector);
    } else {
      const sector = await this.sectorRepository.preload({ id, ...sectorData });
      if (!sector) {
        throw new NotFoundException('Sector not found');
      }
      return await this.sectorRepository.save(sector);
    }
  }

  async delete(id: any): Promise<boolean> {
    const sector = await this.sectorRepository.findOne({ where: { id } });
    if (!sector) {
      throw new NotFoundException('Sector not found');
    }
    await this.sectorRepository.softDelete({ id });
    return true;
  }
}
