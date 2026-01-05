-- =============================================
-- VidFlow Manager - CRM Marketing & Upsell System
-- Created: 2026-01-06
-- Purpose: 업셀링 대상 고객 식별 및 세그먼트 빌더
-- =============================================

-- =============================================
-- PART 1: 업셀링 대상 고객 뷰
-- =============================================

-- 1.1 업셀링 후보 고객 뷰 (저렴한 패키지 구매 후 DELIVERED 상태인 고객)
CREATE OR REPLACE VIEW public.v_upsell_candidates AS
SELECT 
    p.id AS user_id,
    p.name AS customer_name,
    p.email AS customer_email,
    p.phone,
    o.id AS order_id,
    o.amount AS paid_amount,
    o.created_at AS order_date,
    e.id AS event_id,
    e.title AS event_title,
    e.event_date,
    pkg.id AS package_id,
    pkg.name AS package_name,
    pkg.price AS package_price,
    pc.stage AS pipeline_stage,
    pc.updated_at AS delivered_at,
    -- 같은 이벤트의 더 비싼 패키지 정보
    (
        SELECT json_agg(json_build_object(
            'id', up.id,
            'name', up.name,
            'price', up.price,
            'price_diff', up.price - pkg.price,
            'upgrade_value_pct', ROUND(((up.price - pkg.price)::NUMERIC / pkg.price) * 100, 0)
        ) ORDER BY up.price)
        FROM public.packages up
        WHERE up.event_id = e.id 
        AND up.price > pkg.price
        AND up.is_sold_out = false
    ) AS upgrade_options,
    -- 업셀 우선순위 스코어 (낮은 패키지 가격 + 최근 납품 = 높은 점수)
    CASE 
        WHEN pkg.price < 100000 THEN 100
        WHEN pkg.price < 200000 THEN 80
        WHEN pkg.price < 300000 THEN 60
        WHEN pkg.price < 500000 THEN 40
        ELSE 20
    END + 
    CASE 
        WHEN pc.updated_at > NOW() - INTERVAL '7 days' THEN 50
        WHEN pc.updated_at > NOW() - INTERVAL '14 days' THEN 30
        WHEN pc.updated_at > NOW() - INTERVAL '30 days' THEN 15
        ELSE 0
    END AS upsell_priority_score,
    -- 납품 후 경과일
    EXTRACT(DAY FROM NOW() - pc.updated_at)::INTEGER AS days_since_delivery,
    -- 고객 총 구매 금액 (LTV)
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.orders
        WHERE user_id = p.id AND status = 'PAID'
    ) AS customer_ltv,
    -- 구매 횟수
    (
        SELECT COUNT(*)
        FROM public.orders
        WHERE user_id = p.id AND status = 'PAID'
    ) AS total_orders
FROM public.profiles p
JOIN public.orders o ON o.user_id = p.id AND o.status = 'PAID'
JOIN public.events e ON e.id = o.event_id
JOIN public.packages pkg ON pkg.id = o.package_id
JOIN public.pipeline_cards pc ON pc.order_id = o.id
WHERE pc.stage = 'DELIVERED'
-- 더 비싼 패키지가 존재하는 경우만
AND EXISTS (
    SELECT 1 FROM public.packages up 
    WHERE up.event_id = e.id 
    AND up.price > pkg.price
    AND up.is_sold_out = false
)
ORDER BY upsell_priority_score DESC, pc.updated_at DESC;

-- =============================================
-- PART 2: 고객 세그먼트 빌더 함수
-- =============================================

