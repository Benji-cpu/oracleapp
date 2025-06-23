import { supabase } from '../../lib/supabase';
import type { User, Deck, Card, Reading, JournalEntry } from '../types';

export class SupabaseService {
  // Auth methods
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user as User;
  }

  static async signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  static async signUpWithEmail(email: string, password: string, username?: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
  }

  static async signOut() {
    return await supabase.auth.signOut();
  }

  // Profile methods
  static async createProfile(userId: string, data: Partial<User>) {
    return await supabase
      .from('profiles')
      .insert([{ id: userId, ...data }]);
  }

  static async updateProfile(userId: string, data: Partial<User>) {
    return await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
  }

  // Deck methods
  static async getDecks(userId: string): Promise<Deck[]> {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Deck[];
  }

  static async createDeck(deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .insert([deck])
      .select()
      .single();

    if (error) throw error;
    return data as Deck;
  }

  static async updateDeck(id: string, updates: Partial<Deck>): Promise<Deck> {
    const { data, error } = await supabase
      .from('decks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Deck;
  }

  static async deleteDeck(id: string): Promise<void> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Card methods
  static async getCardsByDeck(deckId: string): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as Card[];
  }

  static async createCard(card: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .insert([card])
      .select()
      .single();

    if (error) throw error;
    return data as Card;
  }

  static async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Card;
  }

  static async deleteCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Reading methods
  static async createReading(reading: Omit<Reading, 'id' | 'created_at'>): Promise<Reading> {
    const { data, error } = await supabase
      .from('readings')
      .insert([reading])
      .select()
      .single();

    if (error) throw error;
    return data as Reading;
  }

  static async getReadings(userId: string): Promise<Reading[]> {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Reading[];
  }

  // Journal methods
  static async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at'>): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data as JournalEntry;
  }

  static async getJournalEntries(readingId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('reading_id', readingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as JournalEntry[];
  }

  // AI Service calls (Edge Functions)
  static async generateCardMeaning(cardId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('generate_meaning', {
      body: { card_id: cardId }
    });

    if (error) throw error;
    return data.meaning;
  }

  static async generateCardImage(cardId: string, prompt: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('generate_image', {
      body: { card_id: cardId, prompt }
    });

    if (error) throw error;
    return data.image_url;
  }

  static async interpretReading(readingId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('interpret_reading', {
      body: { reading_id: readingId }
    });

    if (error) throw error;
    return data.interpretation;
  }

  // File upload
  static async uploadImage(file: Blob, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(path);

    return publicUrl;
  }
}