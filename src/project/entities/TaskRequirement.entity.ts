import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task.entity';

@Entity()
export class TaskRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Task, (task) => task.taskRequirement)
  @JoinColumn({ name: 'task_id' })
  task: Task;
  @Column()
  task_id: string;

  @Column({ nullable: true })
  max_contributor_per_micro_task: number;

  @Column({ nullable: true })
  max_contributor_per_facilitator: number;

  @Column({ nullable: true, default: 10 })
  max_dataset_per_reviewer: number;

  @Column({ nullable: true })
  max_micro_task_per_contributor: number;

  @Column({ nullable: true })
  minimum_seconds: number;

  @Column({ nullable: true })
  maximum_seconds: number;

  @Column({ nullable: true })
  minimum_characters_length: number;

  @Column({ nullable: true })
  maximum_characters_length: number;

  @Column({ nullable: true })
  batch: number;

  @Column({ nullable: true })
  appriximate_time_per_batch: number;

  @Column({ nullable: true })
  max_retry_per_task: number;

  @Column({ default: false })
  is_dialect_specific: boolean;

  @Column({ type: 'jsonb', nullable: true })
  dialects: {
    id: string;
    name: string;
  }[];

  @Column({ default: false })
  is_age_specific: boolean;

  @Column({ type: 'jsonb', nullable: true }) // store structured data
  age: {
    min: number;
    max: number;
  };

  @Column({ default: false })
  is_sector_specific: boolean;

  @Column('text', { array: true, nullable: true })
  sectors: string[];

  @Column({ default: false })
  is_gender_specific: boolean;

  // gender ration in percentage
  @Column({ type: 'jsonb', nullable: true }) // store structured data
  gender: {
    male: number;
    female: number;
  };

  @Column({ default: false })
  is_location_specific: boolean;

  @Column({ type: 'jsonb', nullable: true }) // store structured data
  locations: {
    name: string;
  }[];

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
