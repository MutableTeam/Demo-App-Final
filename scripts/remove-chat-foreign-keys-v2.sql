-- Remove all foreign key constraints from chat tables to allow anonymous messaging
-- This allows the chat to work without requiring user authentication

-- First, check if foreign key constraints exist and drop them
DO $$ 
BEGIN
    -- Drop foreign key constraint on chat_messages.user_id if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_user_id_fkey' 
        AND table_name = 'chat_messages'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.chat_messages DROP CONSTRAINT chat_messages_user_id_fkey;
        RAISE NOTICE 'Dropped chat_messages_user_id_fkey constraint';
    END IF;

    -- Drop foreign key constraint on chat_user_status.user_id if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_user_status_user_id_fkey' 
        AND table_name = 'chat_user_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.chat_user_status DROP CONSTRAINT chat_user_status_user_id_fkey;
        RAISE NOTICE 'Dropped chat_user_status_user_id_fkey constraint';
    END IF;

    -- Drop any other foreign key constraints that might exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%user_id_fkey%' 
        AND table_name IN ('chat_messages', 'chat_user_status')
        AND table_schema = 'public'
    ) THEN
        -- Get all foreign key constraints and drop them
        FOR constraint_record IN 
            SELECT constraint_name, table_name 
            FROM information_schema.table_constraints 
            WHERE constraint_name LIKE '%user_id_fkey%' 
            AND table_name IN ('chat_messages', 'chat_user_status')
            AND table_schema = 'public'
        LOOP
            EXECUTE 'ALTER TABLE public.' || constraint_record.table_name || ' DROP CONSTRAINT ' || constraint_record.constraint_name;
            RAISE NOTICE 'Dropped constraint % from table %', constraint_record.constraint_name, constraint_record.table_name;
        END LOOP;
    END IF;
END $$;

-- Ensure tables have the correct structure without foreign key constraints
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
CREATE INDEX IF NOT EXISTS idx_chat_user_status_last_seen ON public.chat_user_status(last_seen DESC);

RAISE NOTICE 'Chat tables are now ready for anonymous messaging without foreign key constraints';
