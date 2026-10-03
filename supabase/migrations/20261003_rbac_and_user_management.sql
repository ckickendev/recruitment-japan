-- ==============================================================================
-- Migration: Role-Based Access Control (RBAC) & User Management System
-- Description: Creates profiles table, user_role enum, triggers, and table foreign keys.
-- ==============================================================================

-- 1. Create custom ENUM type for User Roles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'editor', 'user');
    END IF;
END $$;

-- 2. Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Automatic Trigger to create/sync profiles on new auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role := 'user';
    meta_role text;
BEGIN
    meta_role := NEW.raw_user_meta_data->>'role';

    IF meta_role = 'admin' THEN
        default_role := 'admin';
    ELSIF meta_role = 'editor' THEN
        default_role := 'editor';
    ELSE
        default_role := 'user';
    END IF;

    INSERT INTO public.profiles (id, full_name, phone, role, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Thành viên mới'),
        NEW.raw_user_meta_data->>'phone',
        default_role,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any and create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Alter jobs table: Add author_id tracking
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE public.jobs
        ADD COLUMN author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Alter contacts table: Add assigned_to tracking
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE public.contacts
        ADD COLUMN assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Basic Row Level Security (RLS) Policies
-- Profiles:
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (true);

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated 
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile" 
    ON public.profiles FOR DELETE 
    TO authenticated 
    USING (public.is_admin(auth.uid()));

-- Jobs RLS:
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs are viewable by everyone" 
    ON public.jobs FOR SELECT 
    USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins and Editors can insert jobs" ON public.jobs;
CREATE POLICY "Admins and Editors can insert jobs" 
    ON public.jobs FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Admins and Editors can update jobs" ON public.jobs;
CREATE POLICY "Admins and Editors can update jobs" 
    ON public.jobs FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Admins can delete any job; Editors only their own" ON public.jobs;
CREATE POLICY "Admins can delete any job; Editors only their own" 
    ON public.jobs FOR DELETE 
    TO authenticated 
    USING (
        public.is_admin(auth.uid()) OR (
            author_id = auth.uid() AND EXISTS (
                SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'editor'
            )
        )
    );

-- Contacts RLS:
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.contacts;
CREATE POLICY "Anyone can insert contacts" 
    ON public.contacts FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all contacts; Staff view assigned" ON public.contacts;
CREATE POLICY "Admins can view all contacts; Staff view assigned" 
    ON public.contacts FOR SELECT 
    TO authenticated 
    USING (
        public.is_admin(auth.uid()) OR assigned_to = auth.uid()
    );

DROP POLICY IF EXISTS "Admins and assigned staff can update contacts" ON public.contacts;
CREATE POLICY "Admins and assigned staff can update contacts" 
    ON public.contacts FOR UPDATE 
    TO authenticated 
    USING (
        public.is_admin(auth.uid()) OR assigned_to = auth.uid()
    );
