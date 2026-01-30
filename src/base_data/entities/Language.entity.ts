import { Task } from 'src/project/entities/Task.entity';
import { User } from 'src/auth/entities/User.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import Dialect from './Dialect.entity';
import { DataSet } from 'src/data_set/entities/DataSet.entity';

@Entity({ schema: 'setting' })
export class Language {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, unique: true })
  code: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @OneToMany(() => Task, (task) => task.language)
  tasks: Task[];

  @OneToMany(() => Dialect, (dialect) => dialect.language)
  dialects: Dialect[];

  @OneToMany(() => User, (user) => user.language)
  users: User[];

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => DataSet, (dataSet) => dataSet.language)
  dataSets: DataSet[];
}
