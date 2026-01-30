import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from '../entities/Region.entity';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { CountryService } from './Country.service';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    private readonly countryService: CountryService,
    private readonly paginationService: PaginationService<Region>,
  ) {
    this.paginationService = new PaginationService<Region>(
      this.regionRepository,
    );
  }
  async onModuleInit() {
    // await this.initEthiopianRegions();
  }

  async findOne(query: any, queryRunner?: QueryRunner): Promise<Region | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return manager.findOne(Region, { where: query });
    } else {
      return await this.regionRepository.findOne({
        where: query,
        relations: { country: true },
      });
    }
  }

  async findMany(
    query: FindOptionsWhere<Region>,
    queryRunner?: QueryRunner,
  ): Promise<Region[]> {
    const manager = queryRunner ? queryRunner.manager : this.regionRepository;
    return await manager.find(Region, { where: query });
  }
  async findPaginate(
    queryOption: QueryOptions<Region>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Region>> {
    return this.paginationService.paginateWithOptionQuery(
      paginationDto,
      'region',
      queryOption,
    );
  }
  async create(
    regionData: Partial<Region>,
    queryRunner?: QueryRunner,
  ): Promise<Region> {
    const city = await this.countryService.findOne(
      { id: regionData.country_id },
      queryRunner,
    );
    if (!city) {
      throw new NotFoundException('Country not found');
    }
    const region: Region | null = await this.regionRepository.findOne({
      where: { name: regionData.name },
      withDeleted: true,
    });
    if (region) {
      if (region.deletedAt == null) {
        throw new BadRequestException('Region already exist');
      }
      await this.regionRepository.restore(region.id);
      return region;
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      const region = manager.create(Region, regionData);
      return await manager.save(Region, region);
    } else {
      const region = this.regionRepository.create(regionData);
      return await this.regionRepository.save(region);
    }
  }

  async update(
    id: any,
    regionData: Partial<Region>,
    queryRunner?: QueryRunner,
  ) {
    delete regionData.id;
    if (queryRunner) {
      const manager = queryRunner.manager;
      const region = await manager.preload(Region, { id, ...regionData });
      if (!region) {
        throw new NotFoundException('Region not found');
      }
      return await manager.save(Region, region);
    } else {
      const region = await this.regionRepository.preload({ id, ...regionData });
      if (!region) {
        throw new NotFoundException('Region not found');
      }
      return await this.regionRepository.save(region);
    }
  }

  async delete(id: any): Promise<boolean> {
    const region = await this.regionRepository.findOne({ where: { id } });
    if (!region) {
      throw new NotFoundException('Region not found');
    }
    await this.regionRepository.softDelete({ id });
    return true;
  }

  async initEthiopianRegions(): Promise<void> {
    const ethiopia_uuid = 'c5d1d1d1-1d1d-1d1d-1d1d-1d1d1d1d1d1d';
    const EthiopianRegions = [
      {
        name: 'Addis Ababa',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Oromia',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Afar',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Amhara',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Central Ethiopia',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Oromia',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Somali',
        country_id: ethiopia_uuid,
      },
      {
        name: 'South West Ethiopia',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Tigray',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Gambella',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Benishangul-Gumuz Region',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Dire Dawa',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Sidama',
        country_id: ethiopia_uuid,
      },
      {
        name: 'Harari',
        country_id: ethiopia_uuid,
      },
    ];
    await Promise.all(
      EthiopianRegions.map(async (region) => {
        await this.regionRepository.upsert(region, { conflictPaths: ['name'] });
      }),
    );
    Logger.log('Regions are initialized');
    return;
  }
}
