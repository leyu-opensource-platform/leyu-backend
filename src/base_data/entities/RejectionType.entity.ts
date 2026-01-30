import { RejectionReason } from 'src/data_set/entities/RejectionReason.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'setting' })
export class RejectionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // RejectionType has many RejectionReason
  @OneToMany(
    () => RejectionReason,
    (rejectionReason) => rejectionReason.rejectionType,
  )
  rejectionReasons: RejectionReason[];
}
