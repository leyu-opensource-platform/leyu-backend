import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { AnnotationType } from '../entities/AnnotationType.entity';
@Injectable()
export class AnnotationTypeService {
  constructor(
    @InjectRepository(AnnotationType)
    private annotationTypeRepository: Repository<AnnotationType>,
    private readonly paginationService: PaginationService<AnnotationType>,
  ) {
    this.paginationService = new PaginationService<AnnotationType>(
      this.annotationTypeRepository,
    );
  }

  async create(
    rejectionType: Partial<AnnotationType>,
  ): Promise<AnnotationType> {
    const rejection: AnnotationType | null =
      await this.annotationTypeRepository.findOne({
        where: { name: rejectionType.name },
        withDeleted: true,
      });
    if (rejection) {
      if (rejection.deletedAt == null) {
        throw new BadRequestException('Annotation already exist');
      }
      await this.annotationTypeRepository.restore(rejection.id);
      return rejection;
    }
    return await this.annotationTypeRepository.save(rejectionType);
  }

  async findAll(query: Partial<AnnotationType>): Promise<AnnotationType[]> {
    return await this.annotationTypeRepository.find({ where: query });
  }
  async findPaginate(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<AnnotationType>> {
    return this.paginationService.paginate(paginationDto, 'annotation_type');
  }
  async findOne(
    query: Partial<AnnotationType>,
  ): Promise<AnnotationType | null> {
    return await this.annotationTypeRepository.findOne({ where: query });
  }

  async update(
    id: string,
    annotationType: Partial<AnnotationType>,
  ): Promise<AnnotationType | null> {
    delete annotationType.id;
    const manager = this.annotationTypeRepository;
    await manager.update(id, annotationType);
    return await manager.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.annotationTypeRepository.softDelete({ id });
  }
}
