import { create } from 'zustand';
import { database } from '../database';
import { supabase } from '../../lib/supabase';
import { Q } from '@nozbe/watermelondb';
import type { CardState, Card } from '../types';
import { syncService } from '../services/syncService';
import { aiService } from '../services/aiService';

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  currentCard: null,
  loading: false,

  createCard: async (cardData) => {
    set({ loading: true });
    try {
      // Create in local database first
      const newCard = await database.write(async () => {
        return await database.collections.get('cards').create((card: any) => {
          card.deckId = cardData.deck_id;
          card.title = cardData.title;
          card.meaning = cardData.meaning || '';
          card.setKeywords(cardData.keywords || []);
          card.styleTemplate = cardData.style_template || 'mystical';
          card.setSymbols(cardData.symbols || []);
          card.imageUrl = cardData.image_url;
          card.position = cardData.position;
          card.isDeleted = false;
          card.syncedAt = null; // Will sync later
        });
      });

      // Convert to our Card type
      const cardResult: Card = {
        id: newCard.id,
        deck_id: newCard.deckId,
        title: newCard.title,
        meaning: newCard.meaning,
        keywords: newCard.keywords,
        style_template: newCard.styleTemplate,
        symbols: newCard.symbols,
        image_url: newCard.imageUrl,
        position: newCard.position,
        created_at: newCard.createdAt.toISOString(),
        updated_at: newCard.updatedAt.toISOString(),
      };

      set((state) => ({
        cards: [...state.cards, cardResult],
        loading: false,
      }));

      // Update deck card count
      await database.write(async () => {
        const deck = await database.collections.get('decks').find(cardData.deck_id);
        await deck.update((d: any) => {
          d.cardCount = d.cardCount + 1;
          d.syncedAt = null;
        });
      });

      // Sync to server in background
      syncService.syncAll().catch(console.error);

      return cardResult;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateCard: async (id, updates) => {
    set({ loading: true });
    try {
      // Update in local database
      const updatedCard = await database.write(async () => {
        const card = await database.collections.get('cards').find(id);
        return await card.update((c: any) => {
          if (updates.title !== undefined) c.title = updates.title;
          if (updates.meaning !== undefined) c.meaning = updates.meaning;
          if (updates.keywords !== undefined) c.setKeywords(updates.keywords);
          if (updates.style_template !== undefined) c.styleTemplate = updates.style_template;
          if (updates.symbols !== undefined) c.setSymbols(updates.symbols);
          if (updates.image_url !== undefined) c.imageUrl = updates.image_url;
          if (updates.position !== undefined) c.position = updates.position;
          c.syncedAt = null; // Mark for sync
        });
      });

      // Convert to our Card type
      const cardResult: Card = {
        id: updatedCard.id,
        deck_id: updatedCard.deckId,
        title: updatedCard.title,
        meaning: updatedCard.meaning,
        keywords: updatedCard.keywords,
        style_template: updatedCard.styleTemplate,
        symbols: updatedCard.symbols,
        image_url: updatedCard.imageUrl,
        position: updatedCard.position,
        created_at: updatedCard.createdAt.toISOString(),
        updated_at: updatedCard.updatedAt.toISOString(),
      };

      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? cardResult : card
        ),
        currentCard: state.currentCard?.id === id ? cardResult : state.currentCard,
        loading: false,
      }));

      // Sync to server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteCard: async (id) => {
    set({ loading: true });
    try {
      // Get card info before deletion for deck count update
      const card = await database.collections.get('cards').find(id);
      const deckId = card.deckId;

      // Mark as deleted in local database (soft delete)
      await database.write(async () => {
        await card.update((c: any) => {
          c.isDeleted = true;
          c.syncedAt = null; // Mark for sync
        });
      });

      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
        currentCard: state.currentCard?.id === id ? null : state.currentCard,
        loading: false,
      }));

      // Update deck card count
      await database.write(async () => {
        const deck = await database.collections.get('decks').find(deckId);
        await deck.update((d: any) => {
          d.cardCount = Math.max(0, d.cardCount - 1);
          d.syncedAt = null;
        });
      });

      // Sync to server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchCardsByDeck: async (deckId) => {
    set({ loading: true });
    try {
      // Fetch from local database first
      const localCards = await database.collections
        .get('cards')
        .query(
          Q.where('deck_id', deckId),
          Q.where('is_deleted', false),
          Q.sortBy('position', Q.asc)
        )
        .fetch();

      // Convert to our Card type
      const cards: Card[] = localCards.map((card: any) => ({
        id: card.id,
        deck_id: card.deckId,
        title: card.title,
        meaning: card.meaning,
        keywords: card.keywords,
        style_template: card.styleTemplate,
        symbols: card.symbols,
        image_url: card.imageUrl,
        position: card.position,
        created_at: card.createdAt.toISOString(),
        updated_at: card.updatedAt.toISOString(),
      }));

      set({
        cards,
        loading: false,
      });

      // Sync with server in background
      syncService.syncAll().catch(console.error);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentCard: (card) => {
    set({ currentCard: card });
  },

  generateMeaning: async (cardId: string, title?: string, keywords?: string[], styleTemplate?: string) => {
    set({ loading: true });
    try {
      const result = await aiService.generateMeaning({
        card_id: cardId,
        title,
        keywords,
        style_template: styleTemplate,
      });

      // Update the card with the generated meaning
      await get().updateCard(cardId, { meaning: result.meaning });
      
      set({ loading: false });
      return result.meaning;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  generateImage: async (cardId: string, title?: string, meaning?: string, keywords?: string[], styleTemplate?: string) => {
    set({ loading: true });
    try {
      const result = await aiService.generateImage({
        card_id: cardId,
        title,
        meaning,
        keywords,
        style_template: styleTemplate,
      });

      // Update the card with the generated image URL
      await get().updateCard(cardId, { image_url: result.image_url });
      
      set({ loading: false });
      return result.image_url;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));