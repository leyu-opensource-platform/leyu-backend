import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('user_log')
export class UserLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_ip: string;

  @Column({ nullable: true })
  action_type: string;

  @Column({ nullable: true })
  action_end_point: string;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  //User log belongs to user
  @ManyToOne(() => User, (user) => user.userLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({})
  user_id: string;
}
