import {
  Controller,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  Get,
  ParseUUIDPipe,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  getSchemaPath,
  ApiProperty,
} from '@nestjs/swagger';
import { ReviewerTaskService } from '../service/ReviewerTasks.service';
import { FindReviewerDataSetDto } from 'src/data_set/dto/DataSet.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
import { PaginatedResult } from 'src/utils/paginate.util';
import { DataSetSanitize } from 'src/data_set/sanitize';
import {
  ApproveDataSetDto,
  BulkApproveDataSetDto,
  BulkRejectDataSetDto,
  BulkActionResultDto,
  ReviewDetailRto,
} from '../dto/DataSet.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { ActivityLogService } from 'src/common/service/ActivityLog.service';
import {
  ActivityEntityType,
  ActivityLogActions,
} from 'src/utils/constants/ActivityLog.actions';
import { PublisherService } from 'src/common/service/RabbitPublish.service';
import { CreateRejectionDto } from 'src/data_set/dto/RejectionReason.dto';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { GetQAMicroTasksDto } from '../dto/Task.dto';

// Structural shape shared by CreateRejectionDto (single-item) and
// BulkRejectDataSetDto (adds `ids`) -- lets the same private per-item reject
// helpers accept either without the extra `ids` field tripping strict typing.
type RejectionInput = {
  rejection_type_ids: string[];
  flag?: boolean;
  comment?: string;
  flag_type_ids?: string[];
  is_uncertain?: boolean;
};

