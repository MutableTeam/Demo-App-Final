-- Remove all foreign key constraints from chat tables to allow anonymous messaging
-- This allows the chat to work without requiring user authentication

-- First, let's check what foreign key constraints exist
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all foreign key constraints on chat_messages table
    FOR constraint_record IN 
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint 
        WHERE conrelid = 'public.chat_messages'::regclass 
        AND contype = 'f'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.conname);
        RAISE NOTICE 'Dropped foreign key constraint % from %', 
                     constraint_record.conname, 
                     constraint_record.table_name;
    END LOOP;

    -- Find and drop all foreign key constraints on chat_user_status table
    FOR constraint_record IN 
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint 
        WHERE conrelid = 'public.chat_user_status'::regclass 
        AND contype = 'f'
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.conname);
        RAISE NOTICE 'Dropped foreign key constraint % from %', 
                     constraint_record.conname, 
                     constraint_record.table_name;
    END LOOP;
END $$;

-- Ensure the tables have the correct structure without foreign key constraints
-- Recreate chat_messages table if needed
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Recreate chat_user_status table if needed
CREATE TABLE IF NOT EXISTS public.chat_user_status (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    is_online BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_status_updated_at ON public.chat_user_status(updated_at DESC);

RAISE NOTICE 'Successfully removed all foreign key constraints from chat tables';
RAISE NOTICE 'Chat tables are now ready for anonymous messaging';
