import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Profile, Deck, Card, Reading, JournalEntry } from './models';

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  // (optional database name or file system path)
  // dbName: 'oracle_card_creator',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: true, /* Platform.OS === 'ios' */
  // (optional, but you should implement this method)
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  }
});

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [
    Profile,
    Deck,
    Card,
    Reading,
    JournalEntry,
  ],
});