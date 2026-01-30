import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { Zone } from '../entities/Zone.entity';
import { RegionService } from './Region.service';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    private readonly regionService: RegionService,
    private readonly paginationService: PaginationService<Zone>,
  ) {
    this.paginationService = new PaginationService<Zone>(this.zoneRepository);
  }

  async findAll(query: FindOptionsWhere<Zone>): Promise<Zone[]> {
    return await this.zoneRepository.find({ where: query });
  }

  async findOne(query: FindOptionsWhere<Zone>): Promise<Zone | null> {
    return await this.zoneRepository.findOne({
      where: query,
      relations: { region: true },
    });
  }
  async findPaginate(
    queryOption: QueryOptions<Zone>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Zone>> {
    return this.paginationService.paginateWithOptionQuery(
      paginationDto,
      'zone',
      queryOption,
    );
  }

  async create(zone: Partial<Zone>, queryRunner?: QueryRunner): Promise<Zone> {
    const region = await this.regionService.findOne({ id: zone.region_id });
    const zoneBefore = await this.zoneRepository.findOne({
      where: { name: zone.name },
      withDeleted: true,
    });
    if (zoneBefore && zoneBefore.deletedAt) {
      await this.zoneRepository.restore(zoneBefore.id);
      return zoneBefore;
    }
    if (zoneBefore) {
      throw new BadRequestException('Zone already exist');
    }
    if (!region) {
      throw new NotFoundException('Region Not Found');
    }

    if (queryRunner) {
      const manager = queryRunner.manager;
      const zone_created = manager.create(Zone, zone);
      return await manager.save(zone_created);
    } else {
      return await this.zoneRepository.save(zone);
    }
  }

  async update(
    id: string,
    zoneData: Partial<Zone>,
    queryRunner?: QueryRunner,
  ): Promise<Zone> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const zone = await manager.preload(Zone, { id, ...zoneData });
      if (!zone) {
        throw new NotFoundException('Sector not found');
      }
      return await manager.save(Zone, zone);
    } else {
      const zone = await this.zoneRepository.preload({ id, ...zoneData });
      if (!zone) {
        throw new NotFoundException('Sector not found');
      }
      return await this.zoneRepository.save(zone);
    }
  }

  async remove(id: string): Promise<void> {
    await this.zoneRepository.softDelete({ id });
  }
}
