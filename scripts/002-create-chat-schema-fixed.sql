-- Create chat_messages table for storing all chat messages
-- Fixed schema reference to neon_auth.users_sync
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) > 0 AND LENGTH(message) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_active ON chat_messages(created_at DESC) WHERE is_deleted = FALSE;

-- Create chat_user_status table for tracking online users
-- Fixed schema reference to neon_auth.users_sync
CREATE TABLE IF NOT EXISTS chat_user_status (
  user_id TEXT PRIMARY KEY REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for online users lookup
CREATE INDEX IF NOT EXISTS idx_chat_user_status_online ON chat_user_status(is_online, last_seen DESC) WHERE is_online = TRUE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_user_status_updated_at 
    BEFORE UPDATE ON chat_user_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- Fixed schema reference to neon_auth.users_sync in SELECT query
-- This will be ignored if users_sync table is empty
INSERT INTO chat_user_status (user_id, username, is_online, last_seen)
SELECT id, COALESCE(name, email), FALSE, NOW()
FROM neon_auth.users_sync
WHERE NOT EXISTS (
    SELECT 1 FROM chat_user_status WHERE user_id = neon_auth.users_sync.id
);
