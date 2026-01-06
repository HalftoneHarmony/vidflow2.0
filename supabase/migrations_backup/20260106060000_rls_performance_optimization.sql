-- =============================================
-- VidFlow Manager - RLS Performance Optimization
-- Created: 2026-01-06
-- Purpose: Fix Supabase Performance Advisor Warnings
-- 
-- Issues Fixed:
-- 1. auth_rls_initplan: Replace auth.<function>() with (select auth.<function>())
-- 2. multiple_permissive_policies: Consolidate duplicate permissive policies
-- =============================================

-- =============================================
-- PART 1: DROP EXISTING POLICIES
-- (To recreate with optimized versions)
-- =============================================

-- orders table policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- pipeline_cards table policies
DROP POLICY IF EXISTS "Users can view their own pipeline cards" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Staff can view pipeline cards" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Staff can manage pipeline cards" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Staff can view pipeline" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Staff can manage pipeline" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pipeline_cards;

-- profiles table policies
DROP POLICY IF EXISTS "Users view own identity" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins full control profiles" ON public.profiles;

-- deliverables table policies
DROP POLICY IF EXISTS "Users can view their own deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Users can view own deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Users can download own deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Staff can manage deliverables" ON public.deliverables;

-- events table policies
DROP POLICY IF EXISTS "Admins have full access to events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
DROP POLICY IF EXISTS "Allow public read access for events" ON public.events;

-- packages table policies
DROP POLICY IF EXISTS "Admins have full access to packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;
DROP POLICY IF EXISTS "Anyone can view packages" ON public.packages;
DROP POLICY IF EXISTS "Allow public read access for packages" ON public.packages;

-- user_preferences table policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;

-- general_settings table policies
DROP POLICY IF EXISTS "Admins can manage settings" ON public.general_settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.general_settings;

-- faqs table policies
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Anyone can view published FAQs" ON public.faqs;

-- legal_documents table policies
DROP POLICY IF EXISTS "Admins can manage legal documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Anyone can view active legal documents" ON public.legal_documents;

-- contact_submissions table policies
DROP POLICY IF EXISTS "Users can view own submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- announcements table policies
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;

-- activity_logs policies
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Staff can insert logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

-- showcase_items table policies
DROP POLICY IF EXISTS "Anyone can view showcase items" ON public.showcase_items;
DROP POLICY IF EXISTS "Admins can manage showcase items" ON public.showcase_items;
DROP POLICY IF EXISTS "Allow public read access for showcase_items" ON public.showcase_items;

-- upsell_campaigns table policies
DROP POLICY IF EXISTS "upsell_campaigns_admin_only" ON public.upsell_campaigns;

-- upsell_campaign_targets table policies
DROP POLICY IF EXISTS "upsell_targets_admin_only" ON public.upsell_campaign_targets;

-- expenses table policies
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;

-- =============================================
-- PART 2: CREATE OPTIMIZED RLS POLICIES
-- Using (select auth.uid()) instead of auth.uid()
-- Consolidating multiple permissive policies
-- =============================================

