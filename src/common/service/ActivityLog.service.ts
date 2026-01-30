import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { ActivityLogs } from '../entities/ActivityLogs.entity';
import { PaginatedResult } from 'src/utils/paginate.util';
import { PaginationDto } from '../dto/Pagination.dto';
import { PaginationService } from '../service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLogs)
    private readonly activityLogsRepository: Repository<ActivityLogs>,
    private readonly paginationService: PaginationService<ActivityLogs>,
  ) {
    this.paginationService = new PaginationService<ActivityLogs>(
      this.activityLogsRepository,
    );
  }

  async create(
    activityLog: Partial<ActivityLogs>,
    queryRunner?: QueryRunner,
  ): Promise<ActivityLogs> {
    if (queryRunner) {
      const activity = queryRunner.manager.create(ActivityLogs, activityLog);
      return queryRunner.manager.save(activity);
    } else {
      return this.activityLogsRepository.save(activityLog);
    }
  }

  async find(
    query: PaginationDto,
    queryOptions: QueryOptions<ActivityLogs>,
  ): Promise<PaginatedResult<ActivityLogs>> {
    return this.paginationService.paginateWithOptionQuery(
      { page: query.page || 1, limit: query.limit || 10 },
      'activity_logs',
      queryOptions,
    );
  }
}
