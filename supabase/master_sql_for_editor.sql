-- =============================================
-- VidFlow Manager - MASTER SQL (Supabase SQL Editor용)
-- 직접 실행 가능한 버전
-- Date: 2026-01-05
-- =============================================

-- =============================================
-- 1. 고급 분석 뷰 (Advanced Analytics Views)
-- =============================================

-- 일별 매출 추이
DROP VIEW IF EXISTS public.v_daily_revenue;
CREATE VIEW public.v_daily_revenue AS
SELECT 
    DATE(o.created_at) AS order_date,
    COUNT(o.id) AS order_count,
    SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END) AS revenue,
    SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END) AS refunds,
    COUNT(DISTINCT o.user_id) AS unique_customers
FROM public.orders o
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- 월별 성장 분석
DROP VIEW IF EXISTS public.v_monthly_growth;
CREATE VIEW public.v_monthly_growth AS
WITH monthly_data AS (
    SELECT 
        DATE_TRUNC('month', o.created_at)::DATE AS month,
        SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END) AS revenue,
        COUNT(o.id) AS orders
    FROM public.orders o
    GROUP BY DATE_TRUNC('month', o.created_at)
)
SELECT 
    month,
    revenue,
    orders,
    LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
    CASE 
        WHEN LAG(revenue) OVER (ORDER BY month) > 0 
        THEN ROUND(((revenue - LAG(revenue) OVER (ORDER BY month))::NUMERIC / LAG(revenue) OVER (ORDER BY month)) * 100, 1)
        ELSE 0 
    END AS revenue_growth_pct
FROM monthly_data
ORDER BY month DESC;

-- 고객 생애 가치 (CLV)
DROP VIEW IF EXISTS public.v_customer_ltv;
CREATE VIEW public.v_customer_ltv AS
SELECT 
    p.id AS user_id,
    p.name,
    p.email,
    p.created_at AS registered_at,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS total_spent,
    COALESCE(AVG(CASE WHEN o.status = 'PAID' THEN o.amount ELSE NULL END), 0)::INTEGER AS avg_order_value,
    MAX(o.created_at) AS last_order_date,
    EXTRACT(DAY FROM NOW() - MAX(o.created_at))::INTEGER AS days_since_last_order
FROM public.profiles p
LEFT JOIN public.orders o ON o.user_id = p.id
WHERE p.role = 'USER'
GROUP BY p.id, p.name, p.email, p.created_at
ORDER BY total_spent DESC;

-- 이벤트별 상세 분석
DROP VIEW IF EXISTS public.v_event_analytics;
CREATE VIEW public.v_event_analytics AS
SELECT 
    e.id AS event_id,
    e.title,
    e.event_date,
    e.location,
    e.is_active,
    COUNT(DISTINCT pkg.id) AS package_count,
    AVG(pkg.price)::INTEGER AS avg_package_price,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS gross_revenue,
    COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
        COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS net_profit,
    COUNT(DISTINCT o.user_id) AS unique_customers
FROM public.events e
LEFT JOIN public.packages pkg ON pkg.event_id = e.id
LEFT JOIN public.orders o ON o.event_id = e.id
GROUP BY e.id, e.title, e.event_date, e.location, e.is_active
ORDER BY e.event_date DESC;

-- 파이프라인 병목 분석
DROP VIEW IF EXISTS public.v_pipeline_bottleneck;
CREATE VIEW public.v_pipeline_bottleneck AS
SELECT 
    stage,
    COUNT(*) AS card_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - stage_entered_at)) / 3600)::NUMERIC(10,1) AS avg_hours_in_stage,
    MAX(EXTRACT(EPOCH FROM (NOW() - stage_entered_at)) / 3600)::NUMERIC(10,1) AS max_hours_in_stage,
    COUNT(CASE WHEN assignee_id IS NULL THEN 1 END) AS unassigned_count
FROM public.pipeline_cards
WHERE stage NOT IN ('DELIVERED')
GROUP BY stage;

-- 지출 카테고리 분석
DROP VIEW IF EXISTS public.v_expense_breakdown;
CREATE VIEW public.v_expense_breakdown AS
SELECT 
    e.id AS event_id,
    e.title AS event_title,
    exp.category,
    COUNT(exp.id) AS expense_count,
    SUM(exp.amount) AS total_amount
