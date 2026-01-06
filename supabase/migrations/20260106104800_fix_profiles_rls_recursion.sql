-- =============================================
-- VidFlow Manager - Fix Profiles RLS Recursion
-- Created: 2026-01-06 10:48 KST
-- Purpose: Fix infinite recursion in profiles table RLS policies
-- 
-- Issue: profiles_select policy was querying profiles table within itself
-- Solution: Use auth.jwt()->>'role' or raw_user_meta_data for admin check
-- =============================================

-- First, drop the problematic policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- =============================================
-- FIXED PROFILES POLICIES
-- Using auth.jwt() metadata instead of querying profiles table
-- =============================================

-- SELECT policy: users see own profile, admins see all
-- Uses the 'role' in JWT metadata or raw_user_meta_data to check admin status
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (
        id = (select auth.uid())
        OR (
            -- Check if app_metadata contains admin role
            (select auth.jwt()->>'role') = 'ADMIN'
        )
        OR (
            -- Check if this specific user has admin role using their own record
            -- This approach avoids recursion by only matching id = auth.uid()
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = (select auth.uid()) 
                AND id = profiles.id  -- Only check if querying own record
            )
            OR id = (select auth.uid())
            OR true  -- Fallback: allow all users to read all profiles for now
        )
    );

-- Alternative simpler approach: Allow all authenticated users to read profiles
-- This is common for many apps where profile info is not sensitive
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (
        -- Any authenticated user can read any profile
        -- This is safe if profiles don't contain sensitive data
        (select auth.uid()) IS NOT NULL
        -- Non-authenticated users can only see their own (but they wouldn't have auth.uid)
    );

-- UPDATE policy: users update own, we need a different approach for admin check
-- Option 1: Use a SECURITY DEFINER function to check admin status
-- Option 2: Use raw_user_meta_data from auth.users table
-- For now, let's keep it simple: users can update their own profile

CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (
        id = (select auth.uid())
    );

-- DELETE policy: Only service_role should delete profiles
-- Regular users shouldn't delete profiles through the app
CREATE POLICY "profiles_delete" ON public.profiles
    FOR DELETE USING (
        false  -- Disable client-side deletes, use service_role for admin actions
    );

-- =============================================
-- NOW FIX ALL OTHER POLICIES THAT QUERY profiles
-- We'll create a helper function that doesn't trigger RLS
-- =============================================

-- Create a SECURITY DEFINER function to check if user is admin
-- This function bypasses RLS, so it won't cause recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
$$;

-- Create a function to check if user is staff (admin or editor)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR')
    );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

-- =============================================
-- RE-CREATE PROFILES POLICIES USING THE FUNCTIONS
-- =============================================

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- SELECT: Users see own, admins see all
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (
        id = (select auth.uid())
        OR public.is_admin()
    );

-- UPDATE: Users update own, admins update all
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (
        id = (select auth.uid())
        OR public.is_admin()
    );

-- DELETE: Only admins
CREATE POLICY "profiles_delete" ON public.profiles
    FOR DELETE USING (
        public.is_admin()
    );

-- =============================================
-- UPDATE OTHER TABLES' POLICIES TO USE FUNCTIONS
-- =============================================

-- Orders table
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;

CREATE POLICY "orders_select" ON public.orders
    FOR SELECT USING (
        user_id = (select auth.uid()) OR public.is_admin()
    );

CREATE POLICY "orders_insert" ON public.orders
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid()) OR public.is_admin()
    );

CREATE POLICY "orders_update" ON public.orders
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "orders_delete" ON public.orders
    FOR DELETE USING (public.is_admin());

-- Pipeline cards table
DROP POLICY IF EXISTS "pipeline_cards_select" ON public.pipeline_cards;
DROP POLICY IF EXISTS "pipeline_cards_insert" ON public.pipeline_cards;
DROP POLICY IF EXISTS "pipeline_cards_update" ON public.pipeline_cards;
DROP POLICY IF EXISTS "pipeline_cards_delete" ON public.pipeline_cards;

CREATE POLICY "pipeline_cards_select" ON public.pipeline_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = pipeline_cards.order_id AND o.user_id = (select auth.uid())
        )
        OR public.is_staff()
    );

CREATE POLICY "pipeline_cards_insert" ON public.pipeline_cards
    FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "pipeline_cards_update" ON public.pipeline_cards
    FOR UPDATE USING (public.is_staff());

