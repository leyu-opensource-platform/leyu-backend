import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../service/Wallet.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Role } from 'src/auth/decorators/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { WithdrawMoneyDto } from '../dto/wallet.dto';
import { Request } from '@nestjs/common';
import { User } from 'src/auth/entities/User.entity';
import { DataSource } from 'typeorm';
@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  // Controller logic for handling wallet-related requests
  // This will include methods for creating, updating, and retrieving wallet information
  constructor(
    // Inject necessary services here
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('withdraw-money')
  @Roles(Role.CONTRIBUTOR, Role.REVIEWER)
  async withdrawMoney(
    @Body() withDrawData: WithdrawMoneyDto,
    @Request() request,
  ) {
    // Logic for withdrawing money from the wallet
    const user = request.user as User;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await this.walletService.withdrawMoney(
        user.id,
        withDrawData.amount,
        withDrawData.phoneNumber,
        withDrawData.paymentMethod,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      if (queryRunner && !queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
    } finally {
      if (queryRunner && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
  @Get('balance')
  @Roles(Role.CONTRIBUTOR, Role.REVIEWER)
  async getBalance(@Request() request) {
    // Logic for retrieving the balance of the wallet
    const user = request.user as User;
    return await this.walletService.getBalance(user.id);
  }
}
