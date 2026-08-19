import { DataSet } from 'src/data_set/entities/DataSet.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserLog } from './UserLog.entity';
import { Wallet } from 'src/finance/entities/Wallet.entity';
import Dialect from 'src/base_data/entities/Dialect.entity';
import { Role } from './Role.entity';
import { Language } from 'src/base_data/entities/Language.entity';
import { UserTask } from 'src/project/entities/UserTask.entity';
import { Project } from 'src/project/entities/Project.entity';
import { Region, Zone } from 'src/base_data/entities';
import { UserScore } from './UserScore.entity';
import { ActivityLogs } from 'src/common/entities/ActivityLogs.entity';
import { FacilitatorContributor } from 'src/project/entities/FacilitatorContributor.entity';
import { UserDeviceToken } from './UserDeviceToken.entity';
import { Transaction } from 'src/finance/entities/Transaction.entity';
import { DataSetReview } from 'src/task_distribution/enitities/DataSetReview.entity';
import { UserReferral } from './UserReferral.entity';
import { LanguageConstants } from 'src/utils/constants/Language.constant';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column({ unique: true, nullable: true })
  national_id: string;

  @Column({
    default: 'pending',
    enum: ['pending', 'under_review', 'approved', 'rejected'],
  })
  kyc_verification_status: 'pending' | 'under_review' | 'approved' | 'rejected';

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ type: "int", nullable: true })
  age: number;

  @Column({ nullable: true, enum: ['Male', 'Female'] })
  gender: 'Male' | 'Female';

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  has_logged_in: boolean;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  referral_code: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  @ManyToOne(() => Language, (language) => language.users)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column({ nullable: true, type: 'uuid' })
  language_id: string;

  @ManyToOne(() => Dialect, (dialect) => dialect.users)
  @JoinColumn({ name: 'dialect_id' })
  dialect: Dialect;

  @Column({ nullable: true, type: 'uuid' })
  dialect_id: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ nullable: true })
  woreda: string;

  @Column({ nullable: true })
  city: string;

  @ManyToOne(() => Zone, (zone) => zone.users)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @Column({ nullable: true, type: 'uuid' })
  zone_id: string;

  @ManyToOne(() => Region, (region) => region.users)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ nullable: true })
  region_id: string;

  @Column({
    default: LanguageConstants.ENGLISH,
    enum: LanguageConstants,
    nullable: true,
  })
  preferred_language: LanguageConstants;

  @OneToMany(() => DataSet, (attempt) => attempt.contributor)
  @JoinColumn({ name: 'contributor_id' })
  contributes: DataSet[];

  @OneToMany(() => DataSetReview, (dataSetReview) => dataSetReview.reviewer)
  dataSetReviews: DataSetReview[];

  @OneToMany(
    () => FacilitatorContributor,
    (facilitatorContributor) => facilitatorContributor.facilitator,
  )
  @JoinColumn({ name: 'facilitator_id' })
  facilitatorContributors: FacilitatorContributor[];

  @OneToMany(() => UserLog, (userLog) => userLog.user)
  @JoinColumn({ name: 'user_id' })
  userLogs: UserLog[];

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet[];

  @OneToMany(() => UserTask, (UserTask) => UserTask.user)
  @JoinColumn({ name: 'user_id' })
  userToTasks: UserTask[];

  // User has Many Project as a Manager
  @OneToMany(() => Project, (project) => project.manager)
  @JoinColumn({ name: 'manager_id' })
  projects: Project[];

  @OneToMany(() => UserDeviceToken, (userDeviceToken) => userDeviceToken.user)
  @JoinColumn({ name: 'user_id' })
  userDeviceTokens: UserDeviceToken[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  @JoinColumn({ name: 'user_id' })
  transactions: Transaction[];

  @OneToOne(() => UserScore, (score) => score.user, {
    cascade: true, // optional
    // eager: true,        // optional
  })
  score: UserScore;

  @OneToOne(() => ActivityLogs, {})
  activityLogs: ActivityLogs[];

  @Column({ type: 'text', array: true, nullable: true })
  sectors: string[];

  // User has referred many users
  @OneToMany(() => UserReferral, (ref) => ref.referrer)
  sentReferrals: UserReferral[];

  // User was referred by one user
  @OneToOne(() => UserReferral, (ref) => ref.referred)
  receivedReferral: UserReferral;
}
