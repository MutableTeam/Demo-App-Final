-- Remove foreign key constraints from chat tables to allow anonymous messaging
-- This script will remove the specific foreign key constraints that are causing the 500 errors

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Remove foreign key constraint from chat_messages table
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.chat_messages'::regclass 
    AND contype = 'f' 
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.chat_messages'::regclass AND attname = 'user_id')];
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.chat_messages DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Removed foreign key constraint % from chat_messages table', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on chat_messages.user_id';
    END IF;

    -- Remove foreign key constraint from chat_user_status table
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.chat_user_status'::regclass 
    AND contype = 'f' 
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.chat_user_status'::regclass AND attname = 'user_id')];
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.chat_user_status DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Removed foreign key constraint % from chat_user_status table', constraint_name;
    ELSE
        RAISE NOTICE 'No foreign key constraint found on chat_user_status.user_id';
    END IF;

    RAISE NOTICE 'Foreign key constraint removal completed successfully!';
    RAISE NOTICE 'Chat should now work without authentication requirements.';
END $$;

-- Verify the constraints are gone
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.table_name IN ('chat_messages', 'chat_user_status')
    AND tc.constraint_type = 'FOREIGN KEY';
