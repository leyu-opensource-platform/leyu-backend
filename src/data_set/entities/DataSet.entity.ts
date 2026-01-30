import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MicroTask } from './MicroTask.entity';
import { User } from 'src/auth/entities/User.entity';
import { RejectionReason } from './RejectionReason.entity';
import { DataSetStatus } from 'src/utils/constants/DataSetStatus.constant';
import { Dialect, Language } from 'src/base_data/entities';
import { FlagReason } from './FlagReason.entity';

@Entity('data_set')
export class DataSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  text_data_set: string;

  @Column({
    type: 'enum',
    default: DataSetStatus.PENDING,
    enum: [
      DataSetStatus.PENDING,
      DataSetStatus.Flagged,
      DataSetStatus.APPROVED,
      DataSetStatus.REJECTED,
    ], //["Pending", "UnderReview" ,"Approved","Rejected" ]
  })
  status: string;

  @Column({
    default: false,
  })
  is_draft: boolean;

  @Column({
    default: false,
  })
  is_flagged: boolean;

  @Column({
    default: 'completed',
  })
  queue_status: 'pending' | 'completed' | 'failed';

  @Column({
    default: false,
  })
  is_paid_for_contributor: boolean;

  @Column({ nullable: true })
  rejection_reason_id: string;

  @Column({ default: false })
  is_paid_for_reviewer: boolean;

  @Column({ default: false })
  is_test: boolean;

  @Column({ nullable: true })
  audio_duration: number;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  file_path: string;

  @Column({ nullable: true })
  type: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Attempt belongs to MicroTask
  @ManyToOne(() => MicroTask, (question) => question.dataSets)
  @JoinColumn({ name: 'micro_task_id' })
  microTask: MicroTask;

  @Column({ nullable: true })
  micro_task_id: string;
  // Attempt belongs to User as Contributor
  @ManyToOne(() => User, (user) => user.contributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contributor_id' })
  contributor: User;

  @Column({})
  contributor_id: string;

  // Attempt belongs to User as Reviewer
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ nullable: true })
  reviewer_id: string;
  // Attempts may have many rejection reasons
  @OneToMany(
    () => RejectionReason,
    (rejection_reason) => rejection_reason.dataSet,
  )
  rejectionReasons: RejectionReason[];

  @OneToMany(() => FlagReason, (flagReason) => flagReason.dataSet)
  flagReason: FlagReason[];

  @Column({ nullable: true })
  dialect_id: string;

  @Column({ nullable: true })
  annotation: string;

  @ManyToOne(() => Dialect, (dialect) => dialect.dataSets)
  @JoinColumn({ name: 'dialect_id' })
  dialect: Dialect;

  @Column({ nullable: true })
  language_id: string;
  @ManyToOne(() => Language, (language) => language.dataSets)
  @JoinColumn({ name: 'language_id' })
  language: Language;
}
