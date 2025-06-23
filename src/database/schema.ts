import { appSchema, tableSchema } from '@nozbe/watermelondb/Schema';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'profiles',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'username', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'subscription_tier', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'decks',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'cover_image_url', type: 'string', isOptional: true },
        { name: 'card_count', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'cards',
      columns: [
        { name: 'deck_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'meaning', type: 'string', isOptional: true },
        { name: 'keywords', type: 'string', isOptional: true }, // JSON string
        { name: 'style_template', type: 'string', isOptional: true },
        { name: 'symbols', type: 'string', isOptional: true }, // JSON string
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'readings',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'deck_id', type: 'string', isIndexed: true },
        { name: 'spread_type', type: 'string' },
        { name: 'intention', type: 'string', isOptional: true },
        { name: 'card_positions', type: 'string' }, // JSON string
        { name: 'ai_interpretation', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'journal_entries',
      columns: [
        { name: 'reading_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'mood', type: 'string', isOptional: true },
        { name: 'tags', type: 'string', isOptional: true }, // JSON string
        { name: 'photo_urls', type: 'string', isOptional: true }, // JSON string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'usage_tracking',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'service_type', type: 'string' },
        { name: 'tokens_used', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'sync_queue',
      columns: [
        { name: 'table_name', type: 'string' },
        { name: 'record_id', type: 'string' },
        { name: 'action', type: 'string' }, // 'create', 'update', 'delete'
        { name: 'data', type: 'string', isOptional: true }, // JSON string
        { name: 'created_at', type: 'number' },
        { name: 'retries', type: 'number' },
        { name: 'last_error', type: 'string', isOptional: true },
      ],
    }),
  ],
});