@Controller('reviewer-task')
@ApiTags('Reviewer Tasks ')
@ApiBearerAuth()
export class ReviewerTaskDistributionController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reviewerTaskService: ReviewerTaskService,
    private readonly activityLogService: ActivityLogService,
    private readonly publishService: PublisherService,
  ) {}
  // @Get('my-tasks')
  // async getContributorTasks(@Param('task_id', ParseUUIDPipe) task_id: string) {
  //   return this.reviewerTaskDistributionService.findPendingSubmissionsWithReviewCount(
  //    task_id
  //   );
  // }
  @Get('my-tasks/:task_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  @ApiResponse({
    status: 200,
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResult) },
        {
          properties: {
            result: {
              type: 'array',
              items: { $ref: getSchemaPath(DataSetSanitize) },
            },
          },
        },
      ],
    },
  })
  async getReviewerTasks(
    @Param('task_id', ParseUUIDPipe) task_id: string,
    @Query() query: FindReviewerDataSetDto,
    @Request() req: any,
  ) {
    const reviewerId = req.user.id;
    return this.reviewerTaskService.getReviewerTasksWithPresignedUrl(
      task_id,
      reviewerId,
      query,
    );
  }

  private async approveOne(id: string, body: ApproveDataSetDto, req): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.reviewerTaskService.approveDataSet(
        id,
        req.user.id,
        queryRunner,
        body.annotationIds,
        body.is_uncertain,
      );
      await this.activityLogService.create({
        user_id: req.user.id,
        action: ActivityLogActions.APPROVE_DATASET,
        metadata: '',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        entity_type: ActivityEntityType.DATASET,
        entity_id: id,
      });
      await queryRunner.commitTransaction();

      await this.publishService.publishDatasetAction({
        action: 'APPROVED',
        datasetReviewId: id,
        actorId: req.user.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (queryRunner && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }

  @Put('/approve/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ApproveDataSetDto,
    @Request() req,
  ) {
    await this.approveOne(id, body, req);
    return {
      message: 'Data set approved successfully',
    };
  }

  @Put('/bulk-approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  async bulkApprove(
    @Body() body: BulkApproveDataSetDto,
    @Request() req,
  ): Promise<BulkActionResultDto> {
    return this.runBulk(body.ids, (id) => this.approveOne(id, body, req));
  }

  private async rejectOne(
    id: string,
    rejectionReason: RejectionInput,
    req,
  ): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const rejectionReasons = rejectionReason.rejection_type_ids.map((r) => {
      return {
        data_set_review_id: id,
        rejection_type_id: r,
      };
    });
    try {
      const reject = await this.reviewerTaskService.rejectDataSet(
        id,
        rejectionReasons,
        req.user.id,
        queryRunner,
        rejectionReason.flag,
        rejectionReason.comment,
        rejectionReason.flag_type_ids,
        rejectionReason.is_uncertain,
      );
      await this.activityLogService.create({
        user_id: req.user.id,
        action: ActivityLogActions.REJECT_DATASET,
        metadata: '',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        entity_type: ActivityEntityType.DATASET,
        entity_id: id,
      });
      await queryRunner.commitTransaction();
      await this.publishService.publishDatasetAction({
        action: 'REJECTED',
        datasetReviewId: id,
        actorId: req.user.id,
        timestamp: new Date().toISOString(),
      });
      return reject;
    } catch (error) {
      if (queryRunner && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }

  @Put('/reject/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectionReason: CreateRejectionDto,
    @Request() req,
  ) {
    return this.rejectOne(id, rejectionReason, req);
  }

  @Put('/bulk-reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  async bulkReject(
    @Body() body: BulkRejectDataSetDto,
    @Request() req,
  ): Promise<BulkActionResultDto> {
    return this.runBulk(body.ids, (id) => this.rejectOne(id, body, req));
  }

  /**
   * Runs an action against each id independently (own transaction per id via
   * the underlying service call), so one failure doesn't roll back the
   * whole batch -- partial success is reported back rather than all-or-nothing.
   */
  private async runBulk(
    ids: string[],
    action: (id: string) => Promise<any>,
  ): Promise<BulkActionResultDto> {
    const succeeded: string[] = [];
    const failed: { id: string; error: string }[] = [];
    for (const id of ids) {
      try {
        await action(id);
        succeeded.push(id);
      } catch (error: any) {
        failed.push({ id, error: error?.message || 'Unknown error' });
      }
    }
    return { succeeded, failed };
  }

  private async approveByProjectManagerOne(
    id: string,
    body: ApproveDataSetDto,
    req,
  ): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.reviewerTaskService.approveDataSetProjectManager(
        id,
        req.user.id,
        queryRunner,
        body.annotationIds,
      );
      await this.activityLogService.create({
        user_id: req.user.id,
        action: ActivityLogActions.APPROVE_DATASET,
        metadata: '',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        entity_type: ActivityEntityType.DATASET,
        entity_id: id,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }

  @Put('/pm/approve/:dataset_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  async approveByProjectManager(
    @Param('dataset_id', ParseUUIDPipe) id: string,
    @Body() body: ApproveDataSetDto,
    @Request() req,
  ) {
    await this.approveByProjectManagerOne(id, body, req);
    return {
      message: 'Data set approved successfully',
    };
  }

  @Put('/pm/bulk-approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  async bulkApproveByProjectManager(
    @Body() body: BulkApproveDataSetDto,
    @Request() req,
  ): Promise<BulkActionResultDto> {
    return this.runBulk(body.ids, (id) =>
      this.approveByProjectManagerOne(id, body, req),
    );
  }

  private async rejectByProjectManagerOne(
    id: string,
    rejectionReason: RejectionInput,
    req,
  ): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reject = await this.reviewerTaskService.rejectByProjectManager(
        id,
        rejectionReason.rejection_type_ids,
        req.user.id,
        queryRunner,
        rejectionReason.flag,
        rejectionReason.comment,
        rejectionReason.is_uncertain,
      );
      await this.activityLogService.create({
        user_id: req.user.id,
        action: ActivityLogActions.REJECT_DATASET,
        metadata: '',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        entity_type: ActivityEntityType.DATASET,
        entity_id: id,
      });
      await queryRunner.commitTransaction();
      return reject;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }

  @Put('/pm/reject/:dataset_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  async rejectByProjectManager(
    @Param('dataset_id', ParseUUIDPipe) id: string,
    @Body() rejectionReason: CreateRejectionDto,
    @Request() req,
  ) {
    return this.rejectByProjectManagerOne(id, rejectionReason, req);
  }

  @Put('/pm/bulk-reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  async bulkRejectByProjectManager(
    @Body() body: BulkRejectDataSetDto,
    @Request() req,
  ): Promise<BulkActionResultDto> {
    return this.runBulk(body.ids, (id) =>
      this.rejectByProjectManagerOne(id, body, req),
    );
  }

  private async approveByQAOne(
    id: string,
    body: ApproveDataSetDto,
    req,
  ): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.reviewerTaskService.approveByQA(
        id,
        req.user.id,
        queryRunner,
        body.annotationIds,
      );
      await this.activityLogService.create({
        user_id: req.user.id,
        action: ActivityLogActions.APPROVE_DATASET,
        metadata: '',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        entity_type: ActivityEntityType.DATASET,
        entity_id: id,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }

  @Put('/qa/approve/:dataset_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.QA)
  async approveByQA(
    @Param('dataset_id', ParseUUIDPipe) id: string,
    @Body() body: ApproveDataSetDto,
    @Request() req,
  ) {
    await this.approveByQAOne(id, body, req);
    return {
      message: 'Data set approved successfully',
    };
  }

  @Put('/qa/bulk-approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.QA)
  async bulkApproveByQA(
    @Body() body: BulkApproveDataSetDto,
    @Request() req,
  ): Promise<BulkActionResultDto> {
    return this.runBulk(body.ids, (id) => this.approveByQAOne(id, body, req));
  }

  private async rejectByQAOne(
    id: string,
    rejectionReason: RejectionInput,
    req,
  ): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reject = await this.reviewerTaskService.rejectByQA(
        id,
        rejectionReason.rejection_type_ids,
        req.user.id,
        queryRunner,
        rejectionReason.flag,
        rejectionReason.comment,
        rejectionReason.is_uncertain,
      );
      await this.activityLogService.create({
        user_id: req.user.id,
        action: ActivityLogActions.REJECT_DATASET,
        metadata: '',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        entity_type: ActivityEntityType.DATASET,
        entity_id: id,
      });
      await queryRunner.commitTransaction();
      return reject;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (queryRunner) {
        try {
          await queryRunner.release();
        } catch (releaseError) {
          console.error('Error releasing queryRunner:', releaseError);
        }
      }
    }
  }

  @Put('/qa/reject/:dataset_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.QA)
  async rejectByQA(
    @Param('dataset_id', ParseUUIDPipe) id: string,
    @Body() rejectionReason: CreateRejectionDto,
    @Request() req,
  ) {
    return this.rejectByQAOne(id, rejectionReason, req);
  }

  @Put('/qa/bulk-reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.QA)
  async bulkRejectByQA(
    @Body() body: BulkRejectDataSetDto,
    @Request() req,
  ): Promise<BulkActionResultDto> {
    return this.runBulk(body.ids, (id) => this.rejectByQAOne(id, body, req));
  }

  @Get('/qa/tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.QA)
  async getQATasks(@Query() pagination: PaginationDto, @Req() req) {
    const user = req.user;
    return this.reviewerTaskService.getQATasks(user.id, pagination);
  }

  @Get('/qa/microtasks/:task_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  async getQAReviewDataSets(
    @Param('task_id', ParseUUIDPipe) id: string,
    @Query() getTaskDto: GetQAMicroTasksDto,
  ) {
    return this.reviewerTaskService.getQAReviewDataSets(id, getTaskDto);
  }

  @Put('/detail/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.REVIEWER)
  @ApiProperty({ type: ReviewDetailRto })
  async reviewDetail(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.reviewerTaskService.getReviewDetail(id);
  }
}
