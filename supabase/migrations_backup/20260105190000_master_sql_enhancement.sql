-- =============================================
-- VidFlow Manager - MASTER SQL Enhancement
-- Created by: DB Master Agent
-- Date: 2026-01-05
-- Purpose: 비즈니스 인텔리전스, 자동화, 성능 최적화
-- =============================================

-- =============================================
-- PART 1: 고급 분석 뷰 (Advanced Analytics Views)
-- =============================================

-- 1.1 일별 매출 추이 뷰
CREATE OR REPLACE VIEW public.v_daily_revenue AS
SELECT 
    DATE(o.created_at) AS order_date,
    COUNT(o.id) AS order_count,
    SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END) AS revenue,
    SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END) AS refunds,
    COUNT(DISTINCT o.user_id) AS unique_customers
FROM public.orders o
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- 1.2 월별 성장 분석 뷰
CREATE OR REPLACE VIEW public.v_monthly_growth AS
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
    END AS revenue_growth_pct,
    LAG(orders) OVER (ORDER BY month) AS prev_month_orders,
    CASE 
        WHEN LAG(orders) OVER (ORDER BY month) > 0 
        THEN ROUND(((orders - LAG(orders) OVER (ORDER BY month))::NUMERIC / LAG(orders) OVER (ORDER BY month)) * 100, 1)
        ELSE 0 
    END AS orders_growth_pct
FROM monthly_data
ORDER BY month DESC;

-- 1.3 고객 생애 가치 (Customer Lifetime Value) 뷰
CREATE OR REPLACE VIEW public.v_customer_ltv AS
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

-- 1.4 이벤트별 상세 분석 뷰
CREATE OR REPLACE VIEW public.v_event_analytics AS
SELECT 
    e.id AS event_id,
    e.title,
    e.event_date,
    e.location,
    e.is_active,
    -- 패키지 통계
    COUNT(DISTINCT pkg.id) AS package_count,
    AVG(pkg.price)::INTEGER AS avg_package_price,
    MIN(pkg.price) AS min_package_price,
    MAX(pkg.price) AS max_package_price,
    -- 주문 통계
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'PAID' THEN o.id END) AS paid_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'REFUNDED' THEN o.id END) AS refunded_orders,
    -- 매출 통계
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS gross_revenue,
    COALESCE(SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END), 0) AS refund_amount,
    -- 지출 통계
    COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS total_expenses,
    -- 순이익
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
        COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0) AS net_profit,
    -- 마진율
    CASE 
        WHEN COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) > 0 
        THEN ROUND(
            (COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
             COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0))::NUMERIC / 
            COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 1) * 100, 1)
        ELSE 0 
    END AS profit_margin_pct,
    -- 고객 통계
    COUNT(DISTINCT o.user_id) AS unique_customers
FROM public.events e
LEFT JOIN public.packages pkg ON pkg.event_id = e.id
LEFT JOIN public.orders o ON o.event_id = e.id
GROUP BY e.id, e.title, e.event_date, e.location, e.is_active
ORDER BY e.event_date DESC;

