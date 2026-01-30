import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task.entity';
import { User } from 'src/auth/entities/User.entity';

@Entity('user_task')
export class UserTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userToTasks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({})
  user_id: string;

  @Column({ default: false })
  has_done_task: boolean;

  @ManyToOne(() => Task, (task) => task.userToTasks)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({})
  task_id: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ['Contributor', 'Facilitator', 'Reviewer'],
  })
  role: 'Contributor' | 'Facilitator' | 'Reviewer';

  @Column({
    type: 'enum',
    default: 'Active',
    enum: ['Active', 'InActive', 'Flagged', 'Rejected', 'Pending'],
  })
  status: 'Active' | 'InActive' | 'Flagged' | 'Rejected' | 'Pending';

  @Column({ default: false })
  is_flagged: boolean;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
