import { database } from '../database';
import { supabase } from '../../lib/supabase';
import { Q } from '@nozbe/watermelondb';

export class SyncService {
  private isOnline = true;
  private syncInProgress = false;

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    // In a real app, you'd use NetInfo to detect network changes
    // For now, we'll assume we're online
  }

  async syncAll(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    
    try {
      await this.pullFromServer();
      await this.pushToServer();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pullFromServer(): Promise<void> {
    const lastSyncTime = await this.getLastSyncTime();
    
    try {
      // Pull decks
      const { data: decks, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .gt('updated_at', new Date(lastSyncTime).toISOString());

      if (decksError) throw decksError;

      // Pull cards
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .gt('updated_at', new Date(lastSyncTime).toISOString());

      if (cardsError) throw cardsError;

      // Pull readings
      const { data: readings, error: readingsError } = await supabase
        .from('readings')
        .select('*')
        .gt('updated_at', new Date(lastSyncTime).toISOString());

      if (readingsError) throw readingsError;

      // Pull journal entries
      const { data: journalEntries, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .gt('updated_at', new Date(lastSyncTime).toISOString());

      if (journalError) throw journalError;

      // Update local database
      await database.write(async () => {
        // Process decks
        for (const deckData of decks || []) {
          await this.upsertDeck(deckData);
        }

        // Process cards
        for (const cardData of cards || []) {
          await this.upsertCard(cardData);
        }

        // Process readings
        for (const readingData of readings || []) {
          await this.upsertReading(readingData);
        }

        // Process journal entries
        for (const entryData of journalEntries || []) {
          await this.upsertJournalEntry(entryData);
        }
      });

      await this.setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Pull from server failed:', error);
      throw error;
    }
  }

  private async pushToServer(): Promise<void> {
    try {
      // Get unsync records
      const unsyncedDecks = await database.collections
        .get('decks')
        .query(Q.where('synced_at', Q.lt(Q.column('updated_at'))))
        .fetch();

      const unsyncedCards = await database.collections
        .get('cards')
        .query(Q.where('synced_at', Q.lt(Q.column('updated_at'))))
        .fetch();

      const unsyncedReadings = await database.collections
        .get('readings')
        .query(Q.where('synced_at', Q.lt(Q.column('updated_at'))))
        .fetch();

      const unsyncedJournalEntries = await database.collections
        .get('journal_entries')
        .query(Q.where('synced_at', Q.lt(Q.column('updated_at'))))
        .fetch();

      // Push to server
      await this.pushDecks(unsyncedDecks);
      await this.pushCards(unsyncedCards);
      await this.pushReadings(unsyncedReadings);
      await this.pushJournalEntries(unsyncedJournalEntries);

    } catch (error) {
      console.error('Push to server failed:', error);
      throw error;
    }
  }

  private async upsertDeck(deckData: any): Promise<void> {
    const deckCollection = database.collections.get('decks');
    try {
      const existingDeck = await deckCollection.find(deckData.id);
      await existingDeck.update((deck: any) => {
        deck.name = deckData.name;
        deck.description = deckData.description;
        deck.coverImageUrl = deckData.cover_image_url;
        deck.cardCount = deckData.card_count;
        deck.syncedAt = new Date();
      });
    } catch {
      // Record doesn't exist, create it
      await deckCollection.create((deck: any) => {
        deck._raw.id = deckData.id;
        deck.userId = deckData.user_id;
        deck.name = deckData.name;
        deck.description = deckData.description;
        deck.coverImageUrl = deckData.cover_image_url;
        deck.cardCount = deckData.card_count;
        deck.createdAt = new Date(deckData.created_at);
        deck.syncedAt = new Date();
        deck.isDeleted = false;
      });
    }
  }

  private async upsertCard(cardData: any): Promise<void> {
    const cardCollection = database.collections.get('cards');
    try {
      const existingCard = await cardCollection.find(cardData.id);
      await existingCard.update((card: any) => {
        card.title = cardData.title;
        card.meaning = cardData.meaning;
        card._keywords = JSON.stringify(cardData.keywords || []);
        card._symbols = JSON.stringify(cardData.symbols || []);
        card.imageUrl = cardData.image_url;
        card.position = cardData.position;
        card.syncedAt = new Date();
      });
    } catch {
      await cardCollection.create((card: any) => {
        card._raw.id = cardData.id;
        card.deckId = cardData.deck_id;
        card.title = cardData.title;
        card.meaning = cardData.meaning;
        card._keywords = JSON.stringify(cardData.keywords || []);
        card._symbols = JSON.stringify(cardData.symbols || []);
        card.imageUrl = cardData.image_url;
        card.position = cardData.position;
        card.createdAt = new Date(cardData.created_at);
        card.syncedAt = new Date();
        card.isDeleted = false;
      });
    }
  }

  private async upsertReading(readingData: any): Promise<void> {
    const readingCollection = database.collections.get('readings');
    try {
      const existingReading = await readingCollection.find(readingData.id);
      await existingReading.update((reading: any) => {
        reading.spreadType = readingData.spread_type;
        reading.intention = readingData.intention;
        reading._cardPositions = JSON.stringify(readingData.card_positions || []);
        reading.aiInterpretation = readingData.ai_interpretation;
        reading.syncedAt = new Date();
      });
    } catch {
      await readingCollection.create((reading: any) => {
        reading._raw.id = readingData.id;
        reading.userId = readingData.user_id;
        reading.deckId = readingData.deck_id;
        reading.spreadType = readingData.spread_type;
        reading.intention = readingData.intention;
        reading._cardPositions = JSON.stringify(readingData.card_positions || []);
        reading.aiInterpretation = readingData.ai_interpretation;
        reading.createdAt = new Date(readingData.created_at);
        reading.syncedAt = new Date();
        reading.isDeleted = false;
      });
    }
  }

  private async upsertJournalEntry(entryData: any): Promise<void> {
    const entryCollection = database.collections.get('journal_entries');
    try {
      const existingEntry = await entryCollection.find(entryData.id);
      await existingEntry.update((entry: any) => {
        entry.content = entryData.content;
        entry.mood = entryData.mood;
        entry._tags = JSON.stringify(entryData.tags || []);
        entry._photoUrls = JSON.stringify(entryData.photo_urls || []);
        entry.syncedAt = new Date();
      });
    } catch {
      await entryCollection.create((entry: any) => {
        entry._raw.id = entryData.id;
        entry.readingId = entryData.reading_id;
        entry.content = entryData.content;
        entry.mood = entryData.mood;
        entry._tags = JSON.stringify(entryData.tags || []);
        entry._photoUrls = JSON.stringify(entryData.photo_urls || []);
        entry.createdAt = new Date(entryData.created_at);
        entry.syncedAt = new Date();
        entry.isDeleted = false;
      });
    }
  }

  private async pushDecks(decks: any[]): Promise<void> {
    for (const deck of decks) {
      try {
        const deckData = {
          id: deck.id,
          user_id: deck.userId,
          name: deck.name,
          description: deck.description,
          cover_image_url: deck.coverImageUrl,
          card_count: deck.cardCount,
          updated_at: deck.updatedAt.toISOString(),
        };

        const { error } = await supabase
          .from('decks')
          .upsert([deckData]);

        if (error) throw error;

        await deck.update((d: any) => {
          d.syncedAt = new Date();
        });
      } catch (error) {
        console.error('Failed to push deck:', deck.id, error);
      }
    }
  }

  private async pushCards(cards: any[]): Promise<void> {
    for (const card of cards) {
      try {
        const cardData = {
          id: card.id,
          deck_id: card.deckId,
          title: card.title,
          meaning: card.meaning,
          keywords: card.keywords,
          symbols: card.symbols,
          image_url: card.imageUrl,
          position: card.position,
          updated_at: card.updatedAt.toISOString(),
        };

        const { error } = await supabase
          .from('cards')
          .upsert([cardData]);

        if (error) throw error;

        await card.update((c: any) => {
          c.syncedAt = new Date();
        });
      } catch (error) {
        console.error('Failed to push card:', card.id, error);
      }
    }
  }

  private async pushReadings(readings: any[]): Promise<void> {
    for (const reading of readings) {
      try {
        const readingData = {
          id: reading.id,
          user_id: reading.userId,
          deck_id: reading.deckId,
          spread_type: reading.spreadType,
          intention: reading.intention,
          card_positions: reading.cardPositions,
          ai_interpretation: reading.aiInterpretation,
          updated_at: reading.updatedAt.toISOString(),
        };

        const { error } = await supabase
          .from('readings')
          .upsert([readingData]);

        if (error) throw error;

        await reading.update((r: any) => {
          r.syncedAt = new Date();
        });
      } catch (error) {
        console.error('Failed to push reading:', reading.id, error);
      }
    }
  }

  private async pushJournalEntries(entries: any[]): Promise<void> {
    for (const entry of entries) {
      try {
        const entryData = {
          id: entry.id,
          reading_id: entry.readingId,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          photo_urls: entry.photoUrls,
          updated_at: entry.updatedAt.toISOString(),
        };

        const { error } = await supabase
          .from('journal_entries')
          .upsert([entryData]);

        if (error) throw error;

        await entry.update((e: any) => {
          e.syncedAt = new Date();
        });
      } catch (error) {
        console.error('Failed to push journal entry:', entry.id, error);
      }
    }
  }

  private async getLastSyncTime(): Promise<number> {
    // In a real app, you'd store this in async storage or similar
    return 0; // For now, always sync everything
  }

  private async setLastSyncTime(timestamp: number): Promise<void> {
    // Store sync timestamp
  }
}

export const syncService = new SyncService();