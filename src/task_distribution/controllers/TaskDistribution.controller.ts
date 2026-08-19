import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  Get,
  UploadedFiles,
  ParseUUIDPipe,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { TaskDistributionService } from '../service/TaskDistribution.service';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateMultipleDataSetDto } from '../dto/DataSet.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { multerAudioDiskConfig } from 'src/config/minio.config';
import { PaginatedResult } from 'src/utils/paginate.util';
import {
  ContributorTaskRto,
  TaskMicroTasksResponse,
  TaskStatus,
} from '../rto/Task.rto';
import { FileService } from 'src/common/service/File.service';
import { AudioService } from 'src/common/service/Audio.service';
import { taskTypes } from 'src/utils/constants/Task.constant';
import { GetContributorTasksDto } from '../dto/Task.dto';
import { DataSetSanitize } from 'src/data_set/sanitize';
import { GetTasksService } from '../service/GetTask.service';
import { TaskSubmissionService } from '../service/TaskSubmission.service';
import { TaskRedistributionService } from '../service/TaskRedistribution.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReviewerTaskDistributionsService } from '../service/ReviewerTaskDistribution.service';
import { unlink } from 'fs';
import { promisify } from 'util';
import { TaskService } from 'src/project/service/Task.service';
export const unlinkAsync = promisify(unlink);

