-- =============================================
-- Fix Linter Policy Overlaps
-- Created by: Antigravity Agent
-- Date: 2026-01-07
-- Purpose: Remove redundant RLS policies to resolve performance warnings
-- =============================================

-- -----------------------------------------------------------------------------
-- 1. Fix: Multiple Permissive Policies on contact_submissions
-- The policy `contact_submissions_insert` appears to be redundant or a duplicate.
-- We will retain `Anyone can submit contact form` (which we fixed in the previous step)
-- and drop the generic one.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "contact_submissions_insert" ON public.contact_submissions;


-- -----------------------------------------------------------------------------
-- 2. Fix: Multiple Permissive Policies on general_settings
-- Drop generic policies in favor of specific descriptive ones.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "general_settings_select" ON public.general_settings;
DROP POLICY IF EXISTS "general_settings_insert" ON public.general_settings;
DROP POLICY IF EXISTS "general_settings_update" ON public.general_settings;
DROP POLICY IF EXISTS "general_settings_delete" ON public.general_settings;


-- -----------------------------------------------------------------------------
-- 3. Fix: Multiple Permissive Policies on portfolio_items (SELECT)
-- We have "Public can view published portfolio items" (is_public = true)
-- AND "Admins can view all portfolio items" (auth.role = 'admin')
-- For a public item, both are true, which causes the warning.
-- We will change the Admin policy to specificy targeting ONLY private items.
-- Since RLS policies are combined with OR, Admins will still see public items via the public policy.
-- -----------------------------------------------------------------------------

-- Drop the overlapping admin policy
DROP POLICY IF EXISTS "Admins can view all portfolio items" ON public.portfolio_items;

-- Create a complementary policy for Admins to view PRIVATE items
CREATE POLICY "Admins can view private portfolio items" ON public.portfolio_items
    FOR SELECT USING (
        -- Target only items NOT covered by the public policy
        is_public = false 
        AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
    );
