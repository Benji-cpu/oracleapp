-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'pro');
CREATE TYPE purchase_status AS ENUM ('pending', 'active', 'expired', 'refunded');
CREATE TYPE ai_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Decks table
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    card_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    meaning TEXT,
    keywords TEXT[],
    style_template TEXT,
    symbols TEXT[],
    image_url TEXT,
    position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Readings table
CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    spread_type TEXT NOT NULL,
    intention TEXT,
    card_positions JSONB,
    ai_interpretation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Journal entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reading_id UUID REFERENCES readings(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[],
    photo_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Usage tracking table
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Push tokens table
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    receipt TEXT NOT NULL,
    tier subscription_tier NOT NULL,
    status purchase_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Deck versions table (for version history)
CREATE TABLE deck_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE deck_versions ENABLE ROW LEVEL SECURITY;

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Symbol library table
CREATE TABLE symbol_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    svg_url TEXT NOT NULL,
    keywords TEXT[],
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI jobs table
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload_json JSONB NOT NULL,
    status ai_job_status DEFAULT 'pending',
    output_url TEXT,
    tokens_used INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_deck_id ON readings(deck_id);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_reading_id ON journal_entries(reading_id);
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_deck_versions_deck_id ON deck_versions(deck_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_readings_updated_at BEFORE UPDATE ON readings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_jobs_updated_at BEFORE UPDATE ON ai_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Decks: Users can only see/edit their own decks
CREATE POLICY "Users can view own decks" ON decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decks" ON decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON decks FOR DELETE USING (auth.uid() = user_id);

-- Cards: Users can only see/edit cards in their own decks
CREATE POLICY "Users can view own cards" ON cards FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own cards" ON cards FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own cards" ON cards FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own cards" ON cards FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM decks WHERE decks.id = cards.deck_id AND decks.user_id = auth.uid()
    )
);

-- Readings: Users can only see/edit their own readings
CREATE POLICY "Users can view own readings" ON readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readings" ON readings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own readings" ON readings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own readings" ON readings FOR DELETE USING (auth.uid() = user_id);

-- Journal entries: Users can only see/edit their own journal entries
CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Usage tracking: Users can only see their own usage
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Push tokens: Users can only manage their own tokens
CREATE POLICY "Users can view own push tokens" ON push_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own push tokens" ON push_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own push tokens" ON push_tokens FOR DELETE USING (auth.uid() = user_id);

-- Purchases: Users can only see their own purchases
CREATE POLICY "Users can view own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deck versions: Users can only see versions of their own decks
CREATE POLICY "Users can view own deck versions" ON deck_versions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM decks WHERE decks.id = deck_versions.deck_id AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own deck versions" ON deck_versions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM decks WHERE decks.id = deck_versions.deck_id AND decks.user_id = auth.uid()
    )
);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- AI jobs: Users can only see their own AI jobs
CREATE POLICY "Users can view own ai jobs" ON ai_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai jobs" ON ai_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Symbol library: Everyone can read, no writes from client
CREATE POLICY "Anyone can view symbol library" ON symbol_library FOR SELECT USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();