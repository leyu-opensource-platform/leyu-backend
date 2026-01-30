import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationService } from 'src/common/service/pagination.service';
import { DataSetAnnotation } from '../entities/DataSetAnnotation.entity';
import { QueryOptions } from 'src/utils/queryOption.util';
@Injectable()
export class DataSetAnnotationService {
  constructor(
    @InjectRepository(DataSetAnnotation)
    private dataSetAnnotationRepository: Repository<DataSetAnnotation>,
    private readonly paginationService: PaginationService<DataSetAnnotation>,
  ) {
    this.paginationService = new PaginationService<DataSetAnnotation>(
      this.dataSetAnnotationRepository,
    );
  }

  async create(
    annotationData: Partial<DataSetAnnotation>,
  ): Promise<DataSetAnnotation> {
    const annotation: DataSetAnnotation | null =
      await this.dataSetAnnotationRepository.findOne({
        where: { name: annotationData.name },
        withDeleted: true,
      });
    if (annotation) {
      if (annotation.deletedAt == null) {
        throw new BadRequestException('Annotation already exist');
      }
      await this.dataSetAnnotationRepository.restore(annotation.id);
      return annotation;
    }
    return await this.dataSetAnnotationRepository.save(annotationData);
  }

  async findAll(
    query: Partial<DataSetAnnotation>,
  ): Promise<DataSetAnnotation[]> {
    return await this.dataSetAnnotationRepository.find({ where: query });
  }
  async findPaginate(
    queryOption: QueryOptions<DataSetAnnotation>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<DataSetAnnotation>> {
    return this.paginationService.paginateWithOptionQuery(
      paginationDto,
      'annotation',
      queryOption,
    );
  }
  async findOne(
    query: Partial<DataSetAnnotation>,
  ): Promise<DataSetAnnotation | null> {
    return await this.dataSetAnnotationRepository.findOne({ where: query });
  }

  async update(
    id: string,
    annotationType: Partial<DataSetAnnotation>,
  ): Promise<DataSetAnnotation | null> {
    delete annotationType.id;
    const manager = this.dataSetAnnotationRepository;
    await manager.update(id, annotationType);
    return await manager.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.dataSetAnnotationRepository.softDelete({ id });
  }
}
