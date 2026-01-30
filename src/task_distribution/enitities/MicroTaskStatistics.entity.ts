import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'task_distribution', name: 'micro_task_statistics' })
export class MicroTaskStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  micro_task_id: string;

  @Column()
  task_id: string;

  @Column()
  no_of_contributors: number;

  @Column()
  expected_no_of_contributors: number;

  @Column({ nullable: true })
  total_male: number;

  @Column({ nullable: true })
  total_female: number;

  @CreateDateColumn()
  created_date: Date;
}
