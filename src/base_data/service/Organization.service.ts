import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '../entities/Organization.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly paginationService: PaginationService<Organization>,
  ) {
    this.paginationService = new PaginationService<Organization>(
      this.organizationRepository,
    );
  }

  async findOne(
    query: any,
    queryRunner?: QueryRunner,
  ): Promise<Organization | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.findOne(Organization, { where: query });
    } else {
      return await this.organizationRepository.findOne({ where: query });
    }
  }
  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Organization>> {
    return this.paginationService.paginate(paginationDto, 'organization');
  }
  async findMany(
    query: any,
    queryRunner?: QueryRunner,
  ): Promise<Organization[]> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.find(Organization, { where: query });
    } else {
      return await this.organizationRepository.find({ where: query });
    }
  }

  async create(
    organizationData: Partial<Organization>,
    queryRunner?: QueryRunner,
  ): Promise<Organization> {
    const organization: Organization | null =
      await this.organizationRepository.findOne({
        where: { name: organizationData.name },
        withDeleted: true,
      });
    if (organization) {
      if (organization.deletedAt == null) {
        throw new BadRequestException('Organization already exist');
      }
      await this.organizationRepository.restore(organization.id);
      return organization;
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      const organization = manager.create(Organization, organizationData);
      return await manager.save(Organization, organization);
    } else {
      const organization = this.organizationRepository.create(organizationData);
      return await this.organizationRepository.save(organization);
    }
  }

  async update(
    id: any,
    organizationData: Partial<Organization>,
    queryRunner?: QueryRunner,
  ) {
    delete organizationData.id;
    const organization = await this.organizationRepository.preload({
      id,
      ...organizationData,
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (queryRunner) {
      const manager = queryRunner.manager;
      return await manager.save(Organization, organization);
    } else {
      return await this.organizationRepository.save(organization);
    }
  }

  async delete(id: any): Promise<boolean> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    await this.organizationRepository.softDelete({ id });
    return true;
  }
}
