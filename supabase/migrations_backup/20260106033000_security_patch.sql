-- =============================================
-- VidFlow Security Patch
-- Created: 2026-01-06
-- Purpose: Function Search Path 및 View Security 강화
-- =============================================

-- 1. Fix Function Search Path Mutable Issue
-- search_path를 public으로 명시적으로 설정하여 스키마 하이재킹 방지

ALTER FUNCTION public.get_customer_segment(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER[], INTEGER[], BOOLEAN) 
    SET search_path = public;

ALTER FUNCTION public.count_customer_segment(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN) 
    SET search_path = public;

ALTER FUNCTION public.get_upsell_summary() 
    SET search_path = public;

-- 2. Fix Security Definer View Issue
-- 뷰에 security_invoker = true를 적용하여 호출자의 RLS 정책을 따르도록 변경
-- 기존 뷰를 재생성하여 옵션 적용

CREATE OR REPLACE VIEW public.v_upsell_candidates 
WITH (security_invoker = true)
AS
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
    EXTRACT(DAY FROM NOW() - pc.updated_at)::INTEGER AS days_since_delivery,
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM public.orders
        WHERE user_id = p.id AND status = 'PAID'
    ) AS customer_ltv,
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
AND EXISTS (
    SELECT 1 FROM public.packages up 
    WHERE up.event_id = e.id 
    AND up.price > pkg.price
    AND up.is_sold_out = false
)
ORDER BY upsell_priority_score DESC, pc.updated_at DESC;

-- v_upsell_campaign_stats 뷰 보안 강화
CREATE OR REPLACE VIEW public.v_upsell_campaign_stats
WITH (security_invoker = true)
AS
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
    CASE WHEN COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) > 0 
        THEN ROUND(COUNT(CASE WHEN uct.status = 'CONVERTED' THEN 1 END)::NUMERIC / 
             COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) * 100, 1)
        ELSE 0 
    END AS conversion_rate,
    CASE WHEN COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) > 0 
        THEN ROUND(COUNT(CASE WHEN uct.status IN ('OPENED', 'CLICKED', 'CONVERTED') THEN 1 END)::NUMERIC / 
             COUNT(CASE WHEN uct.status = 'SENT' THEN 1 END) * 100, 1)
        ELSE 0 
    END AS open_rate,
    COALESCE(SUM(
        CASE WHEN uct.status = 'CONVERTED' THEN 
            (SELECT amount FROM public.orders WHERE id = uct.converted_order_id)
        END
    ), 0) AS total_revenue
FROM public.upsell_campaigns uc
LEFT JOIN public.upsell_campaign_targets uct ON uct.campaign_id = uc.id
GROUP BY uc.id, uc.name, uc.status, uc.start_date, uc.end_date
ORDER BY uc.created_at DESC;
