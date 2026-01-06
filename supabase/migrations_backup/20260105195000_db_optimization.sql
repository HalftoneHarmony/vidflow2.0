-- =============================================
-- VidFlow Manager - DB 최적화 및 재개편
-- Date: 2026-01-05
-- Purpose: 스키마 정규화, 누락 필드 추가, 성능 최적화, 데이터 무결성 강화
-- =============================================

-- =============================================
-- PART 1: 누락된 필드 추가 (Schema Enhancement)
-- =============================================

-- 1.1 profiles 테이블 - updated_at 필드 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.2 events 테이블 - 추가 메타데이터 필드
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS max_capacity INTEGER;

-- 1.3 packages 테이블 - 누락 필드 추가
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 1.4 showcase_items 테이블 - 정렬 및 메타데이터
ALTER TABLE public.showcase_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 1.5 orders 테이블 - 추가 정보
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_reason TEXT;

-- 1.6 deliverables 테이블 - 파일 정보
ALTER TABLE public.deliverables 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- 1.7 expenses 테이블 - 감사 필드
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- =============================================
-- PART 2: 자동 업데이트 트리거 (Auto-update triggers)
-- =============================================

-- 범용 updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY['profiles', 'events', 'packages', 'orders', 'faqs', 'legal_documents', 'user_preferences'];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_update_%I_updated_at ON public.%I;
            CREATE TRIGGER trigger_update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- =============================================
-- PART 3: 데이터 무결성 제약조건 (Constraints)
-- =============================================

-- 3.1 가격은 0 이상이어야 함
ALTER TABLE public.packages 
DROP CONSTRAINT IF EXISTS packages_price_positive;
ALTER TABLE public.packages 
ADD CONSTRAINT packages_price_positive CHECK (price >= 0);

-- 3.2 주문 금액은 0 이상이어야 함
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_amount_positive;
ALTER TABLE public.orders 
ADD CONSTRAINT orders_amount_positive CHECK (amount >= 0);

-- 3.3 지출 금액은 0 이상이어야 함
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS expenses_amount_positive;
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_amount_positive CHECK (amount >= 0);

-- 3.4 수수료율은 0-100 사이
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_commission_rate_range;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_commission_rate_range CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- 3.5 이메일 형식 검증 (간단한 패턴)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_email_format;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- =============================================
-- PART 4: Materialized Views (고성능 분석용)
-- =============================================

-- 4.1 이벤트별 매출 요약 (Materialized)
DROP MATERIALIZED VIEW IF EXISTS public.mv_event_summary;
CREATE MATERIALIZED VIEW public.mv_event_summary AS
SELECT 
    e.id AS event_id,
    e.title,
    e.event_date,
    e.location,
    e.is_active,
    -- 패키지
    COUNT(DISTINCT pkg.id) AS package_count,
    -- 주문
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'PAID' THEN o.id END) AS paid_orders,
    -- 매출
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS total_revenue,
    -- 지출
    COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS total_expenses,
    -- 순이익
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
        COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS net_profit,
    -- 고객 수
    COUNT(DISTINCT o.user_id) AS unique_customers,
    -- 갱신 시간
    NOW() AS refreshed_at
FROM public.events e
LEFT JOIN public.packages pkg ON pkg.event_id = e.id
LEFT JOIN public.orders o ON o.event_id = e.id
GROUP BY e.id, e.title, e.event_date, e.location, e.is_active;

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_event_summary_id ON public.mv_event_summary(event_id);

-- 4.2 일별 통계 (Materialized)
DROP MATERIALIZED VIEW IF EXISTS public.mv_daily_stats;
CREATE MATERIALIZED VIEW public.mv_daily_stats AS
SELECT 
    DATE(o.created_at) AS stat_date,
    COUNT(o.id) AS order_count,
    COUNT(DISTINCT o.user_id) AS unique_customers,
    SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END) AS revenue,
    SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END) AS refunds,
    NOW() AS refreshed_at