-- 1.5 파이프라인 병목 분석 뷰
CREATE OR REPLACE VIEW public.v_pipeline_bottleneck AS
SELECT 
    stage,
    COUNT(*) AS card_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - stage_entered_at)) / 3600)::NUMERIC(10,1) AS avg_hours_in_stage,
    MAX(EXTRACT(EPOCH FROM (NOW() - stage_entered_at)) / 3600)::NUMERIC(10,1) AS max_hours_in_stage,
    COUNT(CASE WHEN assignee_id IS NULL THEN 1 END) AS unassigned_count,
    ROUND(COUNT(CASE WHEN assignee_id IS NULL THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) AS unassigned_pct
FROM public.pipeline_cards
WHERE stage NOT IN ('DELIVERED')
GROUP BY stage
ORDER BY 
    CASE stage 
        WHEN 'WAITING' THEN 1
        WHEN 'SHOOTING' THEN 2
        WHEN 'EDITING' THEN 3
        WHEN 'READY' THEN 4
    END;

-- 1.6 지출 카테고리 분석 뷰
CREATE OR REPLACE VIEW public.v_expense_breakdown AS
SELECT 
    e.id AS event_id,
    e.title AS event_title,
    exp.category,
    COUNT(exp.id) AS expense_count,
    SUM(exp.amount) AS total_amount,
    ROUND(SUM(exp.amount)::NUMERIC / NULLIF((
        SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id
    ), 0) * 100, 1) AS percentage_of_total
FROM public.events e
LEFT JOIN public.expenses exp ON exp.event_id = e.id
WHERE exp.id IS NOT NULL
GROUP BY e.id, e.title, exp.category
ORDER BY e.event_date DESC, total_amount DESC;

-- 1.7 납품물 현황 추적 뷰
CREATE OR REPLACE VIEW public.v_deliverable_tracking AS
SELECT 
    d.id AS deliverable_id,
    d.type AS deliverable_type,
    d.link_status,
    d.is_downloaded,
    d.first_downloaded_at,
    pc.stage AS pipeline_stage,
    o.id AS order_id,
    p.name AS customer_name,
    p.email AS customer_email,
    e.title AS event_title,
    pkg.name AS package_name,
    d.created_at,
    EXTRACT(DAY FROM NOW() - d.created_at)::INTEGER AS days_since_created
FROM public.deliverables d
JOIN public.pipeline_cards pc ON pc.id = d.card_id
JOIN public.orders o ON o.id = pc.order_id
JOIN public.profiles p ON p.id = o.user_id
JOIN public.events e ON e.id = o.event_id
JOIN public.packages pkg ON pkg.id = o.package_id
ORDER BY d.created_at DESC;

-- =============================================
-- PART 2: 고급 비즈니스 함수 (Business Functions)
-- =============================================

-- 2.1 종합 대시보드 통계 함수 (개선판)
CREATE OR REPLACE FUNCTION public.get_comprehensive_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    today DATE := CURRENT_DATE;
    this_month DATE := DATE_TRUNC('month', CURRENT_DATE);
    last_month DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
BEGIN
    SELECT json_build_object(
        -- 오늘 통계
        'today', json_build_object(
            'orders', (SELECT COUNT(*) FROM public.orders WHERE DATE(created_at) = today),
            'revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE DATE(created_at) = today AND status = 'PAID')
        ),
        -- 이번 달 통계
        'this_month', json_build_object(
            'orders', (SELECT COUNT(*) FROM public.orders WHERE created_at >= this_month),
            'revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE created_at >= this_month AND status = 'PAID'),
            'new_users', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= this_month AND role = 'USER')
        ),
        -- 지난 달 통계 (MoM 비교용)
        'last_month', json_build_object(
            'orders', (SELECT COUNT(*) FROM public.orders WHERE created_at >= last_month AND created_at < this_month),
            'revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE created_at >= last_month AND created_at < this_month AND status = 'PAID')
        ),
        -- 전체 누적 통계
        'all_time', json_build_object(
            'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE status = 'PAID'),
            'total_orders', (SELECT COUNT(*) FROM public.orders),
            'total_customers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'USER'),
            'total_events', (SELECT COUNT(*) FROM public.events),
            'avg_order_value', (SELECT COALESCE(AVG(amount), 0)::INTEGER FROM public.orders WHERE status = 'PAID')
        ),
        -- 파이프라인 현황
        'pipeline', json_build_object(
            'waiting', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'WAITING'),
            'shooting', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'SHOOTING'),
            'editing', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'EDITING'),
            'ready', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'READY'),
            'delivered', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'DELIVERED'),
            'unassigned', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage IN ('SHOOTING', 'EDITING') AND assignee_id IS NULL)
        ),
        -- 활성 이벤트
        'active_events', (SELECT COUNT(*) FROM public.events WHERE is_active = true),
        -- 미확인 문의
        'pending_contacts', (SELECT COUNT(*) FROM public.contact_submissions WHERE status = 'pending')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.2 이벤트 수익성 분석 함수
