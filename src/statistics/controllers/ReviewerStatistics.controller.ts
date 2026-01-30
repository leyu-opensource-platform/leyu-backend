import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/decorators/roles.enum';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { ReviewerStatistics } from '../services/ReviewerStatistics.service';

@ApiTags('Reviewer Statistics')
@ApiBearerAuth()
@Controller('statistics/reviewer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.REVIEWER)
export class ReviewerStatisticsController {
  constructor(private readonly reviewerStatistics: ReviewerStatistics) {}

  @ApiProperty({ description: 'Get Reviewer Dataset  Statistics' })
  @Get('reviewer')
  async getReviewStatistics(@Req() req) {
    const user = req.user;
    return this.reviewerStatistics.getReviewStatistics(user.id);
  }
}
