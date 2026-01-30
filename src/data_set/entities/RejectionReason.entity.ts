import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DataSet } from './DataSet.entity';
import { RejectionType } from 'src/base_data/entities/RejectionType.entity';

@Entity()
export class RejectionReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: false })
  rejection_type_id: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Rejection Reason belongs to Attempt
  @ManyToOne(() => DataSet, (dateSet) => dateSet.rejectionReasons)
  @JoinColumn({ name: 'data_set_id' })
  dataSet: DataSet;
  @Column({ nullable: false })
  data_set_id: string;

  // Rejection Reason Type belongs to Rejection Type
  @ManyToOne(
    () => RejectionType,
    (rejectionType) => rejectionType.rejectionReasons,
  )
  @JoinColumn({ name: 'rejection_type_id' })
  rejectionType: RejectionType;
}
