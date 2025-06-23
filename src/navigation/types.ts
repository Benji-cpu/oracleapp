export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  
  // Main App Stack
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Decks: undefined;
  Reading: undefined;
  Journal: undefined;
  Settings: undefined;
};

export type DeckStackParamList = {
  DeckGallery: undefined;
  DeckCreate: undefined;
  DeckEdit: { deckId: string };
  DeckView: { deckId: string };
};

export type CardStackParamList = {
  CardStudio: { deckId: string; cardId?: string };
  CardEdit: { deckId: string; cardId: string };
  CardView: { cardId: string };
};

export type ReadingStackParamList = {
  ReadingHome: undefined;
  ReadingSetup: { deckId: string };
  ReadingSession: { deckId: string; spreadType: string; intention?: string };
  ReadingResult: { readingId: string };
};

export type JournalStackParamList = {
  JournalHome: undefined;
  JournalEntry: { readingId: string };
  JournalEdit: { entryId: string };
};