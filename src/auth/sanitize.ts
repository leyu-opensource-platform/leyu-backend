import { ApiProperty } from '@nestjs/swagger';
import { Role } from './entities/Role.entity';
import { User } from './entities/User.entity';
import { DialectSanitized, LanguageSanitized } from 'src/base_data/sanitize';

export const UserSanitizedFields = {
  id: true,
  first_name: true,
  middle_name: true,
  last_name: true,
  phone_number: true,
  profile_picture: true,
  is_active: true,
  email: true,
  created_date: true,
};
export const RoleSanitizedFields = {
  id: true,
  name: true,
  created_date: true,
};
export class RoleSanitize {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  created_date: Date;
  static from(role: Role) {
    return {
      id: role.id,
      name: role.name,
      created_date: role.created_date,
    };
  }
}
export class UserSanitize {
  @ApiProperty()
  id: string;
  @ApiProperty()
  first_name: string;
  @ApiProperty()
  middle_name: string;
  @ApiProperty()
  last_name: string;
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
  profile_picture: string;
  @ApiProperty()
  is_active: boolean;
  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['pending', 'under_review', 'approved', 'rejected'] })
  kyc_verification_status: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  age?: number;

  @ApiProperty()
  gender?: string;

  @ApiProperty({ type: RoleSanitize })
  role?: RoleSanitize;

  @ApiProperty({ type: DialectSanitized })
  dialect?: DialectSanitized;

  @ApiProperty({ type: LanguageSanitized })
  language?: LanguageSanitized;

  @ApiProperty()
  woreda: string;

  @ApiProperty()
  city?: string;

  @ApiProperty()
  zone?: string;

  @ApiProperty()
  region?: string;

  @ApiProperty()
  region_id?: string;

  @ApiProperty()
  zone_id?: string;

  @ApiProperty()
  score?: number;

  @ApiProperty()
  referred?: boolean;
  @ApiProperty()
  totalDataSetSubmitted?: number;
  @ApiProperty()
  totalApprovedDataSetSubmitted?: number;
  @ApiProperty()
  preferred_language?: string;
  @ApiProperty()
  referral_code?: string;
  static from(
    user: User,
    userScore?: number,
    totalDataSetSubmitted?: number,
    totalApprovedDataSetSubmitted?: number,
    referred?: boolean,
  ): UserSanitize {
    return {
      id: user.id,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      profile_picture: user.profile_picture,
      is_active: user.is_active,
      email: user.email,
      created_date: user.created_date,
      role: user.role && RoleSanitize.from(user.role),
      dialect: user.dialect && DialectSanitized.from(user.dialect),
      language: user.language && LanguageSanitized.from(user.language),
      woreda: user.woreda,
      city: user.city,
      zone: user.zone?.name,
      region: user.region?.name,
      region_id: user.region_id,
      zone_id: user.zone_id,
      age: user.age,
      gender: user.gender,
      score: userScore ? userScore : user.score?.score,
      kyc_verification_status: user.kyc_verification_status,
      totalDataSetSubmitted: totalDataSetSubmitted,
      totalApprovedDataSetSubmitted: totalApprovedDataSetSubmitted,
      preferred_language: user.preferred_language,
      referred: referred,
      referral_code: user.referral_code,
    };
  }
}
