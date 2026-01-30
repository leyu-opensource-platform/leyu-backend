import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DataSetAnnotation } from './DataSetAnnotation.entity';

@Entity({ schema: 'setting', name: 'annotation_type' })
export class AnnotationType {
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
    () => DataSetAnnotation,
    (dataSetAnnotation) => dataSetAnnotation.annotationType,
  )
  annotations: DataSetAnnotation[];
}
