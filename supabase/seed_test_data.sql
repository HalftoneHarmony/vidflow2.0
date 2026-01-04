-- ============================================
-- VidFlow 테스트 데이터 삽입 SQL
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 테스트 이벤트 생성
INSERT INTO events (title, event_date, location, is_active, thumbnail_url)
VALUES
    ('2026 NPCA Seoul Championship', '2026-03-15', '서울 올림픽공원 체조경기장', true, NULL),
    ('2026 Spring Physique Classic', '2026-04-20', '부산 벡스코 컨벤션홀', true, NULL),
    ('2026 Korea National Bodybuilding', '2026-05-10', '대구 엑스코', true, NULL)
ON CONFLICT DO NOTHING;

-- 2. 테스트 패키지 생성 (각 이벤트별)
-- NPCA Seoul용 패키지
INSERT INTO packages (event_id, name, price, description, composition, is_sold_out)
SELECT 
    e.id,
    p.name,
    p.price,
    p.description,
    p.composition,
    false
FROM events e
CROSS JOIN (
    VALUES 
        ('Basic Cut', 150000, '스테이지 영상 1개 (4K)', ARRAY['STAGE_VIDEO']),
        ('Pro Stage', 280000, '스테이지 + 백스테이지 영상 (4K)', ARRAY['STAGE_VIDEO', 'BACKSTAGE_VIDEO']),
        ('Ultimate Pack', 450000, '모든 영상 + 하이라이트 릴 (4K)', ARRAY['STAGE_VIDEO', 'BACKSTAGE_VIDEO', 'HIGHLIGHT_REEL', 'PHOTO_SET'])
) AS p(name, price, description, composition)
WHERE e.title = '2026 NPCA Seoul Championship'
ON CONFLICT DO NOTHING;

-- Spring Physique용 패키지
INSERT INTO packages (event_id, name, price, description, composition, is_sold_out)
SELECT 
    e.id,
    p.name,
    p.price,
    p.description,
    p.composition,
    false
FROM events e
CROSS JOIN (
    VALUES 
        ('Essential', 120000, '기본 스테이지 영상', ARRAY['STAGE_VIDEO']),
        ('Premium', 250000, '프리미엄 영상 패키지', ARRAY['STAGE_VIDEO', 'BACKSTAGE_VIDEO'])
) AS p(name, price, description, composition)
WHERE e.title = '2026 Spring Physique Classic'
ON CONFLICT DO NOTHING;

-- 3. 테스트 사용자 프로필 생성 (작업자용)
-- 참고: auth.users에 먼저 사용자가 있어야 합니다. 
-- Supabase Auth로 가입한 사용자의 ID를 사용하세요.
-- 아래는 profiles 테이블에 직접 삽입하는 예시입니다.

-- 작업자 프로필 (commission_rate 설정)
-- 주의: user_id는 실제 auth.users의 UUID로 교체해야 합니다.
-- INSERT INTO profiles (id, name, role, commission_rate)
-- VALUES 
--     ('실제-UUID-1', '김편집', 'EDITOR', 50000),
--     ('실제-UUID-2', '이촬영', 'VIDEOGRAPHER', 80000)
-- ON CONFLICT (id) DO UPDATE SET 
--     name = EXCLUDED.name,
--     role = EXCLUDED.role,
--     commission_rate = EXCLUDED.commission_rate;

-- 4. 테스트 참가자(고객) 주문 생성
-- 먼저 테스트 사용자를 Supabase Auth에서 생성한 후 아래 주석을 해제하세요.
-- INSERT INTO orders (event_id, package_id, user_id, amount, status, payment_id)
-- SELECT 
--     e.id,
--     p.id,
--     '고객-UUID',  -- 실제 고객 UUID로 교체
--     p.price,
--     'PAID',
--     'TEST_PAYMENT_' || floor(random() * 1000000)::text
-- FROM events e
-- JOIN packages p ON p.event_id = e.id
-- WHERE e.title = '2026 NPCA Seoul Championship'
-- LIMIT 3;

-- 5. 수동 지출 테스트 데이터
INSERT INTO expenses (event_id, category, description, amount, is_auto_generated)
SELECT 
    e.id,
    category,
    description,
    amount,
    false
FROM events e
CROSS JOIN (
    VALUES 
        ('FOOD', '스태프 점심 식대', 85000),
        ('TRAVEL', '장비 운송비', 120000),
        ('EQUIPMENT', '조명 장비 렌탈', 200000)
) AS exp(category, description, amount)
WHERE e.title = '2026 NPCA Seoul Championship'
ON CONFLICT DO NOTHING;

-- ============================================
-- 실행 확인
-- ============================================
SELECT 'Events:', count(*) FROM events;
SELECT 'Packages:', count(*) FROM packages;
SELECT 'Expenses:', count(*) FROM expenses;