CREATE POLICY "pipeline_cards_delete" ON public.pipeline_cards
    FOR DELETE USING (public.is_staff());

-- Deliverables table
DROP POLICY IF EXISTS "deliverables_select" ON public.deliverables;
DROP POLICY IF EXISTS "deliverables_insert" ON public.deliverables;
DROP POLICY IF EXISTS "deliverables_update" ON public.deliverables;
DROP POLICY IF EXISTS "deliverables_delete" ON public.deliverables;

CREATE POLICY "deliverables_select" ON public.deliverables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pipeline_cards pc
            JOIN public.orders o ON pc.order_id = o.id
            WHERE pc.id = deliverables.card_id AND o.user_id = (select auth.uid())
        )
        OR public.is_staff()
    );

CREATE POLICY "deliverables_insert" ON public.deliverables
    FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "deliverables_update" ON public.deliverables
    FOR UPDATE USING (public.is_staff());

CREATE POLICY "deliverables_delete" ON public.deliverables
    FOR DELETE USING (public.is_staff());

-- Events table
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

CREATE POLICY "events_select" ON public.events
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "events_insert" ON public.events
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "events_update" ON public.events
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "events_delete" ON public.events
    FOR DELETE USING (public.is_admin());

-- Packages table (public read, admin write)
DROP POLICY IF EXISTS "packages_insert" ON public.packages;
DROP POLICY IF EXISTS "packages_update" ON public.packages;
DROP POLICY IF EXISTS "packages_delete" ON public.packages;

CREATE POLICY "packages_insert" ON public.packages
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "packages_update" ON public.packages
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "packages_delete" ON public.packages
    FOR DELETE USING (public.is_admin());

-- User preferences table
DROP POLICY IF EXISTS "user_preferences_select" ON public.user_preferences;

CREATE POLICY "user_preferences_select" ON public.user_preferences
    FOR SELECT USING (
        user_id = (select auth.uid()) OR public.is_admin()
    );

-- General settings (public read, admin write)
DROP POLICY IF EXISTS "general_settings_insert" ON public.general_settings;
DROP POLICY IF EXISTS "general_settings_update" ON public.general_settings;
DROP POLICY IF EXISTS "general_settings_delete" ON public.general_settings;

CREATE POLICY "general_settings_insert" ON public.general_settings
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "general_settings_update" ON public.general_settings
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "general_settings_delete" ON public.general_settings
    FOR DELETE USING (public.is_admin());

-- FAQs table
DROP POLICY IF EXISTS "faqs_select" ON public.faqs;
DROP POLICY IF EXISTS "faqs_insert" ON public.faqs;
DROP POLICY IF EXISTS "faqs_update" ON public.faqs;
DROP POLICY IF EXISTS "faqs_delete" ON public.faqs;

CREATE POLICY "faqs_select" ON public.faqs
    FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "faqs_insert" ON public.faqs
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "faqs_update" ON public.faqs
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "faqs_delete" ON public.faqs
    FOR DELETE USING (public.is_admin());

-- Legal documents table
DROP POLICY IF EXISTS "legal_documents_select" ON public.legal_documents;
DROP POLICY IF EXISTS "legal_documents_insert" ON public.legal_documents;
DROP POLICY IF EXISTS "legal_documents_update" ON public.legal_documents;
DROP POLICY IF EXISTS "legal_documents_delete" ON public.legal_documents;

CREATE POLICY "legal_documents_select" ON public.legal_documents
    FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "legal_documents_insert" ON public.legal_documents
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "legal_documents_update" ON public.legal_documents
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "legal_documents_delete" ON public.legal_documents
    FOR DELETE USING (public.is_admin());

-- Contact submissions table
DROP POLICY IF EXISTS "contact_submissions_select" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_update" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_delete" ON public.contact_submissions;

CREATE POLICY "contact_submissions_select" ON public.contact_submissions
    FOR SELECT USING (
        user_id = (select auth.uid()) OR public.is_admin()
    );

CREATE POLICY "contact_submissions_update" ON public.contact_submissions
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "contact_submissions_delete" ON public.contact_submissions
    FOR DELETE USING (public.is_admin());

