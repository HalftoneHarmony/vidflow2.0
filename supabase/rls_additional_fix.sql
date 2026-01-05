-- =============================================
-- VidFlow Manager - Additional RLS & Index Fixes
-- Created: 2026-01-06
-- Purpose: Fix remaining Performance Advisor warnings
-- 
-- Issues Fixed:
-- 1. expenses 테이블의 중복 정책 제거 (Strict Admin Only Expenses)
-- 2. 외래 키에 인덱스 추가 (14개)
-- =============================================

-- =============================================
-- PART 1: expenses 테이블 중복 정책 제거
-- =============================================
DROP POLICY IF EXISTS "Strict Admin Only Expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;

-- =============================================
-- PART 2: 외래 키에 인덱스 추가
-- (unindexed_foreign_keys 경고 해결)
-- =============================================

-- announcements.created_by
CREATE INDEX IF NOT EXISTS idx_announcements_created_by 
    ON public.announcements(created_by);

-- contact_submissions.responded_by
CREATE INDEX IF NOT EXISTS idx_contact_submissions_responded_by 
    ON public.contact_submissions(responded_by);

-- contact_submissions.user_id
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id 
    ON public.contact_submissions(user_id);

-- deliverables.card_id
CREATE INDEX IF NOT EXISTS idx_deliverables_card_id 
    ON public.deliverables(card_id);

-- events.created_by
CREATE INDEX IF NOT EXISTS idx_events_created_by 
    ON public.events(created_by);

-- expenses.created_by
CREATE INDEX IF NOT EXISTS idx_expenses_created_by 
    ON public.expenses(created_by);

-- expenses.related_worker_id
CREATE INDEX IF NOT EXISTS idx_expenses_related_worker_id 
    ON public.expenses(related_worker_id);

-- general_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_general_settings_updated_by 
    ON public.general_settings(updated_by);

-- orders.package_id
CREATE INDEX IF NOT EXISTS idx_orders_package_id 
    ON public.orders(package_id);

-- showcase_items.package_id (may already exist as idx_showcase_package)
CREATE INDEX IF NOT EXISTS idx_showcase_items_package_id 
    ON public.showcase_items(package_id);

-- upsell_campaign_targets.converted_order_id
CREATE INDEX IF NOT EXISTS idx_upsell_targets_converted_order 
    ON public.upsell_campaign_targets(converted_order_id);

-- upsell_campaign_targets.original_order_id
CREATE INDEX IF NOT EXISTS idx_upsell_targets_original_order 
    ON public.upsell_campaign_targets(original_order_id);

-- upsell_campaigns.created_by
CREATE INDEX IF NOT EXISTS idx_upsell_campaigns_created_by 
    ON public.upsell_campaigns(created_by);

-- upsell_campaigns.upgrade_package_id
CREATE INDEX IF NOT EXISTS idx_upsell_campaigns_upgrade_package 
    ON public.upsell_campaigns(upgrade_package_id);

-- =============================================
-- PART 3: 사용되지 않는 중복 인덱스 정리 (선택사항)
-- 주의: 이 인덱스들은 애플리케이션이 더 성장하면 유용할 수 있음
-- 현재는 사용되지 않지만 삭제는 신중하게 결정해야 함
-- =============================================

-- 아래 인덱스들은 INFO 레벨이므로 삭제하지 않고 유지
-- 대용량 데이터 시 유용할 수 있음:
-- - idx_events_active_date
-- - idx_orders_user_id
-- - idx_orders_event_id
-- - idx_orders_created_at
-- - idx_pipeline_cards_stage
-- - idx_pipeline_cards_assignee
-- - idx_expenses_event_id
-- - idx_faqs_category
-- - 등...

-- =============================================
-- ✅ ADDITIONAL FIXES COMPLETE!
-- =============================================
