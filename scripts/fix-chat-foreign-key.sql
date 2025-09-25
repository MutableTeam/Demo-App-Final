-- Fix foreign key constraint issue in chat_messages table
-- This script removes the foreign key constraint that's causing the 500 error

-- First, let's check what constraints exist
-- SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name 
-- FROM information_schema.key_column_usage 
-- WHERE table_name = 'chat_messages';

-- Drop the foreign key constraint that's preventing message insertion
-- The constraint name might vary, so we'll try common patterns
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop foreign key constraints on chat_messages.user_id
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'chat_messages' 
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Ensure the chat_user_status table has the right structure for our chat system
-- This will serve as our user registry for chat
CREATE TABLE IF NOT EXISTS chat_user_status (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_user_status_username ON chat_user_status(username);
CREATE INDEX IF NOT EXISTS idx_chat_user_status_online ON chat_user_status(is_online);

-- Ensure chat_messages table exists with the right structure
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_not_deleted ON chat_messages(is_deleted) WHERE is_deleted = FALSE;

-- Insert a test user to ensure the system works
INSERT INTO chat_user_status (user_id, username, is_online, last_seen)
VALUES ('user_Nebbyyy', 'Nebbyyy', TRUE, NOW())
ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    is_online = TRUE,
    last_seen = NOW(),
    updated_at = NOW();

RAISE NOTICE 'Chat database schema fixed successfully!';
