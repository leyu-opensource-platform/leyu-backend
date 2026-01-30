import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'task_distribution', name: 'user_score' })
export class UserScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column({ type: 'float', default: 0 })
  score: number;
}
