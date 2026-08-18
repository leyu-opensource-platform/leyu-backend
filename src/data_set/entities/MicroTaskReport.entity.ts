import { User } from 'src/auth/entities/User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MicroTask } from './MicroTask.entity';

@Entity('micro_task_report')
export class MicroTaskReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MicroTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'micro_task_id' })
  microTask: MicroTask;

  @Column({ type: 'uuid' })
  micro_task_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reporter: User;

  @Column({ type: 'uuid' })
  reported_by: string;

  @Column({
    type: 'enum',
    enum: ['nonsensical', 'offensive', 'other'],
  })
  reason: 'nonsensical' | 'offensive' | 'other';

  @Column({ type: 'character varying', nullable: true })
  note: string;

  @CreateDateColumn()
  created_date: Date;
}
