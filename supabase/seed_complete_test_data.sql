-- ============================================================
-- 🧪 VidFlow Test Data - FIXED VERSION
-- ============================================================
-- 정확한 스키마에 맞춰 수정된 테스트 데이터
-- Supabase Dashboard > SQL Editor 에서 실행
-- ============================================================

-- STEP 1: 테스트 이벤트 추가
INSERT INTO public.events (title, event_date, location, is_active, thumbnail_url)
VALUES 
    ('2026 Korea Classic Pro', '2026-06-15', 'Incheon Songdo Convensia', true, 'https://placehold.co/600x400/1a1a1a/DC2626?text=Korea+Classic'),
    ('2026 Asia Grand Prix', '2026-09-20', 'Daejeon Convention Center', true, 'https://placehold.co/600x400/1a1a1a/DC2626?text=Asia+GP')
ON CONFLICT DO NOTHING;

-- STEP 2: Korea Classic Pro 패키지
INSERT INTO public.packages (event_id, name, price, description, composition, is_sold_out)
SELECT e.id, 'Bronze Package', 120000, 'Stage video only', '["STAGE_VIDEO"]'::jsonb, false
FROM public.events e WHERE e.title = '2026 Korea Classic Pro'
ON CONFLICT DO NOTHING;

INSERT INTO public.packages (event_id, name, price, description, composition, is_sold_out)
SELECT e.id, 'Silver Package', 250000, 'Stage + Backstage video', '["STAGE_VIDEO", "BACKSTAGE_VIDEO"]'::jsonb, false
FROM public.events e WHERE e.title = '2026 Korea Classic Pro'
ON CONFLICT DO NOTHING;

INSERT INTO public.packages (event_id, name, price, description, composition, is_sold_out)
SELECT e.id, 'Gold Package', 400000, 'Full video + photo set', '["STAGE_VIDEO", "BACKSTAGE_VIDEO", "HIGHLIGHT_REEL", "PHOTO_SET"]'::jsonb, false
FROM public.events e WHERE e.title = '2026 Korea Classic Pro'
ON CONFLICT DO NOTHING;

-- STEP 3: Asia Grand Prix 패키지
INSERT INTO public.packages (event_id, name, price, description, composition, is_sold_out)
SELECT e.id, 'Standard', 150000, 'Basic stage video', '["STAGE_VIDEO"]'::jsonb, false
FROM public.events e WHERE e.title = '2026 Asia Grand Prix'
ON CONFLICT DO NOTHING;

INSERT INTO public.packages (event_id, name, price, description, composition, is_sold_out)
SELECT e.id, 'Premium', 320000, 'Premium video set', '["STAGE_VIDEO", "BACKSTAGE_VIDEO", "HIGHLIGHT_REEL"]'::jsonb, false
FROM public.events e WHERE e.title = '2026 Asia Grand Prix'
ON CONFLICT DO NOTHING;

-- STEP 4: 기존 유저를 사용한 테스트 주문 생성
INSERT INTO public.orders (user_id, event_id, package_id, amount, status, payment_id)
SELECT 
    p.id,
    e.id,
    pkg.id,
    pkg.price,
    'PAID',
    'TEST_PAY_' || substr(md5(random()::text), 1, 10)
FROM public.profiles p
CROSS JOIN public.events e
JOIN public.packages pkg ON pkg.event_id = e.id
WHERE e.is_active = true
LIMIT 5;

-- STEP 5: 파이프라인 카드 생성 (올바른 stage 값 사용: WAITING, SHOOTING, EDITING, READY)
INSERT INTO public.pipeline_cards (order_id, stage, stage_entered_at)
SELECT 
    o.id,
    CASE 
        WHEN row_number() OVER (ORDER BY o.id) % 4 = 0 THEN 'WAITING'
        WHEN row_number() OVER (ORDER BY o.id) % 4 = 1 THEN 'SHOOTING'
        WHEN row_number() OVER (ORDER BY o.id) % 4 = 2 THEN 'EDITING'
        ELSE 'READY'
    END,
    NOW() - (random() * interval '5 days')
FROM public.orders o
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_cards pc WHERE pc.order_id = o.id);

-- STEP 6: 산출물 생성 (올바른 컬럼명: card_id)
INSERT INTO public.deliverables (card_id, type, link_status)
SELECT 
    pc.id,
    'STAGE_VIDEO',
    'UNCHECKED'
FROM public.pipeline_cards pc
WHERE NOT EXISTS (SELECT 1 FROM public.deliverables d WHERE d.card_id = pc.id);

-- STEP 7: 테스트 지출 추가
INSERT INTO public.expenses (event_id, category, description, amount, is_auto_generated)
SELECT e.id, 'EQUIPMENT', '4K Camera Rental', 150000, false
FROM public.events e WHERE e.is_active = true LIMIT 1;

INSERT INTO public.expenses (event_id, category, description, amount, is_auto_generated)
SELECT e.id, 'TRAVEL', 'Travel expenses', 85000, false
FROM public.events e WHERE e.is_active = true LIMIT 1;

INSERT INTO public.expenses (event_id, category, description, amount, is_auto_generated)
SELECT e.id, 'FOOD', 'Staff meals', 120000, false
FROM public.events e WHERE e.is_active = true LIMIT 1;

-- 완료 확인
SELECT 'SUCCESS! Test data created.' as result;
SELECT 'Events: ' || count(*) FROM public.events;
SELECT 'Packages: ' || count(*) FROM public.packages;
SELECT 'Orders: ' || count(*) FROM public.orders WHERE status = 'PAID';
SELECT 'Pipeline Cards: ' || count(*) FROM public.pipeline_cards;
