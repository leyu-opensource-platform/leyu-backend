import { Injectable } from '@nestjs/common';
import { Role } from 'src/auth/decorators/roles.enum';
import { UserService } from 'src/auth/service/User.service';
import { DialectService, LanguageService } from 'src/base_data/service';
import { DataSetService } from 'src/data_set/service/DataSet.service';
import { MicroTaskService } from 'src/data_set/service/MicroTask.service';
import { ProjectService } from 'src/project/service/Project.service';
import { TaskService } from 'src/project/service/Task.service';

@Injectable()
export class SuperAdminStatistics {
  constructor(
    private readonly dataSetService: DataSetService,
    private readonly microTaskService: MicroTaskService,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
    private readonly languageService: LanguageService,
    private readonly dialectService: DialectService,
  ) {}
  async getAllStatistics() {
    // datasets
    // Previously commented out because it called dataSetService.count({}),
    // which is actually the WEEKLY/MONTHLY/YEARLY chart-grouping method (it
    // takes a view_type and returns an array of {date, count} rows, not a
    // total) -- passing {} always fell through to its `return []` branch, a
    // type mismatch that's presumably why this got disabled rather than
    // fixed. countAll() (already used the same way on the PM/project
    // dashboard's equivalent stat) is the correct total-count method.
    const total_data_sets: number = await this.dataSetService.countAll({});
    const total_micro_tasks: number = await this.microTaskService.count({});

    // tasks
    const total_tasks: number = await this.taskService.count({});
    const total_projects: number = await this.projectService.count({});

    // users
    const total_contributors = await this.userService.count(
      {},
      Role.CONTRIBUTOR,
    );
    const total_facilitators = await this.userService.count({}, Role.REVIEWER);
    const total_project_managers = await this.userService.count(
      {},
      Role.PROJECT_MANAGER,
    );
    const total_reviewers = await this.userService.count({}, Role.REVIEWER);

    // settings
    const total_languages = await this.languageService.count({});
    const total_dialects = await this.dialectService.count({});
    return {
      total_data_sets,
      total_micro_tasks,
      total_projects,
      total_tasks,
      total_contributors,
      total_facilitators,
      total_project_managers,
      total_reviewers,
      total_languages,
      total_dialects,
    };
  }
  async getDataSetStatistics(
    view_type: 'WEEKLY' | 'MONTHLY' | 'YEARLY' = 'WEEKLY',
    anchor_date?: string,
  ): Promise<any[]> {
    return this.dataSetService.count(view_type, anchor_date);
  }
  async getDataSetByDialectAndLanguage(view_type: 'LANGUAGE' | 'DIALECT') {
    if (view_type == 'LANGUAGE') {
      return this.dataSetService.getDatasetCountsByLanguage();
    } else if (view_type == 'DIALECT') {
      return this.dataSetService.getDatasetCountsByDialect();
    } else {
      return [];
    }
  }
}