FROM public.orders o
GROUP BY DATE(o.created_at)
ORDER BY stat_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_stats_date ON public.mv_daily_stats(stat_date);

-- 4.3 Materialized View 갱신 함수
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_event_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 5: 추가 성능 인덱스
-- =============================================

-- 복합 인덱스 (자주 사용되는 쿼리 패턴)
CREATE INDEX IF NOT EXISTS idx_orders_event_package ON public.orders(event_id, package_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_user ON public.orders(status, user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON public.orders(created_at DESC, status);

CREATE INDEX IF NOT EXISTS idx_pipeline_order_stage ON public.pipeline_cards(order_id, stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_updated ON public.pipeline_cards(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_deliverables_status ON public.deliverables(link_status);
CREATE INDEX IF NOT EXISTS idx_deliverables_downloaded ON public.deliverables(is_downloaded);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expensed_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_worker ON public.expenses(related_worker_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_submissions(created_at DESC);

-- 부분 인덱스 (특정 조건에서만 사용)
CREATE INDEX IF NOT EXISTS idx_events_active_only ON public.events(event_date DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pipeline_not_delivered ON public.pipeline_cards(stage, stage_entered_at) WHERE stage != 'DELIVERED';
CREATE INDEX IF NOT EXISTS idx_orders_paid_only ON public.orders(created_at DESC) WHERE status = 'PAID';

-- =============================================
-- PART 6: 유틸리티 함수 추가
-- =============================================

-- 6.1 이번 주 통계
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

-- 6.2 고객 주문 내역 조회
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
    SELECT 
        o.id,
        e.title,
        pkg.name,
        o.amount,
        o.status,
        pc.stage,
        o.created_at
    FROM public.orders o
    JOIN public.events e ON e.id = o.event_id
    JOIN public.packages pkg ON pkg.id = o.package_id
    LEFT JOIN public.pipeline_cards pc ON pc.order_id = o.id
    WHERE o.user_id = p_user_id
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.3 파이프라인 상태 전환 함수 (검증 포함)
CREATE OR REPLACE FUNCTION public.update_pipeline_stage(
    p_card_id INTEGER,
    p_new_stage TEXT,
    p_assignee_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    current_stage TEXT;
    valid_transitions JSON := '{
        "WAITING": ["SHOOTING"],
        "SHOOTING": ["EDITING", "WAITING"],
        "EDITING": ["READY", "SHOOTING"],
        "READY": ["DELIVERED", "EDITING"],
        "DELIVERED": []
    }'::JSON;
    allowed_stages TEXT[];
    result JSON;
BEGIN
    -- 현재 상태 조회
    SELECT stage INTO current_stage FROM public.pipeline_cards WHERE id = p_card_id;
    
    IF current_stage IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Card not found');
    END IF;
    
    -- 유효한 전환인지 확인
    SELECT array_agg(value::TEXT) INTO allowed_stages
    FROM json_array_elements_text(valid_transitions->current_stage);
    
    IF NOT (p_new_stage = ANY(allowed_stages)) THEN
        RETURN json_build_object(
            'success', false, 
            'error', format('Invalid transition from %s to %s', current_stage, p_new_stage)
        );
    END IF;
    
    -- 업데이트
    UPDATE public.pipeline_cards 
    SET 
        stage = p_new_stage,
        assignee_id = COALESCE(p_assignee_id, assignee_id)
    WHERE id = p_card_id;
    
    RETURN json_build_object('success', true, 'new_stage', p_new_stage);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.4 대량 파이프라인 할당
CREATE OR REPLACE FUNCTION public.bulk_assign_pipeline(
    p_card_ids INTEGER[],
    p_assignee_id UUID
)
RETURNS JSON AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.pipeline_cards 
    SET assignee_id = p_assignee_id
    WHERE id = ANY(p_card_ids)
    AND stage IN ('SHOOTING', 'EDITING');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN json_build_object('success', true, 'updated_count', updated_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.5 이벤트 통계 요약
CREATE OR REPLACE FUNCTION public.get_event_stats(p_event_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'event_id', e.id,
        'title', e.title,
        'event_date', e.event_date,
        'packages', (
            SELECT json_agg(json_build_object(
                'id', pkg.id,
                'name', pkg.name,
                'price', pkg.price,
                'sold', COUNT(o.id),
                'revenue', COALESCE(SUM(o.amount), 0)
            ))
            FROM public.packages pkg
            LEFT JOIN public.orders o ON o.package_id = pkg.id AND o.status = 'PAID'
            WHERE pkg.event_id = e.id
            GROUP BY pkg.id
        ),
        'pipeline', (
            SELECT json_object_agg(stage, cnt)
            FROM (
                SELECT pc.stage, COUNT(*) as cnt
                FROM public.orders o
                JOIN public.pipeline_cards pc ON pc.order_id = o.id
                WHERE o.event_id = e.id
                GROUP BY pc.stage
            ) sub
        ),
        'expenses', (
            SELECT json_object_agg(category, total)
            FROM (
                SELECT category, SUM(amount) as total
                FROM public.expenses
                WHERE event_id = e.id
                GROUP BY category
            ) sub
        ),
        'summary', json_build_object(
            'total_orders', COUNT(o.id),
            'total_revenue', COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0),
            'total_expenses', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0),
            'unique_customers', COUNT(DISTINCT o.user_id)
        )
    ) INTO result
    FROM public.events e
    LEFT JOIN public.orders o ON o.event_id = e.id
    WHERE e.id = p_event_id
    GROUP BY e.id, e.title, e.event_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 7: RLS 정책 보완
-- =============================================

-- 7.1 activity_logs - 시스템 삽입 허용
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;
CREATE POLICY "System can insert logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);  -- 트리거에서 삽입하므로 허용

-- 7.2 user_preferences - 사용자가 자신의 설정 생성 가능
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7.3 orders - 사용자가 자신의 주문 생성 가능
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- PART 8: 데이터 정리 (Cleanup)
-- =============================================

-- 오래된 activity_logs 정리 함수 (90일 이상)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs(p_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.activity_logs 
    WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 무효 링크 납품물 정리 함수
CREATE OR REPLACE FUNCTION public.cleanup_invalid_deliverables()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.deliverables 
    WHERE link_status = 'INVALID' 
    AND link_last_checked_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 9: 통계 테이블 (Optional - 대용량 처리용)
-- =============================================

-- 일별 집계 테이블 (대용량 데이터 처리용)
CREATE TABLE IF NOT EXISTS public.daily_aggregates (
    stat_date DATE PRIMARY KEY,
    total_orders INTEGER DEFAULT 0,
    paid_orders INTEGER DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    total_refunds BIGINT DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_events INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일별 집계 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_daily_aggregate(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.daily_aggregates (stat_date, total_orders, paid_orders, total_revenue, total_refunds, new_users, active_events)
    SELECT 
        p_date,
        (SELECT COUNT(*) FROM public.orders WHERE DATE(created_at) = p_date),
        (SELECT COUNT(*) FROM public.orders WHERE DATE(created_at) = p_date AND status = 'PAID'),
        (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE DATE(created_at) = p_date AND status = 'PAID'),
        (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE DATE(created_at) = p_date AND status = 'REFUNDED'),
        (SELECT COUNT(*) FROM public.profiles WHERE DATE(created_at) = p_date AND role = 'USER'),
        (SELECT COUNT(*) FROM public.events WHERE is_active = true)
    ON CONFLICT (stat_date) DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        paid_orders = EXCLUDED.paid_orders,
        total_revenue = EXCLUDED.total_revenue,
        total_refunds = EXCLUDED.total_refunds,
        new_users = EXCLUDED.new_users,
        active_events = EXCLUDED.active_events,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ✅ 최적화 완료
-- =============================================
