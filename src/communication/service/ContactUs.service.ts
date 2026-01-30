import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { ContactUs } from '../entities/ContactUs.entity';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private readonly contactUsRepository: Repository<ContactUs>,
    private readonly paginationService: PaginationService<ContactUs>,
  ) {
    this.paginationService = new PaginationService(this.contactUsRepository);
  }

  async findAll(
    query: Partial<ContactUs>,
    queryRunner?: QueryRunner,
  ): Promise<ContactUs[]> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.contactUsRepository;
    return await manager.find(ContactUs, { where: query });
  }

  async findOne(
    query: Partial<ContactUs>,
    queryRunner?: QueryRunner,
  ): Promise<ContactUs | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(ContactUs, { where: query });
    } else {
      const contactUs = await this.contactUsRepository.findOne({
        where: query,
      });
      return contactUs;
    }
  }

  async findManyPaginate(
    query: Partial<ContactUs>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<ContactUs>> {
    return await this.paginationService.paginate(
      paginationDto,
      'contact_us',
      query,
    );
  }

  async create(contactUs: Partial<ContactUs>): Promise<ContactUs> {
    return await this.contactUsRepository.save(contactUs);
  }

  async update(
    id: string,
    updateContactUsDto: Partial<ContactUs>,
  ): Promise<ContactUs> {
    const contactUs = await this.contactUsRepository.findOne({ where: { id } });
    if (!contactUs) {
      throw new NotFoundException(`ContactUs #${id} not found`);
    }
    return await this.contactUsRepository.save({
      ...contactUs,
      ...updateContactUsDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.contactUsRepository.delete(id);
  }
}
