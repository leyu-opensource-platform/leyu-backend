import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from '../entities/Language.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    private readonly paginationService: PaginationService<Language>,
  ) {
    this.paginationService = new PaginationService<Language>(
      this.languageRepository,
    );
  }
  async onModuleInit() {
    // await this.createEthiopianLanguage();
  }
  // Create Basic Ethiopian Language on Init
  async createEthiopianLanguage(): Promise<void> {
    const languages = [
      { name: 'Amharic', code: 'am' },
      { name: 'Tigrinya', code: 'ti' },
      { name: 'AfanOromo', code: 'om' },
      { name: 'Sidama', code: 'sid' },
      { name: 'Somali', code: 'so' },
    ];
    try {
      await Promise.all(
        languages.map(async (language) => {
          await this.languageRepository.upsert(
            { name: language.name, code: language.code },
            { conflictPaths: ['name'] },
          );
        }),
      );
      Logger.log('Ethiopian Language created successfully');
      return;
    } catch (error) {
      Logger.error('Failed to create Ethiopian Language', error);
    }
  }

  async findOne(
    query: any,
    queryRunner?: QueryRunner,
  ): Promise<Language | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Language, { where: query });
    } else {
      return await this.languageRepository.findOne({ where: query });
    }
  }
  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Language>> {
    return this.paginationService.paginate(paginationDto, 'language');
  }
  async findMany(query: any, queryRunner?: QueryRunner): Promise<Language[]> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.find(Language, { where: query });
    } else {
      return await this.languageRepository.find({ where: query });
    }
  }

  async create(
    languageData: Partial<Language>,
    queryRunner?: QueryRunner,
  ): Promise<Language> {
    const language: Language | null = await this.languageRepository.findOne({
      where: { name: languageData.name },
      withDeleted: true,
    });
    if (language) {
      if (language.deletedAt == null) {
        throw new BadRequestException('Language already exist');
      }
      await this.languageRepository.restore(language.id);
      return language;
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      const language = manager.create(Language, languageData);
      return await manager.save(Language, language);
    } else {
      const language = this.languageRepository.create(languageData);
      return await this.languageRepository.save(language);
    }
  }

  async update(
    id: any,
    languageData: Partial<Language>,
    queryRunner?: QueryRunner,
  ) {
    delete languageData.id;
    if (queryRunner) {
      const manager = queryRunner.manager;
      const language = await manager.preload(Language, { id, ...languageData });
      if (!language) {
        throw new NotFoundException('Language not found');
      }
      return await manager.save(Language, language);
    } else {
      const language = await this.languageRepository.preload({
        id,
        ...languageData,
      });
      if (!language) {
        throw new NotFoundException('Language not found');
      }
      return await this.languageRepository.save(language);
    }
  }

  async delete(id: any, queryRunner?: QueryRunner): Promise<boolean> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException('Language not found');
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.softDelete(Language, { id });
      return true;
    } else {
      await this.languageRepository.softDelete({ id });
      return true;
    }
  }
  async count(queryOption: QueryOptions<Language>, role_name?: string) {
    return this.languageRepository.count(queryOption);
  }
}
