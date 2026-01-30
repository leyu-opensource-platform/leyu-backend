import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dialect } from '../entities/Dialect.entity';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { PaginationService } from 'src/common/service/pagination.service';
import { Language } from '../entities/Language.entity';
import { LanguageService } from './Language.service';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { QueryOptions } from 'src/utils/queryOption.util';

@Injectable()
export class DialectService {
  constructor(
    @InjectRepository(Dialect)
    private readonly dialectRepository: Repository<Dialect>,
    private readonly paginationService: PaginationService<Dialect>,
    private readonly languageService: LanguageService,
  ) {
    this.paginationService = new PaginationService<Dialect>(
      this.dialectRepository,
    );
  }

  async findOne(
    query: any,
    queryRunner?: QueryRunner,
  ): Promise<Dialect | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Dialect, {
        where: query,
        relations: { language: true },
      });
    } else {
      return await this.dialectRepository.findOne({
        where: query,
        relations: { language: true },
      });
    }
  }
  async findPaginate(
    queryOption: QueryOptions<Dialect>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Dialect>> {
    return this.paginationService.paginateWithOptionQuery(
      paginationDto,
      'dialect',
      queryOption,
    );
  }
  async findMany(
    query: FindOptionsWhere<Dialect>,
    queryRunner?: QueryRunner,
  ): Promise<Dialect[]> {
    if (queryRunner) {
      return await queryRunner.manager.find(Dialect, {
        where: query,
        relations: { language: true },
      });
    } else {
      return await this.dialectRepository.find({
        where: query,
        relations: { language: true },
      });
    }
  }

  async create(
    dialectData: Partial<Dialect>,
    queryRunner?: QueryRunner,
  ): Promise<Dialect> {
    const language: Language | null = await this.languageService.findOne(
      { id: dialectData.language_id },
      queryRunner,
    );
    const dialect = await this.dialectRepository.findOne({
      where: { name: dialectData.name },
      withDeleted: true,
    });
    if (dialect) {
      if (dialect.deletedAt == null) {
        throw new BadRequestException('Dialect already exists');
      }
      await this.dialectRepository.restore(dialect.id);
      return dialect;
    }
    if (!language) {
      throw new NotFoundException('Language not found');
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      const dialect = manager.create(Dialect, dialectData);
      return await manager.save(Dialect, dialect);
    } else {
      const dialect = this.dialectRepository.create(dialectData);
      return await this.dialectRepository.save(dialect);
    }
  }

  async update(
    id: any,
    dialectData: Partial<Dialect>,
    queryRunner?: QueryRunner,
  ) {
    const dialect = await this.dialectRepository.preload({
      id,
      ...dialectData,
    });
    if (!dialect) {
      throw new NotFoundException('Dialect not found');
    }
    delete dialectData.id;
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.save(Dialect, dialect);
    } else {
      return await this.dialectRepository.save(dialect);
    }
  }

  async delete(id: any): Promise<boolean> {
    const dialect = await this.dialectRepository.findOne({ where: { id } });
    if (!dialect) {
      throw new NotFoundException('Dialect not found');
    }
    await this.dialectRepository.softDelete({ id });
    return true;
  }
  async count(queryOption: QueryOptions<Dialect>, role_name?: string) {
    return this.dialectRepository.count(queryOption);
  }
}
