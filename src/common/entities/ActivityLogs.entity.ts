import { User } from 'src/auth/entities/User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('activity_logs')
export class ActivityLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.activityLogs)
  user: User;

  @Column()
  action: string;

  @Column({ nullable: true })
  entity_type: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column({ nullable: true })
  metadata: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  ip: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