-- 2.1 동적 세그먼트 조회 함수
CREATE OR REPLACE FUNCTION public.get_customer_segment(
    p_min_spent INTEGER DEFAULT NULL,
    p_max_spent INTEGER DEFAULT NULL,
    p_min_orders INTEGER DEFAULT NULL,
    p_max_orders INTEGER DEFAULT NULL,
    p_min_days_since_order INTEGER DEFAULT NULL,
    p_max_days_since_order INTEGER DEFAULT NULL,
    p_event_ids INTEGER[] DEFAULT NULL,
    p_package_ids INTEGER[] DEFAULT NULL,
    p_has_delivered BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    phone TEXT,
    total_spent BIGINT,
    total_orders BIGINT,
    last_order_date TIMESTAMPTZ,
    days_since_last_order INTEGER,
    events_participated TEXT[],
    packages_purchased TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH customer_agg AS (
        SELECT 
            p.id,
            p.name,
            p.email,
            p.phone,
            COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS total_spent,
            COUNT(DISTINCT o.id) AS total_orders,
            MAX(o.created_at) AS last_order_date,
            EXTRACT(DAY FROM NOW() - MAX(o.created_at))::INTEGER AS days_diff,
            ARRAY_AGG(DISTINCT e.title) FILTER (WHERE e.title IS NOT NULL) AS events,
            ARRAY_AGG(DISTINCT pkg.name) FILTER (WHERE pkg.name IS NOT NULL) AS packages,
            BOOL_OR(pc.stage = 'DELIVERED') AS has_delivery
        FROM public.profiles p
        LEFT JOIN public.orders o ON o.user_id = p.id
        LEFT JOIN public.events e ON e.id = o.event_id
        LEFT JOIN public.packages pkg ON pkg.id = o.package_id
        LEFT JOIN public.pipeline_cards pc ON pc.order_id = o.id
        WHERE p.role = 'USER'
        GROUP BY p.id, p.name, p.email, p.phone
    )
    SELECT 
        ca.id,
        ca.name,
        ca.email,
        ca.phone,
        ca.total_spent,
        ca.total_orders,
        ca.last_order_date,
        ca.days_diff,
        ca.events,
        ca.packages
    FROM customer_agg ca
    WHERE 
        (p_min_spent IS NULL OR ca.total_spent >= p_min_spent)
        AND (p_max_spent IS NULL OR ca.total_spent <= p_max_spent)
        AND (p_min_orders IS NULL OR ca.total_orders >= p_min_orders)
        AND (p_max_orders IS NULL OR ca.total_orders <= p_max_orders)
        AND (p_min_days_since_order IS NULL OR ca.days_diff >= p_min_days_since_order)
        AND (p_max_days_since_order IS NULL OR ca.days_diff <= p_max_days_since_order)
        AND (p_has_delivered IS NULL OR ca.has_delivery = p_has_delivered)
    ORDER BY ca.total_spent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.2 세그먼트 카운트 함수 (프리뷰용)
CREATE OR REPLACE FUNCTION public.count_customer_segment(
    p_min_spent INTEGER DEFAULT NULL,
    p_max_spent INTEGER DEFAULT NULL,
    p_min_orders INTEGER DEFAULT NULL,
    p_max_orders INTEGER DEFAULT NULL,
    p_min_days_since_order INTEGER DEFAULT NULL,
    p_max_days_since_order INTEGER DEFAULT NULL,
    p_has_delivered BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
    total_value BIGINT;
BEGIN
    WITH filtered AS (
        SELECT * FROM public.get_customer_segment(
            p_min_spent, p_max_spent, 
            p_min_orders, p_max_orders,
            p_min_days_since_order, p_max_days_since_order,
            NULL, NULL, p_has_delivered
        )
    )
    SELECT 
        COUNT(*)::INTEGER,
        COALESCE(SUM(total_spent), 0)::BIGINT
    INTO total_count, total_value
    FROM filtered;
    
    SELECT json_build_object(
        'count', total_count,
        'total_value', total_value,
        'avg_value', CASE WHEN total_count > 0 THEN (total_value / total_count)::INTEGER ELSE 0 END
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PART 3: 업셀링 캠페인 테이블
-- =============================================

-- 3.1 업셀링 캠페인 테이블
CREATE TABLE IF NOT EXISTS public.upsell_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_segment JSONB NOT NULL DEFAULT '{}', -- 세그먼트 조건 저장
    upgrade_package_id INTEGER REFERENCES public.packages(id),
    discount_type VARCHAR(20) DEFAULT 'NONE' CHECK (discount_type IN ('NONE', 'FIXED', 'PERCENT')),
    discount_value INTEGER DEFAULT 0,
    message_template TEXT, -- 이메일/알림 템플릿
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 3.2 업셀링 캠페인 고객 연결 테이블 (발송 대상 추적)
CREATE TABLE IF NOT EXISTS public.upsell_campaign_targets (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES public.upsell_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    original_order_id INTEGER REFERENCES public.orders(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'OPENED', 'CLICKED', 'CONVERTED', 'IGNORED')),
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    converted_order_id INTEGER REFERENCES public.orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id, original_order_id)
);

-- 3.3 업셀링 통계 뷰
CREATE OR REPLACE VIEW public.v_upsell_campaign_stats AS
SELECT 
    uc.id AS campaign_id,
    uc.name AS campaign_name,
    uc.status,
    uc.start_date,
    uc.end_date,
    COUNT(uct.id) AS total_targets,
    COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) AS sent_count,
    COUNT(CASE WHEN uct.status = 'OPENED' THEN 1 END) AS opened_count,
    COUNT(CASE WHEN uct.status = 'CLICKED' THEN 1 END) AS clicked_count,
    COUNT(CASE WHEN uct.status = 'CONVERTED' THEN 1 END) AS converted_count,
    -- 전환율
    CASE WHEN COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) > 0 
        THEN ROUND(COUNT(CASE WHEN uct.status = 'CONVERTED' THEN 1 END)::NUMERIC / 
             COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) * 100, 1)
        ELSE 0 
    END AS conversion_rate,
    -- 오픈율
    CASE WHEN COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) > 0 
        THEN ROUND(COUNT(CASE WHEN uct.status IN ('OPENED', 'CLICKED', 'CONVERTED') THEN 1 END)::NUMERIC / 
             COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) * 100, 1)
        ELSE 0 
    END AS open_rate,
    -- 예상 수익
    COALESCE(SUM(
        CASE WHEN uct.status = 'CONVERTED' THEN 
            (SELECT amount FROM public.orders WHERE id = uct.converted_order_id)
        END
    ), 0) AS total_revenue
