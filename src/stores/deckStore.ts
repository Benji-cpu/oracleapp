import { create } from 'zustand';
import { database } from '../database';
import { supabase } from '../../lib/supabase';
import { Q } from '@nozbe/watermelondb';
import type { DeckState, Deck } from '../types';
import { syncService } from '../services/syncService';

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  currentDeck: null,
  loading: false,

  createDeck: async (deckData) => {
    set({ loading: true });
    try {
      // Create in local database first
      const newDeck = await database.write(async () => {
        return await database.collections.get('decks').create((deck: any) => {
          deck.userId = deckData.user_id;
          deck.name = deckData.name;
          deck.description = deckData.description || '';
          deck.cardCount = 0;
          deck.isDeleted = false;
          deck.syncedAt = null; // Will sync later
        });
      });

      // Convert to our Deck type
      const deckResult: Deck = {
        id: newDeck.id,
        user_id: newDeck.userId,
        name: newDeck.name,
        description: newDeck.description,
        cover_image_url: newDeck.coverImageUrl,
        card_count: newDeck.cardCount,
        created_at: newDeck.createdAt.toISOString(),
        updated_at: newDeck.updatedAt.toISOString(),
      };

      set((state) => ({
        decks: [...state.decks, deckResult],
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);

      return deckResult;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateDeck: async (id, updates) => {
    set({ loading: true });
    try {
      // Update in local database
      const updatedDeck = await database.write(async () => {
        const deck = await database.collections.get('decks').find(id);
        return await deck.update((d: any) => {
          if (updates.name !== undefined) d.name = updates.name;
          if (updates.description !== undefined) d.description = updates.description;
          if (updates.cover_image_url !== undefined) d.coverImageUrl = updates.cover_image_url;
          if (updates.card_count !== undefined) d.cardCount = updates.card_count;
          d.syncedAt = null; // Mark for sync
        });
      });

      // Convert to our Deck type
      const deckResult: Deck = {
        id: updatedDeck.id,
        user_id: updatedDeck.userId,
        name: updatedDeck.name,
        description: updatedDeck.description,
        cover_image_url: updatedDeck.coverImageUrl,
        card_count: updatedDeck.cardCount,
        created_at: updatedDeck.createdAt.toISOString(),
        updated_at: updatedDeck.updatedAt.toISOString(),
      };

      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === id ? deckResult : deck
        ),
        currentDeck: state.currentDeck?.id === id ? deckResult : state.currentDeck,
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteDeck: async (id) => {
    set({ loading: true });
    try {
      // Mark as deleted in local database (soft delete)
      await database.write(async () => {
        const deck = await database.collections.get('decks').find(id);
        await deck.update((d: any) => {
          d.isDeleted = true;
          d.syncedAt = null; // Mark for sync
        });
      });

      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id),
        currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchDecks: async () => {
    set({ loading: true });
    try {
      // Fetch from local database first
      const localDecks = await database.collections
        .get('decks')
        .query(Q.where('is_deleted', false))
        .fetch();

      // Convert to our Deck type
      const decks: Deck[] = localDecks.map((deck: any) => ({
        id: deck.id,
        user_id: deck.userId,
        name: deck.name,
        description: deck.description,
        cover_image_url: deck.coverImageUrl,
        card_count: deck.cardCount,
        created_at: deck.createdAt.toISOString(),
        updated_at: deck.updatedAt.toISOString(),
      }));

      set({
        decks,
        loading: false,
      });

      // Sync with server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentDeck: (deck) => {
    set({ currentDeck: deck });
  },
}));