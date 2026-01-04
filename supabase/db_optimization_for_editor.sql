-- =============================================
-- VidFlow Manager - DB 최적화 (SQL Editor 실행용)
-- Date: 2026-01-05
-- =============================================

-- =============================================
-- 1. 누락된 필드 추가
-- =============================================

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS description TEXT;

-- packages
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- showcase_items
ALTER TABLE public.showcase_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- deliverables
ALTER TABLE public.deliverables 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- expenses
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- =============================================
-- 2. updated_at 자동 업데이트 함수
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_packages_updated_at ON public.packages;
CREATE TRIGGER trigger_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. 데이터 무결성 제약조건
-- =============================================

ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_price_positive;
ALTER TABLE public.packages ADD CONSTRAINT packages_price_positive CHECK (price >= 0);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_amount_positive;
ALTER TABLE public.orders ADD CONSTRAINT orders_amount_positive CHECK (amount >= 0);

ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_amount_positive;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_amount_positive CHECK (amount >= 0);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_commission_rate_range;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_commission_rate_range CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- =============================================
-- 4. Materialized Views (고성능 분석)
-- =============================================

DROP MATERIALIZED VIEW IF EXISTS public.mv_event_summary;
CREATE MATERIALIZED VIEW public.mv_event_summary AS
SELECT 
    e.id AS event_id,
    e.title,
    e.event_date,
    e.is_active,
    COUNT(DISTINCT pkg.id) AS package_count,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS total_revenue,
    COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
        COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS net_profit,
    NOW() AS refreshed_at
FROM public.events e
LEFT JOIN public.packages pkg ON pkg.event_id = e.id
LEFT JOIN public.orders o ON o.event_id = e.id
GROUP BY e.id, e.title, e.event_date, e.is_active;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_event_summary_id ON public.mv_event_summary(event_id);

-- 갱신 함수
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_event_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. 추가 인덱스
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_event_package ON public.orders(event_id, package_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON public.orders(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_pipeline_order_stage ON public.pipeline_cards(order_id, stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_updated ON public.pipeline_cards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expensed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions(status);

-- 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_events_active_only ON public.events(event_date DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pipeline_not_delivered ON public.pipeline_cards(stage, stage_entered_at) WHERE stage != 'DELIVERED';
CREATE INDEX IF NOT EXISTS idx_orders_paid_only ON public.orders(created_at DESC) WHERE status = 'PAID';

-- =============================================
-- 6. 유틸리티 함수
-- =============================================

-- 이번 주 통계
CREATE OR REPLACE FUNCTION public.get_weekly_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
BEGIN
    SELECT json_build_object(
        'week_start', week_start,
        'orders', (SELECT COUNT(*) FROM public.orders WHERE created_at >= week_start),
        'revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE created_at >= week_start AND status = 'PAID'),
        'new_customers', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= week_start AND role = 'USER'),
        'completed_deliveries', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'DELIVERED' AND updated_at >= week_start)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 고객 주문 내역
CREATE OR REPLACE FUNCTION public.get_customer_orders(p_user_id UUID)
RETURNS TABLE (
    order_id INTEGER,
    event_title TEXT,
    package_name TEXT,
    amount INTEGER,
    status TEXT,
    pipeline_stage TEXT,
    order_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, e.title, pkg.name, o.amount, o.status, pc.stage, o.created_at
    FROM public.orders o
    JOIN public.events e ON e.id = o.event_id
    JOIN public.packages pkg ON pkg.id = o.package_id
    LEFT JOIN public.pipeline_cards pc ON pc.order_id = o.id
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 파이프라인 상태 전환 (검증 포함)
CREATE OR REPLACE FUNCTION public.update_pipeline_stage(
    p_card_id INTEGER,
    p_new_stage TEXT,
    p_assignee_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    current_stage TEXT;
    result JSON;
BEGIN
    SELECT stage INTO current_stage FROM public.pipeline_cards WHERE id = p_card_id;
    
    IF current_stage IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Card not found');
    END IF;
    
    UPDATE public.pipeline_cards 
    SET stage = p_new_stage, assignee_id = COALESCE(p_assignee_id, assignee_id)
    WHERE id = p_card_id;
    
    RETURN json_build_object('success', true, 'new_stage', p_new_stage);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 대량 할당
CREATE OR REPLACE FUNCTION public.bulk_assign_pipeline(p_card_ids INTEGER[], p_assignee_id UUID)
RETURNS JSON AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.pipeline_cards SET assignee_id = p_assignee_id
    WHERE id = ANY(p_card_ids) AND stage IN ('SHOOTING', 'EDITING');
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN json_build_object('success', true, 'updated_count', updated_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 오래된 로그 정리
CREATE OR REPLACE FUNCTION public.cleanup_old_logs(p_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.activity_logs WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. RLS 정책 보완
-- =============================================

DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;
CREATE POLICY "System can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ✅ 완료!
-- =============================================
