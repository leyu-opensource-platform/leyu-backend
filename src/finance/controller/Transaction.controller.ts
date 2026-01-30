import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Role } from 'src/auth/decorators/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetTransactionDto } from '../dto/wallet.dto';
import { User } from 'src/auth/entities/User.entity';
import { TransactionService } from '../service/Transaction.service';
@ApiTags('Transaction')
@ApiBearerAuth()
@Controller('transaction')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CONTRIBUTOR, Role.REVIEWER)
export class TransactionController {
  // Controller logic for handling wallet-related requests
  // This will include methods for creating, updating, and retrieving wallet information
  constructor(
    // Inject necessary services here
    private readonly transactionService: TransactionService,
  ) {}

  @Get('')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMyTransactions(
    @Query() transactionDto: GetTransactionDto,
    @Req() request,
  ) {
    const user = request.user as User;
    const userId = user.id;
    const page = transactionDto.page || 1;
    const limit = transactionDto.limit || 10;
    delete transactionDto.page;
    delete transactionDto.limit;
    return this.transactionService.getUserTransactionsPaginated(
      userId,
      transactionDto,
      {
        page: page,
        limit: limit,
      },
    );
  }
}
