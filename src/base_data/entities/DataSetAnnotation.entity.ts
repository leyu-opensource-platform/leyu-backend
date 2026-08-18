import { FlagReason } from 'src/data_set/entities/FlagReason.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnnotationType } from './AnnotationType.entity';
import { DataSetReview } from 'src/task_distribution/enitities/DataSetReview.entity';
@Entity({ schema: 'setting', name: 'annotation' })
export class DataSetAnnotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  alternative_names: {
    key: string;
    name: string;
  }[];
  @Column()
  description: string;

  // Polarity of the annotation: 'positive' | 'negative' | 'neutral'. Drives which
  // review dialog surfaces it — the Approve dialog only offers 'positive' tags,
  // while the Reject flow uses the separate rejection-reason list. Nullable so
  // annotations created before this column (or via the admin UI without a value)
  // simply don't appear in the positive-only Approve picker until classified.
  @Column({ type: 'varchar', nullable: true })
  sentiment: string;

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

  @ManyToMany(() => DataSetReview, (dataSetReview) => dataSetReview.annotations)
  dataSetReviews: DataSetReview[];
}
