import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { Wallet } from '../entities/Wallet.entity';
import { PaginationService } from 'src/common/service/pagination.service';
import { TransactionService } from './Transaction.service';
import { Transaction } from '../entities/Transaction.entity';
import SantimpaySdk from './SantimPay.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly santimPaySerive: SantimpaySdk,
    private readonly transactionService: TransactionService,
    private readonly paginationService: PaginationService<Wallet>,
  ) {
    this.paginationService = new PaginationService<Wallet>(
      this.walletRepository,
    );
  }

  async findAll(query: FindOptionsWhere<Wallet>): Promise<Wallet[]> {
    return this.walletRepository.find({ where: query });
  }

  async findOne(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet for this user not found`);
    }
    return wallet;
  }
  async findOneOrCreate(
    userId: string,
    queryRunner?: QueryRunner,
  ): Promise<Wallet> {
    if (queryRunner) {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user_id: userId },
      });
      if (!wallet) {
        const w = queryRunner.manager.create(Wallet, { user_id: userId });
        return queryRunner.manager.save(w);
      }
      return wallet;
    } else {
      const wallet = await this.walletRepository.findOne({
        where: { user_id: userId },
      });
      if (!wallet) {
        const w = this.walletRepository.create({ user_id: userId });
        return this.walletRepository.save(w);
      }
      return wallet;
    }
  }

  async create(wallet: Partial<Wallet>): Promise<Wallet> {
    const w = this.walletRepository.create(wallet);
    return this.walletRepository.save(w);
  }
  async addFunds(
    userId: string,
    amount: number,
    metadata: any,
    queryRunner: QueryRunner,
  ): Promise<Transaction> {
    const transaction = await this.transactionService.create(
      {
        user_id: userId,
        amount: amount,
        type: 'Credit',
        status: 'Done',
        metadata,
      },
      queryRunner,
    );
    const wallet = await this.findOneOrCreate(userId, queryRunner);
    const newBalance = Number(wallet.balance) + amount;
    await queryRunner.manager.update(
      Wallet,
      { id: wallet.id },
      { balance: newBalance },
    );
    return transaction;
  }
  async withdrawMoney(
    userId: string,
    amount: number,
    phoneNumber: string,
    paymentMethod: string,
    queryRunner: QueryRunner,
  ): Promise<Transaction> {
    const wallet = await this.findOneOrCreate(userId, queryRunner);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient Balance');
    }
    const transaction = await this.transactionService.create(
      { user_id: userId, amount: -amount, type: 'Withdraw', status: 'Pending' },
      queryRunner,
    );
    await this.santimPaySerive.sendToCustomer(
      userId,
      amount,
      'WithDrawal',
      phoneNumber,
      paymentMethod,
    );
    wallet.balance -= amount;
    await queryRunner.manager.save(wallet);
    return transaction;
  }

  async update(id: string, wallet: Partial<Wallet>): Promise<Wallet> {
    const existingWallet = await this.walletRepository.preload({
      id,
      ...wallet,
    });
    if (!existingWallet) {
      throw new NotFoundException(`Wallet with id ${id} not found`);
    }
    return this.walletRepository.save(existingWallet);
  }

  async remove(id: string) {
    const wallet = await this.walletRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${id} not found`);
    }
    await this.walletRepository.remove(wallet);
  }
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet for this user not found`);
    }
    return wallet.balance;
  }
}
