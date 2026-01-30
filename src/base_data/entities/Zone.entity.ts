import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from './Region.entity';
import { User } from 'src/auth/entities/User.entity';

@Entity({ schema: 'setting' })
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Zone belongs to Region
  @ManyToOne(() => Region, (region) => region.zones)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column()
  region_id: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Zone has Many Users
  @OneToMany(() => User, (user) => user.zone)
  users: User[];
}