FROM public.events e
LEFT JOIN public.expenses exp ON exp.event_id = e.id
WHERE exp.id IS NOT NULL
GROUP BY e.id, e.title, exp.category
ORDER BY e.event_date DESC, total_amount DESC;

-- 납품물 현황 추적
DROP VIEW IF EXISTS public.v_deliverable_tracking;
CREATE VIEW public.v_deliverable_tracking AS
SELECT 
    d.id AS deliverable_id,
    d.type AS deliverable_type,
    d.link_status,
    d.is_downloaded,
    pc.stage AS pipeline_stage,
    o.id AS order_id,
    p.name AS customer_name,
    p.email AS customer_email,
    e.title AS event_title,
    pkg.name AS package_name,
    d.created_at
FROM public.deliverables d
JOIN public.pipeline_cards pc ON pc.id = d.card_id
JOIN public.orders o ON o.id = pc.order_id
JOIN public.profiles p ON p.id = o.user_id
JOIN public.events e ON e.id = o.event_id
JOIN public.packages pkg ON pkg.id = o.package_id
ORDER BY d.created_at DESC;

-- =============================================
-- 2. 비즈니스 함수 (Business Functions)
-- =============================================

-- 종합 대시보드 통계
CREATE OR REPLACE FUNCTION public.get_comprehensive_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    today DATE := CURRENT_DATE;
    this_month DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
    SELECT json_build_object(
        'today', json_build_object(
            'orders', (SELECT COUNT(*) FROM public.orders WHERE DATE(created_at) = today),
            'revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE DATE(created_at) = today AND status = 'PAID')
        ),
        'this_month', json_build_object(
            'orders', (SELECT COUNT(*) FROM public.orders WHERE created_at >= this_month),
            'revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE created_at >= this_month AND status = 'PAID'),
            'new_users', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= this_month AND role = 'USER')
        ),
        'all_time', json_build_object(
            'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE status = 'PAID'),
            'total_orders', (SELECT COUNT(*) FROM public.orders),
            'total_customers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'USER'),
            'avg_order_value', (SELECT COALESCE(AVG(amount), 0)::INTEGER FROM public.orders WHERE status = 'PAID')
        ),
        'pipeline', json_build_object(
            'waiting', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'WAITING'),
            'shooting', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'SHOOTING'),
            'editing', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'EDITING'),
            'ready', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'READY'),
            'delivered', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'DELIVERED'),
            'unassigned', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage IN ('SHOOTING', 'EDITING') AND assignee_id IS NULL)
        ),
        'active_events', (SELECT COUNT(*) FROM public.events WHERE is_active = true),
        'pending_contacts', (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'pending')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이벤트 수익성 분석
CREATE OR REPLACE FUNCTION public.get_event_profitability(p_event_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'event_id', e.id,
        'title', e.title,
        'gross_revenue', COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0),
        'total_expenses', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0),
        'net_profit', COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
                      COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0),
        'total_orders', COUNT(o.id),
        'unique_customers', COUNT(DISTINCT o.user_id)
    )
    INTO result
    FROM public.events e
    LEFT JOIN public.orders o ON o.event_id = e.id
    WHERE e.id = p_event_id
    GROUP BY e.id, e.title;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 고객 세그먼트 분석
