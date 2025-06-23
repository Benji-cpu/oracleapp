import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { CardState, Card } from '../types';

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  currentCard: null,
  loading: false,

  createCard: async (cardData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([cardData])
        .select()
        .single();

      if (error) throw error;

      const newCard = data as Card;
      set((state) => ({
        cards: [...state.cards, newCard],
        loading: false,
      }));

      return newCard;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateCard: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCard = data as Card;
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === id ? updatedCard : card
        ),
        currentCard: state.currentCard?.id === id ? updatedCard : state.currentCard,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteCard: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        cards: state.cards.filter((card) => card.id !== id),
        currentCard: state.currentCard?.id === id ? null : state.currentCard,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchCardsByDeck: async (deckId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('position', { ascending: true });

      if (error) throw error;

      set({
        cards: data as Card[],
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentCard: (card) => {
    set({ currentCard: card });
  },
}));