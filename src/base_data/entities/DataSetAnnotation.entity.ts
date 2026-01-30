import { FlagReason } from 'src/data_set/entities/FlagReason.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnnotationType } from './AnnotationType.entity';

@Entity({ schema: 'setting', name: 'annotation' })
export class DataSetAnnotation {
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

  // belongs to many AnnotationType
  @Column({ nullable: true })
  annotation_type_id: string;

  @ManyToOne(
    () => AnnotationType,
    (annotationType) => annotationType.annotations,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'annotation_type_id' })
  annotationType: AnnotationType;

  // RejectionType has many RejectionReason
  @OneToMany(() => FlagReason, (flagReason) => flagReason.flagType)
  flagReasons: FlagReason[];
}
