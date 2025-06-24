import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators';
import { Deck } from './Deck';

export class Card extends Model {
  static table = 'cards';
  static associations = {
    deck: { type: 'belongs_to' as const, key: 'deck_id' },
  };

  @field('deck_id') deckId = '';
  @field('title') title = '';
  @field('meaning') meaning = '';
  @field('keywords') _keywords = ''; // JSON string
  @field('style_template') styleTemplate = '';
  @field('symbols') _symbols = ''; // JSON string
  @field('image_url') imageUrl = '';
  @field('position') position = 0;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt?: Date;
  @field('is_deleted') isDeleted = false;

  @relation('decks', 'deck_id') deck!: Deck;

  get keywords(): string[] {
    try {
      return this._keywords ? JSON.parse(this._keywords) : [];
    } catch {
      return [];
    }
  }

  get symbols(): string[] {
    try {
      return this._symbols ? JSON.parse(this._symbols) : [];
    } catch {
      return [];
    }
  }

  setKeywords(keywords: string[]) {
    this._keywords = JSON.stringify(keywords);
  }

  setSymbols(symbols: string[]) {
    this._symbols = JSON.stringify(symbols);
  }
}