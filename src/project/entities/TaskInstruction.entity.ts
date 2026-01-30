import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './Task.entity';

@Entity()
export class TaskInstruction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.taskInstructions)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column()
  task_id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image_instruction_url: string;

  @Column({ nullable: true })
  video_instruction_url: string;

  @Column({ nullable: true })
  audio_instruction_url: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