FROM public.upsell_campaigns uc
LEFT JOIN public.upsell_campaign_targets uct ON uct.campaign_id = uc.id
GROUP BY uc.id, uc.name, uc.status, uc.start_date, uc.end_date
ORDER BY uc.created_at DESC;

-- =============================================
-- PART 4: 인덱스 및 정책
-- =============================================

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_upsell_campaigns_status ON public.upsell_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_upsell_targets_campaign ON public.upsell_campaign_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_upsell_targets_user ON public.upsell_campaign_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_targets_status ON public.upsell_campaign_targets(status);

-- RLS 정책 (관리자만 접근 가능)
ALTER TABLE public.upsell_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_campaign_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upsell_campaigns_admin_only" ON public.upsell_campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR')
        )
    );

CREATE POLICY "upsell_targets_admin_only" ON public.upsell_campaign_targets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR')
        )
    );

-- =============================================
-- PART 5: 업셀링 요약 통계 함수
-- =============================================

CREATE OR REPLACE FUNCTION public.get_upsell_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_candidates', (SELECT COUNT(*) FROM public.v_upsell_candidates),
        'high_priority', (SELECT COUNT(*) FROM public.v_upsell_candidates WHERE upsell_priority_score >= 100),
        'medium_priority', (SELECT COUNT(*) FROM public.v_upsell_candidates WHERE upsell_priority_score >= 50 AND upsell_priority_score < 100),
        'low_priority', (SELECT COUNT(*) FROM public.v_upsell_candidates WHERE upsell_priority_score < 50),
        'potential_revenue', (
            SELECT COALESCE(SUM(
                (upgrade_options::jsonb -> 0 ->> 'price_diff')::INTEGER
            ), 0)
            FROM public.v_upsell_candidates
            WHERE upgrade_options IS NOT NULL
        ),
        'recent_deliveries', (SELECT COUNT(*) FROM public.v_upsell_candidates WHERE days_since_delivery <= 7),
        'active_campaigns', (SELECT COUNT(*) FROM public.upsell_campaigns WHERE status = 'ACTIVE'),
        'total_conversions', (
            SELECT COUNT(*) FROM public.upsell_campaign_targets WHERE status = 'CONVERTED'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ✅ CRM MARKETING SQL COMPLETE
-- =============================================
