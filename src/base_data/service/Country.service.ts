import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../entities/Country.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly paginationService: PaginationService<Country>,
  ) {
    this.paginationService = new PaginationService<Country>(
      this.countryRepository,
    );
  }
  async onModuleInit() {
    // await this.initCountries();
  }

  async findOne(
    query: any,
    queryRunner?: QueryRunner,
  ): Promise<Country | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Country, { where: query });
    } else {
      const manager = this.countryRepository;
      return await manager.findOne({
        where: query,
      });
    }
  }

  async findMany(query: any, queryRunner?: QueryRunner): Promise<Country[]> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.find(Country, { where: query });
    } else {
      const manager = this.countryRepository;
      return await manager.find({
        where: query,
      });
    }
  }

  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Country>> {
    return this.paginationService.paginate(paginationDto, 'country');
  }
  async create(
    countryData: Partial<Country>,
    queryRunner?: QueryRunner,
  ): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { name: countryData.name },
      withDeleted: true,
    });
    if (country) {
      if (country.deletedAt == null) {
        throw new BadRequestException('Country already exists');
      }
      await this.countryRepository.restore(country.id);
      return country;
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      const country = manager.create(Country, countryData);
      if (!country) {
        throw new NotFoundException('Country not found');
      }
      return await manager.save(Country, country);
    } else {
      const manager = this.countryRepository;
      const country = manager.create(countryData);
      return await manager.save(country);
    }
  }

  async update(
    id: string,
    countryData: Partial<Country>,
    queryRunner?: QueryRunner,
  ) {
    delete countryData.id;
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.update(Country, id, countryData);
      return await manager.findOne(Country, { where: { id } });
    } else {
      const manager = this.countryRepository;
      await manager.update(id, countryData);
      return await manager.findOne({ where: { id } });
    }
  }

  async delete(id: any, queryRunner?: QueryRunner): Promise<boolean> {
    const manager = this.countryRepository;
    await manager.softDelete({ id });
    return true;
  }
  async initCountries(): Promise<void> {
    // give me random uuid
    const ethiopia_uuid = 'c5d1d1d1-1d1d-1d1d-1d1d-1d1d1d1d1d1d';
    try {
      await this.countryRepository.upsert(
        { id: ethiopia_uuid, name: 'Ethiopia' },
        { conflictPaths: ['name'] },
      );
      Logger.log('Countries are initialized');
      return;
    } catch (error) {
      Logger.error('Failed to initialize countries', error);
    }
  }
}
