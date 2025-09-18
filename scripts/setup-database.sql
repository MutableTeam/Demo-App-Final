-- Setup script for user authentication tables
-- This extends the existing users_sync table structure

-- Ensure the users_sync table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_sync_email ON users_sync(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_sync_created_at ON users_sync(created_at);
CREATE INDEX IF NOT EXISTS idx_users_sync_deleted_at ON users_sync(deleted_at);

-- Add a unique constraint on email for active users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_sync_email_unique 
ON users_sync(email) WHERE deleted_at IS NULL;

-- Create a table for user sessions (optional, for advanced session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users_sync(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);

-- Create a table for user game statistics (for the archer arena game)
CREATE TABLE IF NOT EXISTS user_game_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users_sync(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL, -- 'archer_arena', 'last_stand', etc.
    stats_data JSONB NOT NULL DEFAULT '{}',
    high_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    total_playtime_seconds INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_game_stats
CREATE INDEX IF NOT EXISTS idx_user_game_stats_user_id ON user_game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_stats_game_type ON user_game_stats(game_type);
CREATE INDEX IF NOT EXISTS idx_user_game_stats_high_score ON user_game_stats(high_score DESC);

-- Create unique constraint for user-game combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_game_stats_unique 
ON user_game_stats(user_id, game_type);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_sync_updated_at 
    BEFORE UPDATE ON users_sync 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_game_stats_updated_at 
    BEFORE UPDATE ON user_game_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO users_sync (id, email, name, raw_json, created_at, updated_at)
-- VALUES (
--     'user_test_' || extract(epoch from now()),
--     'test@example.com',
--     'Test User',
--     '{"hashedPassword": "$2a$12$example", "loginAttempts": 0}',
--     NOW(),
--     NOW()
-- ) ON CONFLICT DO NOTHING;
