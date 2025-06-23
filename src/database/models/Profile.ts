import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class Profile extends Model {
  static table = 'profiles';

  @field('user_id') userId!: string;
  @field('email') email!: string;
  @field('username') username?: string;
  @field('avatar_url') avatarUrl?: string;
  @field('subscription_tier') subscriptionTier!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt?: Date;
}