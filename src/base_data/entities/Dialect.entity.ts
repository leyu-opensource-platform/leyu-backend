// Accent Entity in typeorm

import { User } from 'src/auth/entities/User.entity';
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
import { Language } from './Language.entity';
import { DataSet } from 'src/data_set/entities/DataSet.entity';
@Entity({ schema: 'setting' })
export class Dialect {
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

  // Accent belongs to Many user
  @OneToMany(() => User, (user) => user.dialect)
  users: User[];

  @ManyToOne(() => Language, (language) => language.dialects)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column({ nullable: true })
  language_id: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => DataSet, (dataSet) => dataSet.dialect)
  dataSets: DataSet[];
}
export default Dialect;
