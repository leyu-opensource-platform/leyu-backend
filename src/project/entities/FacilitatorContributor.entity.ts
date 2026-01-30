import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task.entity';
import { User } from 'src/auth/entities/User.entity';

@Unique(['facilitator_id', 'task_id'])
@Entity('facilitator_contributor')
export class FacilitatorContributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  facilitator_id: string;

  @ManyToOne(() => User, (user) => user.facilitatorContributors)
  @JoinColumn({ name: 'facilitator_id' })
  facilitator: User;

  @Column({ type: 'text', array: true, nullable: true })
  contributor_ids: string[];

  @Column()
  task_id: string;

  @ManyToOne(() => Task, (task) => task.facilitatorContributors)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
