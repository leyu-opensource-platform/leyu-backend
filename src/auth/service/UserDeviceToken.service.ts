import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeviceToken } from '../entities/UserDeviceToken.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { ActionEvents } from 'src/utils/events/ActionEvents';
import { ContributorLoggedInEvent } from 'src/events/User.event';
@Injectable()
export class UserDeviceTokenService {
  constructor(
    @InjectRepository(UserDeviceToken)
    private userDeviceTokenRepository: Repository<UserDeviceToken>,
  ) {}

  @OnEvent(ActionEvents.USER_LOGGED_IN)
  async updateOrCreate(
    createUserDeviceTokenDto: ContributorLoggedInEvent,
  ): Promise<UserDeviceToken> {
    const existingToken: UserDeviceToken | null =
      await this.userDeviceTokenRepository.findOne({
        where: {
          device_token: createUserDeviceTokenDto.device_token,
          user_id: createUserDeviceTokenDto.user_id,
        },
      });
    if (existingToken) {
      // Update existing token
      existingToken.device_type = createUserDeviceTokenDto.device_type || 'web';
      existingToken.is_active = true;
      existingToken.last_used_at = new Date();
      return await this.userDeviceTokenRepository.save(existingToken);
    }
    const userDeviceToken = this.userDeviceTokenRepository.create(
      createUserDeviceTokenDto,
    );
    return await this.userDeviceTokenRepository.save(userDeviceToken);
  }

  async update(
    id: string,
    updateUserDeviceTokenDto: Partial<UserDeviceToken>,
  ): Promise<UserDeviceToken> {
    const userDeviceToken = await this.userDeviceTokenRepository.preload({
      id,
      ...updateUserDeviceTokenDto,
    });
    if (!userDeviceToken) {
      throw new NotFoundException('User device token not found');
    }
    return await this.userDeviceTokenRepository.save(userDeviceToken);
  }
}
