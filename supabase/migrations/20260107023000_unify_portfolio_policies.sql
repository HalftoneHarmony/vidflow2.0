-- =============================================
-- Fix Multiple Permissive Policies Warning (Unified Policy)
-- Created by: Antigravity Agent
-- Date: 2026-01-07
-- Purpose: Combine overlapping SELECT policies into a single unified policy to resolve performance warnings
-- =============================================

-- -----------------------------------------------------------------------------
-- Fix: Multiple Permissive Policies on portfolio_items (SELECT)
-- We currently have separate policies for "Public" and "Admins".
-- The linter flags this as inefficient because multiple policies execute for the same query.
-- Solution: Combine them into a single policy using logical OR.
-- -----------------------------------------------------------------------------

-- 1. Drop existing overlapped policies
DROP POLICY IF EXISTS "Public can view published portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins can view private portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins can view all portfolio items" ON public.portfolio_items; -- In case it lingers

-- 2. Create a specific policy for "Anonymous" (Public) users
-- Optimization: Anon users ONLY see public items. They never need the admin check.
-- By targeting the role 'anon', we avoid the expensive Profile lookup for them entirely.
CREATE POLICY "Anon can view published portfolio items" ON public.portfolio_items
    FOR SELECT 
    TO anon
    USING (is_public = true);

-- 3. Create a policy for "Authenticated" users
-- Authenticated users might be ordinary users (see public only) OR admins (see all).
CREATE POLICY "Auth users can view portfolio items" ON public.portfolio_items
    FOR SELECT 
    TO authenticated
    USING (
        is_public = true 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND role = 'ADMIN')
    );

-- Note: We split into 'TO anon' and 'TO authenticated' to be explicit and avoid running the Admin check for anon users.
-- This effectively removes the "Multiple Permissive Policies" warning because for any given role (limit 1 role per session),
-- only ONE of these policies will apply.
