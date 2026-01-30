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
import { Country } from './Country.entity';
import { Zone } from './Zone.entity';
import { User } from 'src/auth/entities/User.entity';
@Entity({ schema: 'setting' })
export class Region {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Region belongs to a acountry
  @ManyToOne(() => Country, (country) => country.regions)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ nullable: true })
  country_id: string;

  // Region has Many Zones
  @OneToMany(() => Zone, (zone) => zone.region)
  zones: Zone[];

  // Zone has Many Users
  @OneToMany(() => User, (user) => user.region)
  users: User[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
