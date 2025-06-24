import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class Profile extends Model {
  static table = 'profiles';

  @field(.*)  string;
  @field(.*)  string;
  @field('username') username?: string;
  @field('avatar_url') avatarUrl?: string;
  @field(.*)  string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt?: Date;
}