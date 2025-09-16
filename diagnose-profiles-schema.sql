-- Diagnostic script to check the current state of the profiles table
-- Run this in your Supabase SQL Editor to understand the current schema

-- 1. Check if user_id column exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name = 'user_id';

-- 2. Check all columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if the unique index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
AND indexname = 'profiles_user_id_unique_idx';

-- 4. Check a sample of data in the profiles table
SELECT * FROM profiles LIMIT 5;

-- 5. Check if the handle_new_user function exists and its definition
SELECT 
    proname,
    pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';