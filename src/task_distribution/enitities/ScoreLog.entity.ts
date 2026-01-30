import { User } from 'src/auth/entities/User.entity';
import { UserScoreAction } from 'src/utils/constants/UserScoreAction.constant';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

@Entity({ schema: 'task_distribution', name: 'score_log' })
export class ScoreLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [
      UserScoreAction.SUBMIT,
      UserScoreAction.ACCEPT,
      UserScoreAction.REJECT,
    ],
  })
  action: string;

  @Column()
  user_id: string;

  @Column({ type: 'float', default: 0 })
  point: number;

  @OneToOne(() => User, (user) => user.id)
  user: User;
}
