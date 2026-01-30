import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task.entity';
import { User } from 'src/auth/entities/User.entity';
import { InvitationLink } from './InvitationLink.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover_image_url: string;

  // Project belongs to User by manager
  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'manager_id' })
  manager: User;
  @Column({ nullable: true })
  manager_id: string;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column({
    type: 'enum',
    default: 'Active',
    enum: ['Active', 'InActive'],
  })
  status: string;

  @Column({ default: false })
  is_archived: boolean;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @Column({ nullable: true })
  created_by: string;
  // Project hasMany Task
  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
  // Project hasMany InvitationLinks
  @OneToMany(() => InvitationLink, (invitationLink) => invitationLink.project)
  invitationLinks: InvitationLink[];
}
