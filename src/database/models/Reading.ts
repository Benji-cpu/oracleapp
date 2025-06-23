import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';
import { CardPosition } from '../../types';

export class Reading extends Model {
  static table = 'readings';

  @field('user_id') userId!: string;
  @field('deck_id') deckId!: string;
  @field('spread_type') spreadType!: string;
  @field('intention') intention?: string;
  @field('card_positions') _cardPositions!: string; // JSON string
  @field('ai_interpretation') aiInterpretation?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @date('synced_at') syncedAt?: Date;
  @field('is_deleted') isDeleted!: boolean;

  get cardPositions(): CardPosition[] {
    try {
      return this._cardPositions ? JSON.parse(this._cardPositions) : [];
    } catch {
      return [];
    }
  }

  setCardPositions(positions: CardPosition[]) {
    this._cardPositions = JSON.stringify(positions);
  }
}