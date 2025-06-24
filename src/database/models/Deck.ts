import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators';
import { Card } from './Card';

export class Deck extends Model {
  static table = 'decks';
  static associations = {
    cards: { type: 'has_many' as const, foreignKey: 'deck_id' },
  };

  @field(.*)  string;
  @field(.*)  string;
  @field('description') description?: string;
  @field('cover_image_url') coverImageUrl?: string;
  @field(.*)  number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt?: Date;
  @field(.*)  boolean;

  @children('cards') cards!: Card[];

  get keywordsArray(): string[] {
    // Computed property for keywords
    return [];
  }

  get symbolsArray(): string[] {
    // Computed property for symbols  
    return [];
  }
}