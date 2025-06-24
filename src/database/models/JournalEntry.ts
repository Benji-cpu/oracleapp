import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class JournalEntry extends Model {
  static table = 'journal_entries';

  @field(.*)  string;
  @field(.*)  string;
  @field('mood') mood?: string;
  @field('tags') _tags?: string; // JSON string
  @field('photo_urls') _photoUrls?: string; // JSON string
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt?: Date;
  @field(.*)  boolean;

  get tags(): string[] {
    try {
      return this._tags ? JSON.parse(this._tags) : [];
    } catch {
      return [];
    }
  }

  get photoUrls(): string[] {
    try {
      return this._photoUrls ? JSON.parse(this._photoUrls) : [];
    } catch {
      return [];
    }
  }

  setTags(tags: string[]) {
    this._tags = JSON.stringify(tags);
  }

  setPhotoUrls(urls: string[]) {
    this._photoUrls = JSON.stringify(urls);
  }
}