CREATE OR REPLACE FUNCTION public.get_event_profitability(p_event_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'event_id', e.id,
        'title', e.title,
        'event_date', e.event_date,
        -- 매출
        'gross_revenue', COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0),
        'refunds', COALESCE(SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END), 0),
        'net_revenue', COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END), 0),
        -- 지출
        'expenses', json_build_object(
            'labor', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id AND category = 'LABOR'), 0),
            'food', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id AND category = 'FOOD'), 0),
            'travel', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id AND category = 'TRAVEL'), 0),
            'equipment', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id AND category = 'EQUIPMENT'), 0),
            'etc', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id AND category = 'ETC'), 0),
            'total', COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0)
        ),
        -- 순이익
        'net_profit', COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - COALESCE((SELECT SUM(amount) FROM public.expenses WHERE event_id = e.id), 0),
        -- 주문 통계
        'orders', json_build_object(
            'total', COUNT(o.id),
            'paid', COUNT(CASE WHEN o.status = 'PAID' THEN 1 END),
            'refunded', COUNT(CASE WHEN o.status = 'REFUNDED' THEN 1 END)
        ),
        -- 패키지 판매 현황
        'packages_sold', (
            SELECT json_agg(json_build_object(
                'name', pkg.name,
                'price', pkg.price,
                'sold_count', COUNT(ord.id)
            ))
            FROM public.packages pkg
            LEFT JOIN public.orders ord ON ord.package_id = pkg.id AND ord.status = 'PAID'
            WHERE pkg.event_id = e.id
            GROUP BY pkg.id, pkg.name, pkg.price
        )
    )
    INTO result
    FROM public.events e
    LEFT JOIN public.orders o ON o.event_id = e.id
    WHERE e.id = p_event_id
    GROUP BY e.id, e.title, e.event_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.3 작업자 성과 분석 함수
