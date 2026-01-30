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
import { FlagType } from 'src/base_data/entities/FlagType.entity';

@Entity()
export class FlagReason {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Rejection Reason belongs to Attempt
  @ManyToOne(() => DataSet, (dateSet) => dateSet.flagReason)
  @JoinColumn({ name: 'data_set_id' })
  dataSet: DataSet;
  @Column({ nullable: false })
  data_set_id: string;

  // Rejection Reason Type belongs to Rejection Type
  @ManyToOne(() => FlagType, (flagType) => flagType.flagReasons)
  @JoinColumn({ name: 'flag_type_id' })
  flagType: FlagType;
  @Column({ nullable: false })
  flag_type_id: string;
}
