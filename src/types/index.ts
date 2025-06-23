// Core data types based on database schema
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'pro';
  created_at: string;
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  title: string;
  meaning?: string;
  keywords: string[];
  style_template?: string;
  symbols: string[];
  image_url?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Reading {
  id: string;
  user_id: string;
  deck_id: string;
  spread_type: 'single' | 'three-card' | 'five-card' | 'celtic-cross' | 'custom';
  intention?: string;
  card_positions: CardPosition[];
  ai_interpretation?: string;
  created_at: string;
}

export interface CardPosition {
  card_id: string;
  position: number;
  position_meaning?: string;
}

export interface JournalEntry {
  id: string;
  reading_id: string;
  content: string;
  mood?: string;
  tags: string[];
  photo_urls: string[];
  created_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  service_type: 'image_generation' | 'meaning_generation' | 'interpretation';
  tokens_used: number;
  created_at: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  DeckGallery: undefined;
  DeckCreate: undefined;
  DeckEdit: { deckId: string };
  CardStudio: { deckId: string; cardId?: string };
  Reading: { deckId: string };
  ReadingResult: { readingId: string };
  Journal: { readingId: string };
  Settings: undefined;
  Subscription: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Store state types
export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  loading: boolean;
  createDeck: (deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  fetchDecks: () => Promise<void>;
  setCurrentDeck: (deck: Deck | null) => void;
}

export interface CardState {
  cards: Card[];
  currentCard: Card | null;
  loading: boolean;
  createCard: (card: Omit<Card, 'id' | 'created_at' | 'updated_at'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  fetchCardsByDeck: (deckId: string) => Promise<void>;
  setCurrentCard: (card: Card | null) => void;
}