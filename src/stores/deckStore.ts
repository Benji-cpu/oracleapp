import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { DeckState, Deck } from '../types';

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  currentDeck: null,
  loading: false,

  createDeck: async (deckData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([deckData])
        .select()
        .single();

      if (error) throw error;

      const newDeck = data as Deck;
      set((state) => ({
        decks: [...state.decks, newDeck],
        loading: false,
      }));

      return newDeck;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateDeck: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('decks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedDeck = data as Deck;
      set((state) => ({
        decks: state.decks.map((deck) =>
          deck.id === id ? updatedDeck : deck
        ),
        currentDeck: state.currentDeck?.id === id ? updatedDeck : state.currentDeck,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteDeck: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id),
        currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchDecks: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        decks: data as Deck[],
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentDeck: (deck) => {
    set({ currentDeck: deck });
  },
}));