CREATE OR REPLACE FUNCTION public.get_worker_stats(p_worker_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(worker_data)
    INTO result
    FROM (
        SELECT 
            p.id AS worker_id,
            p.name,
            p.role,
            p.commission_rate,
            -- 할당된 작업
            COUNT(pc.id) AS total_assigned,
            COUNT(CASE WHEN pc.stage = 'DELIVERED' THEN 1 END) AS completed,
            COUNT(CASE WHEN pc.stage IN ('SHOOTING', 'EDITING') THEN 1 END) AS in_progress,
            -- 평균 완료 시간 (시간 단위)
            ROUND(AVG(
                CASE WHEN pc.stage = 'DELIVERED' 
                THEN EXTRACT(EPOCH FROM (pc.updated_at - pc.stage_entered_at)) / 3600 
                END
            )::NUMERIC, 1) AS avg_completion_hours,
            -- 이번 달 완료 건수
            COUNT(CASE WHEN pc.stage = 'DELIVERED' AND pc.updated_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS completed_this_month,
            -- 총 매출 기여
            COALESCE(SUM(
                CASE WHEN pc.stage = 'DELIVERED' THEN o.amount * (p.commission_rate::NUMERIC / 100) END
            ), 0)::INTEGER AS total_commission_earned
        FROM public.profiles p
        LEFT JOIN public.pipeline_cards pc ON pc.assignee_id = p.id
        LEFT JOIN public.orders o ON o.id = pc.order_id AND o.status = 'PAID'
        WHERE p.role IN ('ADMIN', 'EDITOR')
        AND (p_worker_id IS NULL OR p.id = p_worker_id)
        GROUP BY p.id, p.name, p.role, p.commission_rate
        ORDER BY completed DESC
    ) worker_data;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.4 기간별 매출 비교 함수
CREATE OR REPLACE FUNCTION public.compare_revenue_periods(
    p_start_date DATE,
    p_end_date DATE,
    p_compare_start DATE,
    p_compare_end DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_revenue BIGINT;
    compare_revenue BIGINT;
    current_orders BIGINT;
    compare_orders BIGINT;
BEGIN
    -- 현재 기간
    SELECT 
        COALESCE(SUM(amount), 0),
        COUNT(*)
    INTO current_revenue, current_orders
    FROM public.orders
    WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    AND status = 'PAID';
    
    -- 비교 기간
    SELECT 
        COALESCE(SUM(amount), 0),
        COUNT(*)
    INTO compare_revenue, compare_orders
    FROM public.orders
    WHERE created_at::DATE BETWEEN p_compare_start AND p_compare_end
    AND status = 'PAID';
    
    SELECT json_build_object(
        'current_period', json_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date,
            'revenue', current_revenue,
            'orders', current_orders
        ),
        'compare_period', json_build_object(
            'start_date', p_compare_start,
            'end_date', p_compare_end,
            'revenue', compare_revenue,
            'orders', compare_orders
        ),
        'difference', json_build_object(
            'revenue_diff', current_revenue - compare_revenue,
            'revenue_pct_change', CASE WHEN compare_revenue > 0 THEN ROUND(((current_revenue - compare_revenue)::NUMERIC / compare_revenue) * 100, 1) ELSE 0 END,
            'orders_diff', current_orders - compare_orders,
            'orders_pct_change', CASE WHEN compare_orders > 0 THEN ROUND(((current_orders - compare_orders)::NUMERIC / compare_orders) * 100, 1) ELSE 0 END
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.5 고객 세그먼트 분석 함수
CREATE OR REPLACE FUNCTION public.get_customer_segments()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        -- VIP 고객 (500만원 이상)
        'vip', (
            SELECT json_build_object(
                'count', COUNT(*),
                'total_revenue', COALESCE(SUM(total_spent), 0)
            )
            FROM (
                SELECT user_id, SUM(amount) AS total_spent
                FROM public.orders
                WHERE status = 'PAID'
                GROUP BY user_id
                HAVING SUM(amount) >= 5000000
            ) vip_customers
        ),
        -- 단골 고객 (3회 이상 구매)
        'repeat', (
            SELECT json_build_object(
                'count', COUNT(*),
                'total_revenue', COALESCE(SUM(total_spent), 0)
            )
            FROM (
                SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_spent
                FROM public.orders
                WHERE status = 'PAID'
                GROUP BY user_id
                HAVING COUNT(*) >= 3
            ) repeat_customers
        ),
        -- 신규 고객 (최근 30일 가입)
        'new', (
            SELECT json_build_object(
                'count', COUNT(*)
            )
            FROM public.profiles
            WHERE role = 'USER'
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        -- 휴면 고객 (90일 이상 미구매)
        'dormant', (
            SELECT json_build_object(
                'count', COUNT(*)
            )
            FROM (
                SELECT p.id
                FROM public.profiles p
                LEFT JOIN public.orders o ON o.user_id = p.id
                WHERE p.role = 'USER'
                GROUP BY p.id
                HAVING MAX(o.created_at) < CURRENT_DATE - INTERVAL '90 days'
                OR MAX(o.created_at) IS NULL
            ) dormant_customers
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 3: 자동화 트리거 (Automation Triggers)
-- =============================================

-- 3.1 파이프라인 단계 변경시 자동 로깅
CREATE OR REPLACE FUNCTION public.log_pipeline_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, old_value, new_value)
        VALUES (
            auth.uid(),
            'pipeline.stage_changed',
            'pipeline_card',
            NEW.id::TEXT,
            jsonb_build_object('stage', OLD.stage),
            jsonb_build_object('stage', NEW.stage)
        );
    END IF;
    
    IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, old_value, new_value)
        VALUES (
            auth.uid(),
            'pipeline.assignee_changed',
            'pipeline_card',
            NEW.id::TEXT,
            jsonb_build_object('assignee_id', OLD.assignee_id),
            jsonb_build_object('assignee_id', NEW.assignee_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_pipeline_change ON public.pipeline_cards;
CREATE TRIGGER trigger_log_pipeline_change
    AFTER UPDATE ON public.pipeline_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.log_pipeline_change();

-- 3.2 주문 생성시 파이프라인 카드 자동 생성
CREATE OR REPLACE FUNCTION public.auto_create_pipeline_card()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.pipeline_cards (order_id, stage)
    VALUES (NEW.id, 'WAITING');
    
    -- 활동 로그
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        NEW.user_id,
        'order.created',
        'order',
        NEW.id::TEXT,
        jsonb_build_object('amount', NEW.amount, 'package_id', NEW.package_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_pipeline_card ON public.orders;
CREATE TRIGGER trigger_auto_create_pipeline_card
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_pipeline_card();

-- 3.3 프로필 변경 로깅
CREATE OR REPLACE FUNCTION public.log_profile_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, old_value, new_value)
        VALUES (
            auth.uid(),
            'profile.role_changed',
            'profile',
            NEW.id::TEXT,
            jsonb_build_object('role', OLD.role),
            jsonb_build_object('role', NEW.role)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_profile_change ON public.profiles;
CREATE TRIGGER trigger_log_profile_change
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_change();

-- =============================================
-- PART 4: 성능 최적화 인덱스
-- =============================================

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_event_status ON public.orders(event_id, status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_assignee ON public.pipeline_cards(stage, assignee_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_entered ON public.pipeline_cards(stage, stage_entered_at);
CREATE INDEX IF NOT EXISTS idx_expenses_event_category ON public.expenses(event_id, category);
CREATE INDEX IF NOT EXISTS idx_deliverables_card_status ON public.deliverables(card_id, link_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_active_date ON public.events(is_active, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_packages_event ON public.packages(event_id);
CREATE INDEX IF NOT EXISTS idx_showcase_package ON public.showcase_items(package_id);

-- 참고: 텍스트 검색 인덱스 (pg_trgm 필요 - 기본 비활성화)
-- 필요시 아래 명령어로 활성화 후 사용:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_profiles_name_trgm ON public.profiles USING gin(name gin_trgm_ops);
-- CREATE INDEX idx_events_title_trgm ON public.events USING gin(title gin_trgm_ops);

-- =============================================
-- PART 5: 유틸리티 함수
-- =============================================

-- 5.1 빠른 검색 함수
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
    SELECT 
        o.id,
        p.name,
        p.email,
        e.title,
        pkg.name,
        o.amount,
        o.status,
        o.created_at
    FROM public.orders o
    JOIN public.profiles p ON p.id = o.user_id
    JOIN public.events e ON e.id = o.event_id
    JOIN public.packages pkg ON pkg.id = o.package_id
    WHERE 
        p.name ILIKE '%' || p_query || '%'
        OR p.email ILIKE '%' || p_query || '%'
        OR e.title ILIKE '%' || p_query || '%'
        OR pkg.name ILIKE '%' || p_query || '%'
    ORDER BY o.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 대시보드 요약 (빠른 버전)
CREATE OR REPLACE FUNCTION public.get_quick_stats()
RETURNS TABLE (
    metric TEXT,
    value BIGINT
) AS $$
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

-- 5.3 이벤트 복제 함수
CREATE OR REPLACE FUNCTION public.duplicate_event(p_event_id INTEGER, p_new_title TEXT, p_new_date DATE)
RETURNS INTEGER AS $$
DECLARE
    new_event_id INTEGER;
    pkg RECORD;
BEGIN
    -- 이벤트 복제
    INSERT INTO public.events (title, event_date, location, is_active, thumbnail_url)
    SELECT p_new_title, p_new_date, location, false, thumbnail_url
    FROM public.events
    WHERE id = p_event_id
    RETURNING id INTO new_event_id;
    
    -- 패키지 복제
    FOR pkg IN SELECT * FROM public.packages WHERE event_id = p_event_id
    LOOP
        INSERT INTO public.packages (event_id, name, price, description, composition, specs, is_sold_out)
        VALUES (new_event_id, pkg.name, pkg.price, pkg.description, pkg.composition, pkg.specs, false);
    END LOOP;
    
    -- 로그
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    VALUES (auth.uid(), 'event.duplicated', 'event', new_event_id::TEXT, 
            jsonb_build_object('source_event_id', p_event_id));
    
    RETURN new_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 6: 뷰에 대한 RLS 비활성화 (읽기 전용)
-- =============================================

-- 뷰는 기본적으로 RLS가 적용되지 않으므로, 
-- 보안이 필요한 경우 함수로 래핑하거나 정책을 추가

-- =============================================
-- ✅ MASTER SQL COMPLETE
-- =============================================