CREATE OR REPLACE FUNCTION public.get_customer_segments()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'vip', (
            SELECT json_build_object('count', COUNT(*), 'total_revenue', COALESCE(SUM(total_spent), 0))
            FROM (SELECT user_id, SUM(amount) AS total_spent FROM public.orders WHERE status = 'PAID' GROUP BY user_id HAVING SUM(amount) >= 5000000) vip
        ),
        'repeat', (
            SELECT json_build_object('count', COUNT(*))
            FROM (SELECT user_id FROM public.orders WHERE status = 'PAID' GROUP BY user_id HAVING COUNT(*) >= 3) repeat_cust
        ),
        'new', (
            SELECT json_build_object('count', COUNT(*))
            FROM public.profiles WHERE role = 'USER' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 빠른 통계
CREATE OR REPLACE FUNCTION public.get_quick_stats()
RETURNS TABLE (metric TEXT, value BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 'total_revenue'::TEXT, COALESCE(SUM(amount), 0)::BIGINT FROM public.orders WHERE status = 'PAID'
    UNION ALL
    SELECT 'total_orders'::TEXT, COUNT(*)::BIGINT FROM public.orders
    UNION ALL
    SELECT 'active_pipeline'::TEXT, COUNT(*)::BIGINT FROM public.pipeline_cards WHERE stage NOT IN ('DELIVERED', 'WAITING')
    UNION ALL
    SELECT 'pending_delivery'::TEXT, COUNT(*)::BIGINT FROM public.pipeline_cards WHERE stage = 'READY'
    UNION ALL
    SELECT 'active_events'::TEXT, COUNT(*)::BIGINT FROM public.events WHERE is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주문 검색
CREATE OR REPLACE FUNCTION public.search_orders(p_query TEXT)
RETURNS TABLE (
    order_id INTEGER,
    user_name TEXT,
    user_email TEXT,
    event_title TEXT,
    package_name TEXT,
    amount INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, p.name, p.email, e.title, pkg.name, o.amount, o.status, o.created_at
    FROM public.orders o
    JOIN public.profiles p ON p.id = o.user_id
    JOIN public.events e ON e.id = o.event_id
    JOIN public.packages pkg ON pkg.id = o.package_id
    WHERE p.name ILIKE '%' || p_query || '%'
        OR p.email ILIKE '%' || p_query || '%'
        OR e.title ILIKE '%' || p_query || '%'
    ORDER BY o.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이벤트 복제
CREATE OR REPLACE FUNCTION public.duplicate_event(p_event_id INTEGER, p_new_title TEXT, p_new_date DATE)
RETURNS INTEGER AS $$
DECLARE
    new_event_id INTEGER;
    pkg RECORD;
BEGIN
    INSERT INTO public.events (title, event_date, location, is_active, thumbnail_url)
    SELECT p_new_title, p_new_date, location, false, thumbnail_url
    FROM public.events WHERE id = p_event_id
    RETURNING id INTO new_event_id;
    
    FOR pkg IN SELECT * FROM public.packages WHERE event_id = p_event_id LOOP
        INSERT INTO public.packages (event_id, name, price, description, composition, specs, is_sold_out)
        VALUES (new_event_id, pkg.name, pkg.price, pkg.description, pkg.composition, pkg.specs, false);
    END LOOP;
    
    RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. 자동화 트리거
-- =============================================

-- 파이프라인 변경 로깅
CREATE OR REPLACE FUNCTION public.log_pipeline_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, old_value, new_value)
        VALUES (auth.uid(), 'pipeline.stage_changed', 'pipeline_card', NEW.id::TEXT,
                jsonb_build_object('stage', OLD.stage), jsonb_build_object('stage', NEW.stage));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_pipeline_change ON public.pipeline_cards;
CREATE TRIGGER trigger_log_pipeline_change
    AFTER UPDATE ON public.pipeline_cards
    FOR EACH ROW EXECUTE FUNCTION public.log_pipeline_change();

-- 주문 생성시 파이프라인 카드 자동 생성
CREATE OR REPLACE FUNCTION public.auto_create_pipeline_card()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.pipeline_cards (order_id, stage) VALUES (NEW.id, 'WAITING');
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (NEW.user_id, 'order.created', 'order', NEW.id::TEXT,
            jsonb_build_object('amount', NEW.amount, 'package_id', NEW.package_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_pipeline_card ON public.orders;
CREATE TRIGGER trigger_auto_create_pipeline_card
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.auto_create_pipeline_card();

-- =============================================
-- 4. 성능 인덱스
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_event_status ON public.orders(event_id, status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_assignee ON public.pipeline_cards(stage, assignee_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_entered ON public.pipeline_cards(stage, stage_entered_at);
CREATE INDEX IF NOT EXISTS idx_expenses_event_category ON public.expenses(event_id, category);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_active_date ON public.events(is_active, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_packages_event ON public.packages(event_id);

-- =============================================
-- ✅ 완료!
-- =============================================
