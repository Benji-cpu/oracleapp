// App configuration constants
export const APP_CONFIG = {
  name: 'Oracle Card Creator',
  version: '1.0.0',
  description: 'Create and use AI-assisted oracle card decks',
} as const;

// Subscription tiers and limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxDecks: 1,
    maxAIGenerations: 10,
    canExport: false,
    hasAnalytics: false,
  },
  premium: {
    maxDecks: 50,
    maxAIGenerations: 1000,
    canExport: true,
    hasAnalytics: false,
  },
  pro: {
    maxDecks: -1, // unlimited
    maxAIGenerations: -1, // unlimited
    canExport: true,
    hasAnalytics: true,
  },
} as const;

// Spread types and configurations
export const SPREAD_TYPES = {
  single: {
    name: 'Single Card',
    description: 'One card for quick insight',
    positions: 1,
    layout: [{ x: 0.5, y: 0.5, meaning: 'Your message' }],
  },
  'three-card': {
    name: 'Three Card Spread',
    description: 'Past, Present, Future',
    positions: 3,
    layout: [
      { x: 0.2, y: 0.5, meaning: 'Past' },
      { x: 0.5, y: 0.5, meaning: 'Present' },
      { x: 0.8, y: 0.5, meaning: 'Future' },
    ],
  },
  'five-card': {
    name: 'Five Card Cross',
    description: 'Situation, Challenge, Past, Future, Outcome',
    positions: 5,
    layout: [
      { x: 0.5, y: 0.3, meaning: 'Situation' },
      { x: 0.3, y: 0.5, meaning: 'Challenge' },
      { x: 0.5, y: 0.5, meaning: 'Present' },
      { x: 0.7, y: 0.5, meaning: 'Future' },
      { x: 0.5, y: 0.7, meaning: 'Outcome' },
    ],
  },
  'celtic-cross': {
    name: 'Celtic Cross',
    description: 'Traditional 10-card spread',
    positions: 10,
    layout: [
      { x: 0.5, y: 0.5, meaning: 'Present Situation' },
      { x: 0.5, y: 0.5, meaning: 'Challenge/Cross' },
      { x: 0.5, y: 0.3, meaning: 'Distant Past/Foundation' },
      { x: 0.5, y: 0.7, meaning: 'Possible Outcome' },
      { x: 0.3, y: 0.5, meaning: 'Recent Past' },
      { x: 0.7, y: 0.5, meaning: 'Near Future' },
      { x: 0.8, y: 0.8, meaning: 'Your Approach' },
      { x: 0.8, y: 0.6, meaning: 'External Influences' },
      { x: 0.8, y: 0.4, meaning: 'Hopes and Fears' },
      { x: 0.8, y: 0.2, meaning: 'Final Outcome' },
    ],
  },
} as const;

// AI service configuration
export const AI_CONFIG = {
  imageGeneration: {
    provider: 'openai',
    model: 'dall-e-3',
    defaultSize: '1024x1024',
    defaultStyle: 'vivid',
    defaultQuality: 'standard',
  },
  textGeneration: {
    provider: 'google',
    model: 'gemini-2.5-flash',
    maxTokens: 1000,
    temperature: 0.7,
  },
} as const;

// Theme colors (for Tamagui configuration)
export const THEME_COLORS = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#f59e0b',
  background: '#ffffff',
  backgroundDark: '#1f2937',
  surface: '#f9fafb',
  surfaceDark: '#374151',
  text: '#111827',
  textDark: '#f9fafb',
  textSecondary: '#6b7280',
  textSecondaryDark: '#d1d5db',
  border: '#e5e7eb',
  borderDark: '#4b5563',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

// Animation durations
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  cardFlip: 800,
  shuffle: 1000,
} as const;

// Card styling templates
export const CARD_TEMPLATES = {
  mystical: {
    name: 'Mystical',
    backgroundColor: '#1e1b4b',
    textColor: '#fbbf24',
    borderColor: '#fbbf24',
    fontFamily: 'serif',
  },
  nature: {
    name: 'Nature',
    backgroundColor: '#065f46',
    textColor: '#ecfdf5',
    borderColor: '#10b981',
    fontFamily: 'sans-serif',
  },
  celestial: {
    name: 'Celestial',
    backgroundColor: '#1e3a8a',
    textColor: '#ddd6fe',
    borderColor: '#8b5cf6',
    fontFamily: 'serif',
  },
  minimal: {
    name: 'Minimal',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#d1d5db',
    fontFamily: 'sans-serif',
  },
} as const;