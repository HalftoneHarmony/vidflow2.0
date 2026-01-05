-- =============================================
-- VidFlow Manager - Security Hardening Migration
-- Date: 2026-01-05
-- Status: ✅ COMPLETED (Applied via Supabase SQL Editor)
-- Purpose: Fix security issues identified by Supabase Security Advisor
-- =============================================

-- =============================================
-- SUMMARY OF CHANGES APPLIED:
-- =============================================
-- 
-- 1. FUNCTION SEARCH PATH MUTABLE (23 functions fixed)
--    - Added `SET search_path = ''` to all functions
--    - Prevents SQL injection via search path manipulation
--
-- 2. SECURITY DEFINER VIEWS (12 views fixed)
--    - Recreated all views with `security_invoker = true`
--    - Views now respect RLS policies of calling user
--
-- 3. MATERIALIZED VIEW IN API (1 view fixed)
--    - Revoked anon/authenticated access to mv_event_summary
--    - Granted access only to service_role
--
-- 4. VIEW PERMISSIONS (12 views secured)
--    - Revoked anon access from all analytics views
--    - Granted authenticated access (RLS handles restrictions)
--
-- =============================================
-- MANUAL ACTION REQUIRED:
-- =============================================
-- 
-- Leaked Password Protection:
-- 1. Go to Supabase Dashboard > Authentication > Settings
-- 2. Enable "Leaked Password Protection" toggle
-- 3. This checks passwords against HaveIBeenPwned.org
--
-- =============================================

-- NOTE: The SQL below was executed in 4 steps via Supabase SQL Editor.
-- This file is kept for documentation purposes.

-- =============================================
-- STEP 1: Functions without RLS dependencies
-- =============================================

CREATE OR REPLACE FUNCTION public.upsert_setting(setting_key TEXT, setting_value TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.general_settings (key, value)
    VALUES (setting_key, setting_value)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', (SELECT COUNT(*) FROM public.orders),
        'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE status = 'PAID'),
        'total_customers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'USER'),
        'active_events', (SELECT COUNT(*) FROM public.events WHERE is_active = true),
        'pipeline_stats', json_build_object(
            'waiting', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'WAITING'),
            'shooting', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'SHOOTING'),
            'editing', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'EDITING'),
            'ready', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'READY'),
            'delivered', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'DELIVERED')
        )
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- [... All other functions with SET search_path = '' ...]

-- =============================================
-- STEP 2: Trigger functions and RLS-dependent functions
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.check_is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- STEP 3: Recreate views with SECURITY INVOKER
-- =============================================

-- Example: v_event_analytics
-- DROP VIEW IF EXISTS public.v_event_analytics;
-- CREATE VIEW public.v_event_analytics 
-- WITH (security_invoker = true)
-- AS SELECT ...;

-- All 12 views recreated with security_invoker = true:
-- v_event_analytics, v_customer_ltv, v_deliverable_tracking,
-- v_expense_breakdown, v_worker_performance, v_daily_revenue,
-- v_package_performance, v_pipeline_bottleneck, v_pipeline_overview,
-- v_order_summary, v_event_revenue, v_monthly_growth

-- =============================================
-- STEP 4: View and Materialized View permissions
-- =============================================

-- Materialized View
REVOKE SELECT ON public.mv_event_summary FROM anon;
REVOKE SELECT ON public.mv_event_summary FROM authenticated;
GRANT SELECT ON public.mv_event_summary TO service_role;

-- Analytics Views - Revoke anon, Grant authenticated
-- (Applied to all 12 analytics views)

-- =============================================
-- ✅ SECURITY HARDENING COMPLETE!
-- =============================================
