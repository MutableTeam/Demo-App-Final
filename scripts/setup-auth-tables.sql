-- Adding missing authentication columns to existing users_sync table
ALTER TABLE neon_auth.users_sync 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Creating sessions table for JWT token management
CREATE TABLE IF NOT EXISTS neon_auth.user_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating game stats table for future use
CREATE TABLE IF NOT EXISTS neon_auth.game_stats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adding indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON neon_auth.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON neon_auth.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON neon_auth.game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_users_sync_email ON neon_auth.users_sync(email);
