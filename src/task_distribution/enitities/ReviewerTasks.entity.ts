import { Task } from 'src/project/entities/Task.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ schema: 'task_distribution', name: 'reviewer_tasks' })
export class ReviewerTasks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @Column({ type: 'uuid' })
  reviewer_id: string;

  @Column({ type: 'text', array: true, nullable: true })
  data_set_ids: string[];

  @Column({})
  expire_date: Date;

  @ManyToOne(() => Task, (task) => task.reviewerTasks)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
