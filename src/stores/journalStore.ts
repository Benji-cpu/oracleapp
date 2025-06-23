import { create } from 'zustand';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import type { JournalEntry } from '../types';
import { syncService } from '../services/syncService';

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  loading: boolean;
  createJournalEntry: (entry: Omit<JournalEntry, 'id' | 'created_at'>) => Promise<JournalEntry>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  fetchJournalEntries: (readingId?: string) => Promise<void>;
  fetchAllJournalEntries: () => Promise<void>;
  setCurrentEntry: (entry: JournalEntry | null) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  currentEntry: null,
  loading: false,

  createJournalEntry: async (entryData) => {
    set({ loading: true });
    try {
      // Create in local database first
      const newEntry = await database.write(async () => {
        return await database.collections.get('journal_entries').create((entry: any) => {
          entry.readingId = entryData.reading_id;
          entry.content = entryData.content;
          entry.mood = entryData.mood || '';
          entry.setTags(entryData.tags || []);
          entry.setPhotoUrls(entryData.photo_urls || []);
          entry.isDeleted = false;
          entry.syncedAt = null; // Will sync later
        });
      });

      // Convert to our JournalEntry type
      const entryResult: JournalEntry = {
        id: newEntry.id,
        reading_id: newEntry.readingId,
        content: newEntry.content,
        mood: newEntry.mood,
        tags: newEntry.tags,
        photo_urls: newEntry.photoUrls,
        created_at: newEntry.createdAt.toISOString(),
      };

      set((state) => ({
        entries: [...state.entries, entryResult],
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);

      return entryResult;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateJournalEntry: async (id, updates) => {
    set({ loading: true });
    try {
      // Update in local database
      const updatedEntry = await database.write(async () => {
        const entry = await database.collections.get('journal_entries').find(id);
        return await entry.update((e: any) => {
          if (updates.content !== undefined) e.content = updates.content;
          if (updates.mood !== undefined) e.mood = updates.mood;
          if (updates.tags !== undefined) e.setTags(updates.tags);
          if (updates.photo_urls !== undefined) e.setPhotoUrls(updates.photo_urls);
          e.syncedAt = null; // Mark for sync
        });
      });

      // Convert to our JournalEntry type
      const entryResult: JournalEntry = {
        id: updatedEntry.id,
        reading_id: updatedEntry.readingId,
        content: updatedEntry.content,
        mood: updatedEntry.mood,
        tags: updatedEntry.tags,
        photo_urls: updatedEntry.photoUrls,
        created_at: updatedEntry.createdAt.toISOString(),
      };

      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === id ? entryResult : entry
        ),
        currentEntry: state.currentEntry?.id === id ? entryResult : state.currentEntry,
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteJournalEntry: async (id) => {
    set({ loading: true });
    try {
      // Mark as deleted in local database (soft delete)
      await database.write(async () => {
        const entry = await database.collections.get('journal_entries').find(id);
        await entry.update((e: any) => {
          e.isDeleted = true;
          e.syncedAt = null; // Mark for sync
        });
      });

      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchJournalEntries: async (readingId) => {
    set({ loading: true });
    try {
      // Fetch from local database first
      const query = readingId
        ? [Q.where('reading_id', readingId), Q.where('is_deleted', false), Q.sortBy('created_at', Q.desc)]
        : [Q.where('is_deleted', false), Q.sortBy('created_at', Q.desc)];

      const localEntries = await database.collections
        .get('journal_entries')
        .query(...query)
        .fetch();

      // Convert to our JournalEntry type
      const entries: JournalEntry[] = localEntries.map((entry: any) => ({
        id: entry.id,
        reading_id: entry.readingId,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags,
        photo_urls: entry.photoUrls,
        created_at: entry.createdAt.toISOString(),
      }));

      set({
        entries,
        loading: false,
      });

      // Sync with server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchAllJournalEntries: async () => {
    await get().fetchJournalEntries();
  },

  setCurrentEntry: (entry) => {
    set({ currentEntry: entry });
  },
}));