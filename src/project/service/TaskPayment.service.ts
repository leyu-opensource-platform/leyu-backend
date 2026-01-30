import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { TaskPayment } from '../entities/TaskPayment.entity';
import { CreateTaskPaymentDto } from '../dto/Payment.dto';
import { UpdateTaskPaymentDto } from '../dto/Task.dto';

@Injectable()
export class TaskPaymentService {
  constructor(
    @InjectRepository(TaskPayment)
    private readonly paymentRepository: Repository<TaskPayment>,
  ) {}

  async create(
    paymentData: CreateTaskPaymentDto,
    queryRunner: QueryRunner,
  ): Promise<TaskPayment> {
    const payment = queryRunner.manager.create(TaskPayment, paymentData);
    return await queryRunner.manager.save(payment);
  }

  async findOne(id: string): Promise<TaskPayment | null> {
    return await this.paymentRepository.findOne({ where: { id } });
  }

  async update(
    taskId: string,
    paymentData: UpdateTaskPaymentDto,
  ): Promise<TaskPayment | null> {
    const payment = await this.paymentRepository.findOne({
      where: { task_id: taskId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment Information not found`);
    }
    payment.contributor_credit_per_microtask =
      paymentData.contributor_credit_per_microtask;
    payment.reviewer_credit_per_microtask =
      paymentData.reviewer_credit_per_microtask;
    return await this.paymentRepository.save(payment);
  }

  async delete(paymentId: string): Promise<void> {
    await this.paymentRepository.delete(paymentId);
  }
}