-- =============================================
-- 2.1 PROFILES TABLE
-- =============================================
-- Single consolidated SELECT policy (users see own, admins see all)
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (
        id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- INSERT policy for users to create their own profile
CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT WITH CHECK (
        id = (select auth.uid())
    );

-- UPDATE policy: users can update own, admins can update all
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (
        id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- DELETE policy: only admins
CREATE POLICY "profiles_delete" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.2 ORDERS TABLE
-- =============================================
-- Consolidated SELECT: users see own, admins see all
CREATE POLICY "orders_select" ON public.orders
    FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- Consolidated INSERT: users can create for self, admins can create for anyone
CREATE POLICY "orders_insert" ON public.orders
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- UPDATE: only admins
CREATE POLICY "orders_update" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- DELETE: only admins
CREATE POLICY "orders_delete" ON public.orders
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.3 PIPELINE_CARDS TABLE
-- =============================================
-- Consolidated SELECT: users see own cards (via order), staff see all
CREATE POLICY "pipeline_cards_select" ON public.pipeline_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = pipeline_cards.order_id AND o.user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

-- INSERT/UPDATE/DELETE: only staff
CREATE POLICY "pipeline_cards_insert" ON public.pipeline_cards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "pipeline_cards_update" ON public.pipeline_cards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "pipeline_cards_delete" ON public.pipeline_cards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

-- =============================================
-- 2.4 DELIVERABLES TABLE
-- =============================================
-- Consolidated SELECT: users see own deliverables (via pipeline -> order), staff see all
CREATE POLICY "deliverables_select" ON public.deliverables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pipeline_cards pc
            JOIN public.orders o ON pc.order_id = o.id
            WHERE pc.id = deliverables.card_id AND o.user_id = (select auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

-- Staff can manage all deliverables
CREATE POLICY "deliverables_insert" ON public.deliverables
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "deliverables_update" ON public.deliverables
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "deliverables_delete" ON public.deliverables
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

-- =============================================
-- 2.5 EVENTS TABLE
-- =============================================
-- Consolidated SELECT: public sees active events, admins see all
CREATE POLICY "events_select" ON public.events
    FOR SELECT USING (
        is_active = true
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- Admins can manage events
CREATE POLICY "events_insert" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "events_update" ON public.events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "events_delete" ON public.events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.6 PACKAGES TABLE
-- =============================================
-- Public read access
CREATE POLICY "packages_select" ON public.packages
    FOR SELECT USING (true);

-- Admins can manage packages
CREATE POLICY "packages_insert" ON public.packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "packages_update" ON public.packages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "packages_delete" ON public.packages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.7 USER_PREFERENCES TABLE
-- =============================================
-- Consolidated: users manage own, admins can view all
CREATE POLICY "user_preferences_select" ON public.user_preferences
    FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "user_preferences_insert" ON public.user_preferences
    FOR INSERT WITH CHECK (
        user_id = (select auth.uid())
    );

CREATE POLICY "user_preferences_update" ON public.user_preferences
    FOR UPDATE USING (
        user_id = (select auth.uid())
    );

CREATE POLICY "user_preferences_delete" ON public.user_preferences
    FOR DELETE USING (
        user_id = (select auth.uid())
    );

-- =============================================
-- 2.8 GENERAL_SETTINGS TABLE
-- =============================================
-- Public read, admin write
CREATE POLICY "general_settings_select" ON public.general_settings
    FOR SELECT USING (true);

CREATE POLICY "general_settings_insert" ON public.general_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "general_settings_update" ON public.general_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "general_settings_delete" ON public.general_settings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.9 FAQS TABLE
-- =============================================
-- Consolidated SELECT: public sees published FAQs, admins see all
CREATE POLICY "faqs_select" ON public.faqs
    FOR SELECT USING (
        is_published = true
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "faqs_insert" ON public.faqs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "faqs_update" ON public.faqs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "faqs_delete" ON public.faqs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.10 LEGAL_DOCUMENTS TABLE
-- =============================================
-- Consolidated SELECT: public sees active docs, admins see all
CREATE POLICY "legal_documents_select" ON public.legal_documents
    FOR SELECT USING (
        is_active = true
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "legal_documents_insert" ON public.legal_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "legal_documents_update" ON public.legal_documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "legal_documents_delete" ON public.legal_documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.11 CONTACT_SUBMISSIONS TABLE
-- =============================================
-- Anyone can insert (for contact form)
CREATE POLICY "contact_submissions_insert" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Consolidated SELECT: users see own, admins see all
CREATE POLICY "contact_submissions_select" ON public.contact_submissions
    FOR SELECT USING (
        user_id = (select auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- Admin UPDATE/DELETE
CREATE POLICY "contact_submissions_update" ON public.contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "contact_submissions_delete" ON public.contact_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.12 ANNOUNCEMENTS TABLE
-- =============================================
-- Consolidated SELECT: public sees active announcements, admins see all
CREATE POLICY "announcements_select" ON public.announcements
    FOR SELECT USING (
        (is_active = true AND starts_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()))
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "announcements_insert" ON public.announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "announcements_update" ON public.announcements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "announcements_delete" ON public.announcements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.13 ACTIVITY_LOGS TABLE
-- =============================================
-- Admins can view
CREATE POLICY "activity_logs_select" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- Consolidated INSERT: staff can insert, also allow service role for triggers
CREATE POLICY "activity_logs_insert" ON public.activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
        OR (select auth.uid()) IS NULL  -- Allow service role / triggers
    );

-- =============================================
-- 2.14 SHOWCASE_ITEMS TABLE
-- =============================================
-- Public read access
CREATE POLICY "showcase_items_select" ON public.showcase_items
    FOR SELECT USING (true);

-- Admin manage
CREATE POLICY "showcase_items_insert" ON public.showcase_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "showcase_items_update" ON public.showcase_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "showcase_items_delete" ON public.showcase_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- 2.15 UPSELL_CAMPAIGNS TABLE
-- =============================================
CREATE POLICY "upsell_campaigns_select" ON public.upsell_campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_campaigns_insert" ON public.upsell_campaigns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_campaigns_update" ON public.upsell_campaigns
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_campaigns_delete" ON public.upsell_campaigns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

-- =============================================
-- 2.16 UPSELL_CAMPAIGN_TARGETS TABLE
-- =============================================
CREATE POLICY "upsell_campaign_targets_select" ON public.upsell_campaign_targets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_campaign_targets_insert" ON public.upsell_campaign_targets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_campaign_targets_update" ON public.upsell_campaign_targets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_campaign_targets_delete" ON public.upsell_campaign_targets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role IN ('ADMIN', 'EDITOR')
        )
    );

-- =============================================
-- 2.17 EXPENSES TABLE
-- =============================================
CREATE POLICY "expenses_select" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "expenses_insert" ON public.expenses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "expenses_update" ON public.expenses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

CREATE POLICY "expenses_delete" ON public.expenses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid()) AND p.role = 'ADMIN'
        )
    );

-- =============================================
-- ✅ RLS PERFORMANCE OPTIMIZATION COMPLETE!
-- =============================================
-- 
-- Summary of Changes:
-- 1. Replaced all auth.uid() with (select auth.uid()) - prevents per-row re-evaluation
-- 2. Consolidated multiple permissive policies into single policies using OR logic
-- 3. Separated policies by action (SELECT, INSERT, UPDATE, DELETE) for clarity
-- 
-- Tables Optimized:
-- - profiles
-- - orders  
-- - pipeline_cards
-- - deliverables
-- - events
-- - packages
-- - user_preferences
-- - general_settings
-- - faqs
-- - legal_documents
-- - contact_submissions
-- - announcements
-- - activity_logs
-- - showcase_items
-- - upsell_campaigns
-- - upsell_campaign_targets
-- - expenses
-- =============================================
