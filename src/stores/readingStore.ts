import { create } from 'zustand';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import type { Reading, CardPosition } from '../types';
import { syncService } from '../services/syncService';
import { aiService } from '../services/aiService';

interface ReadingState {
  readings: Reading[];
  currentReading: Reading | null;
  loading: boolean;
  createReading: (reading: Omit<Reading, 'id' | 'created_at'>) => Promise<Reading>;
  fetchReadings: (userId: string) => Promise<void>;
  setCurrentReading: (reading: Reading | null) => void;
  generateInterpretation: (readingId: string) => Promise<string>;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  readings: [],
  currentReading: null,
  loading: false,

  createReading: async (readingData) => {
    set({ loading: true });
    try {
      // Create in local database first
      const newReading = await database.write(async () => {
        return await database.collections.get('readings').create((reading: any) => {
          reading.userId = readingData.user_id;
          reading.deckId = readingData.deck_id;
          reading.spreadType = readingData.spread_type;
          reading.intention = readingData.intention || '';
          reading.setCardPositions(readingData.card_positions);
          reading.aiInterpretation = readingData.ai_interpretation || '';
          reading.isDeleted = false;
          reading.syncedAt = null; // Will sync later
        });
      });

      // Convert to our Reading type
      const readingResult: Reading = {
        id: newReading.id,
        user_id: newReading.userId,
        deck_id: newReading.deckId,
        spread_type: newReading.spreadType,
        intention: newReading.intention,
        card_positions: newReading.cardPositions,
        ai_interpretation: newReading.aiInterpretation,
        created_at: newReading.createdAt.toISOString(),
      };

      set((state) => ({
        readings: [...state.readings, readingResult],
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);

      return readingResult;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchReadings: async (userId) => {
    set({ loading: true });
    try {
      // Fetch from local database first
      const localReadings = await database.collections
        .get('readings')
        .query(
          Q.where('user_id', userId),
          Q.where('is_deleted', false),
          Q.sortBy('created_at', Q.desc)
        )
        .fetch();

      // Convert to our Reading type
      const readings: Reading[] = localReadings.map((reading: any) => ({
        id: reading.id,
        user_id: reading.userId,
        deck_id: reading.deckId,
        spread_type: reading.spreadType,
        intention: reading.intention,
        card_positions: reading.cardPositions,
        ai_interpretation: reading.aiInterpretation,
        created_at: reading.createdAt.toISOString(),
      }));

      set({
        readings,
        loading: false,
      });

      // Sync with server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentReading: (reading) => {
    set({ currentReading: reading });
  },

  generateInterpretation: async (readingId: string) => {
    set({ loading: true });
    try {
      const result = await aiService.interpretReading({
        reading_id: readingId,
      });

      // Update the reading with the interpretation in local database
      await database.write(async () => {
        const reading = await database.collections.get('readings').find(readingId);
        await reading.update((r: any) => {
          r.aiInterpretation = result.interpretation;
          r.syncedAt = null; // Mark for sync
        });
      });

      // Update the state
      set((state) => ({
        readings: state.readings.map((reading) =>
          reading.id === readingId 
            ? { ...reading, ai_interpretation: result.interpretation }
            : reading
        ),
        currentReading: state.currentReading?.id === readingId 
          ? { ...state.currentReading, ai_interpretation: result.interpretation }
          : state.currentReading,
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);

      return result.interpretation;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));