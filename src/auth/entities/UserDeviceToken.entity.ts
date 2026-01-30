import { User } from './User.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserDeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.userDeviceTokens)
  user: User;

  @Column({ unique: false })
  device_token: string;

  @Column()
  device_type: 'android' | 'ios' | 'web';

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: new Date(), nullable: true })
  last_used_at: Date;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