@Controller('task-distribution')
@ApiTags('Task Distribution')
@ApiBearerAuth()
export class TaskDistributionController {
  constructor(
    private readonly taskDistributionService: TaskDistributionService,
    private readonly taskSubmissionService: TaskSubmissionService,
    private readonly taskRedistributionService: TaskRedistributionService,
    private readonly reviewerTaskDistributionService: ReviewerTaskDistributionsService,
    private readonly getTaskService: GetTasksService,
    private readonly fileService: FileService,
    private readonly audioService: AudioService,
    private readonly taskService: TaskService,
    private readonly dataSource: DataSource,
    @InjectQueue('file-upload')
    private readonly fileQueue: Queue,
  ) {}
  @Get('my-tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONTRIBUTOR)
  @ApiOperation({
    description:
      'Api for getting the tasks assigned to the current user (for contributor)',
    summary: 'Get my tasks',
  })
  @ApiResponse({ status: 200, description: 'My tasks', type: [TaskStatus] })
  /**
   * Get the tasks assigned to the current user
   * @param paginateDto Pagination query
   * @param req Request object
   * @returns The tasks assigned to the current user
   */
  async getContributorTasks(
    @Query() contributorTaskDto: GetContributorTasksDto,
    @Request() req,
  ): Promise<PaginatedResult<ContributorTaskRto>> {
    const user_id = req.user.id;
    const data = await this.getTaskService.getContributorTasks(
      user_id,
      contributorTaskDto,
    );
    const results: ContributorTaskRto[] = [];
    for (const task of data.result) {
      results.push(ContributorTaskRto.fromSelf(task));
    }
    data.result = results;
    return data;
  }
  @Get('test/:task_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({
    description:
      'Api for getting the tasks assigned to the current user (for contributor)',
    summary: 'Get my tasks',
  })
  @ApiResponse({ status: 200, description: 'My tasks', type: [TaskStatus] })
  /**
   * Get the tasks assigned to the current user
   * @param paginateDto Pagination query
   * @param req Request object
   * @returns The tasks assigned to the current user
   */
  async test(
    @Param('task_id', new ParseUUIDPipe()) task_id: string,
    @Request() req,
  ): Promise<any> {
    const data =
      await this.reviewerTaskDistributionService.distributeTaskDataSets(
        task_id,
      );
    return data;
  }
  @Get('assigned-tasks/:task_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONTRIBUTOR)
  @ApiOperation({ summary: 'Get my tasks' })
  @ApiResponse({
    status: 200,
    description: 'My tasks',
    type: TaskMicroTasksResponse,
  })
  async getContributorTaskMicroTasks(
    @Param('task_id', ParseUUIDPipe) task_id: string,
    @Request() req,
  ): Promise<TaskMicroTasksResponse> {
    const user_id = req.user.id;
    const task: TaskMicroTasksResponse =
      await this.getTaskService.getContributorTaskMicroTasks(user_id, task_id);
    if (
      task.task_type == taskTypes.AUDIO_TO_TEXT ||
      task.task_type == taskTypes.IMAGE_TO_TEXT ||
      task.task_type == taskTypes.IMAGE_TO_AUDIO
    ) {
      for (const mt of task.contributorMicroTask) {
        mt.file_path = await this.fileService.getPreSignedUrl(mt.file_path);
      }
    }
    if (
      task.task_type == taskTypes.TEXT_TO_AUDIO ||
      task.task_type == taskTypes.IMAGE_TO_AUDIO
    ) {
      for (const mt of task.contributorMicroTask) {
        if (mt.dataSet) {
          mt.dataSet.file_path = await this.fileService.getPreSignedUrl(
            mt.dataSet.file_path,
          );
        }
      }
    }
    return task;
  }
  @Get('contributor-micro-task-submissions/:micro_task_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONTRIBUTOR)
  @ApiOperation({
    summary: 'Get Contributor Submission of specific micro task',
  })
  @ApiResponse({
    status: 200,
    description: 'My tasks',
    type: [DataSetSanitize],
  })
  async getContributorMicroTaskSubmissionDetail(
    @Param('micro_task_id', new ParseUUIDPipe()) micro_task_id: string,
    @Request() req,
  ): Promise<DataSetSanitize[]> {
    const user_id = req.user.id;
    const dataSets: DataSetSanitize[] =
      await this.getTaskService.getContributorMicroTaskSubmissions(
        micro_task_id,
        user_id,
      );
    if (dataSets.length == 0) {
      return [];
    }

    if (dataSets[0].type == 'audio') {
      for (const d of dataSets) {
        d.file_path = await this.fileService.getPreSignedUrl(d.file_path);
      }
      return dataSets;
    } else {
      return dataSets;
    }
  }

  @Post('/:task_id/contribute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONTRIBUTOR)
  @ApiOperation({ summary: 'Contribute' })
  @ApiParam({ name: 'task_id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Contribute' })
  async contribute(
    @Param('task_id', new ParseUUIDPipe()) task_id: string,
    @Body()
    data: CreateMultipleDataSetDto,
    @Request() req,
  ) {
    const user_id = req.user.id;
    return this.taskSubmissionService.submitMultipleTextDatasets(
      user_id,
      data.attempts,
      task_id,
      data.is_test,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Initialize task distribution' })
  @ApiResponse({ status: 201, description: 'Task distribution initialized' })
  @ApiQuery({ name: 'task_id', required: true })
  async initializeTaskDistribution(
    @Query('task_id', ParseUUIDPipe) task_id: string,
    @Request() req,
  ) {
    if (!task_id) {
      throw new Error('Task ID is required');
    }
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const distribute =
        await this.taskDistributionService.startNewTaskDistribution(
          task_id,
          queryRunner,
        );
      await queryRunner.commitTransaction();
      return distribute;
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

  @Post('reviewer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Initialize task distribution for reviewers ' })
  @ApiResponse({ status: 201, description: 'Task distributed successfully' })
  @ApiQuery({ name: 'task_id', required: true })
  async distributeTaskForReviewers(
    @Query('task_id', ParseUUIDPipe) task_id: string,
  ) {
    if (!task_id) {
      throw new Error('Task ID is required');
    }
    try {
      const result =
        await this.reviewerTaskDistributionService.distributeTaskDataSets(
          task_id,
        );
      return { message: ' Task distributed for reviewers', result };
    } catch (error) {
      throw error;
    }
  }

  @Post('/:task_id/contribute_audio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CONTRIBUTOR)
  @ApiParam({ name: 'task_id', type: 'string' })
  @UseInterceptors(
    AnyFilesInterceptor({ storage: multerAudioDiskConfig.storage }),
  )
  @ApiOperation({
    summary: 'Contribute audio files',
    description:
      'Each uploaded recording is validated server-side: its real duration is ' +
      'read from the audio file itself (never trusted from the client) and ' +
      "checked against the task's minimum_seconds/maximum_seconds " +
      'requirements. Empty, corrupt, or out-of-range recordings are ' +
      'rejected with a 400 response before any data is persisted.',
  })
  @ApiResponse({
    status: 400,
    description:
      'One or more recordings failed audio validation (empty/corrupt file, ' +
      'or duration outside the task\u2019s allowed range).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        micro_task_id: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async contributeMultipleSpeech(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('task_id', new ParseUUIDPipe()) task_id: string,
    @Body() body: any,
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    console.log('Request body ', req.body);
    const submissions: {
      micro_task_id: string;
      file_path: string;
      audio_duration: any;
    }[] = [];
    let { is_test } = req.body;
    is_test = is_test === 'true' || is_test === true;

    // NOTE: The client (mobile app) may also send an audio_duration[...]
    // field per recording, but that value is client-reported and is never
    // trusted for storage or validation. The authoritative duration is
    // always read from the uploaded file itself, below.

    try {
      // Fetch the task's requirement bounds (minimum/maximum recording
      // length) so uploaded audio can be checked against them.
      const task = await this.taskService.findOne({
        where: { id: task_id },
        relations: { taskRequirement: true },
      });
      const minimumSeconds = task?.taskRequirement?.minimum_seconds;
      const maximumSeconds = task?.taskRequirement?.maximum_seconds;

      // Validate every uploaded file server-side. We never trust the
      // client-reported audio_duration on its own: the real duration is
      // read from the file itself, and empty/corrupt/out-of-range
      // recordings are rejected before anything is persisted.
      const validationFailures: {
        micro_task_id: string;
        reason: string;
      }[] = [];
      const verifiedDurations: Record<string, number> = {};

      for (const file of files) {
        const result = await this.audioService.validateAudioFile(file.path, {
          minimumSeconds,
          maximumSeconds,
        });
        if (!result.valid) {
          validationFailures.push({
            micro_task_id: file.fieldname,
            reason: result.reason ?? 'Invalid audio file',
          });
        } else {
          verifiedDurations[file.fieldname] = result.duration;
        }
      }

      if (validationFailures.length > 0) {
        throw new BadRequestException({
          message: 'Audio validation failed for one or more recordings',
          failedFiles: validationFailures,
        });
      }

      for (const file of files) {
        submissions.push({
          micro_task_id: file.fieldname,
          file_path: '',
          audio_duration: verifiedDurations[file.fieldname] ?? 0,
        });
      }
      const data_Sets =
        await this.taskSubmissionService.submitMultipleAudioDatasets(
          req.user.id,
          submissions,
          task_id,
          is_test,
        );
      for (const file of files) {
        const d = data_Sets.find((d) => d.micro_task_id == file.fieldname);
        if (!d) {
          continue;
        }
        await this.fileQueue.add(
          'upload',
          {
            path: file.path,
            filename: file.filename,
            mimetype: file.mimetype,
            dataSetId: d.id,
          },
          {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );
      }
      return submissions;
    } catch (error) {
      await Promise.all(
        files.map(async (file) => {
          await unlinkAsync(file.path);
        }),
      );
      throw error;
    }
  }
}