-- Announcements table
DROP POLICY IF EXISTS "announcements_select" ON public.announcements;
DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
DROP POLICY IF EXISTS "announcements_update" ON public.announcements;
DROP POLICY IF EXISTS "announcements_delete" ON public.announcements;

CREATE POLICY "announcements_select" ON public.announcements
    FOR SELECT USING (
        (is_active = true AND starts_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()))
        OR public.is_admin()
    );

CREATE POLICY "announcements_insert" ON public.announcements
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "announcements_update" ON public.announcements
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "announcements_delete" ON public.announcements
    FOR DELETE USING (public.is_admin());

-- Activity logs table
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;

CREATE POLICY "activity_logs_select" ON public.activity_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "activity_logs_insert" ON public.activity_logs
    FOR INSERT WITH CHECK (
        public.is_staff()
        OR (select auth.uid()) IS NULL  -- Allow service role / triggers
    );

-- Showcase items table (public read, admin write)
DROP POLICY IF EXISTS "showcase_items_insert" ON public.showcase_items;
DROP POLICY IF EXISTS "showcase_items_update" ON public.showcase_items;
DROP POLICY IF EXISTS "showcase_items_delete" ON public.showcase_items;

CREATE POLICY "showcase_items_insert" ON public.showcase_items
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "showcase_items_update" ON public.showcase_items
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "showcase_items_delete" ON public.showcase_items
    FOR DELETE USING (public.is_admin());

-- Upsell campaigns table
DROP POLICY IF EXISTS "upsell_campaigns_select" ON public.upsell_campaigns;
DROP POLICY IF EXISTS "upsell_campaigns_insert" ON public.upsell_campaigns;
DROP POLICY IF EXISTS "upsell_campaigns_update" ON public.upsell_campaigns;
DROP POLICY IF EXISTS "upsell_campaigns_delete" ON public.upsell_campaigns;

CREATE POLICY "upsell_campaigns_select" ON public.upsell_campaigns
    FOR SELECT USING (public.is_staff());

CREATE POLICY "upsell_campaigns_insert" ON public.upsell_campaigns
    FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "upsell_campaigns_update" ON public.upsell_campaigns
    FOR UPDATE USING (public.is_staff());

CREATE POLICY "upsell_campaigns_delete" ON public.upsell_campaigns
    FOR DELETE USING (public.is_staff());

-- Upsell campaign targets table
DROP POLICY IF EXISTS "upsell_campaign_targets_select" ON public.upsell_campaign_targets;
DROP POLICY IF EXISTS "upsell_campaign_targets_insert" ON public.upsell_campaign_targets;
DROP POLICY IF EXISTS "upsell_campaign_targets_update" ON public.upsell_campaign_targets;
DROP POLICY IF EXISTS "upsell_campaign_targets_delete" ON public.upsell_campaign_targets;

CREATE POLICY "upsell_campaign_targets_select" ON public.upsell_campaign_targets
    FOR SELECT USING (public.is_staff());

CREATE POLICY "upsell_campaign_targets_insert" ON public.upsell_campaign_targets
    FOR INSERT WITH CHECK (public.is_staff());

CREATE POLICY "upsell_campaign_targets_update" ON public.upsell_campaign_targets
    FOR UPDATE USING (public.is_staff());

CREATE POLICY "upsell_campaign_targets_delete" ON public.upsell_campaign_targets
    FOR DELETE USING (public.is_staff());

-- Expenses table
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;

CREATE POLICY "expenses_select" ON public.expenses
    FOR SELECT USING (public.is_admin());

CREATE POLICY "expenses_insert" ON public.expenses
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "expenses_update" ON public.expenses
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "expenses_delete" ON public.expenses
    FOR DELETE USING (public.is_admin());

-- =============================================
-- ✅ FIX COMPLETE!
-- =============================================
-- 
-- Changes Made:
-- 1. Created is_admin() and is_staff() helper functions
--    - These are SECURITY DEFINER functions that bypass RLS
--    - This prevents infinite recursion when checking admin status
-- 2. Updated all policies to use these helper functions
--    - No more direct queries to profiles table in policy definitions
-- 
-- The infinite recursion was caused by:
-- - profiles_select policy had: EXISTS (SELECT 1 FROM profiles WHERE ...)
-- - This triggered a SELECT on profiles
-- - Which then needed to evaluate profiles_select policy again
-- - Causing infinite loop
-- =============================================
