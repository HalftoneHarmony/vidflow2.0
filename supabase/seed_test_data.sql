-- =============================================
-- VidFlow Manager 2.0 - Test Data Reset & Seed
-- Purpose: End-to-end testing with realistic data
-- Created: 2026-01-05
-- =============================================

-- =============================================
-- STEP 1: CLEAR ALL EXISTING DATA
-- =============================================

-- Clear deliverables first
DELETE FROM public.deliverables;

-- Clear pipeline cards
DELETE FROM public.pipeline_cards;

-- Clear expenses
DELETE FROM public.expenses;

-- Clear orders
DELETE FROM public.orders;

-- Clear showcase items
DELETE FROM public.showcase_items;

-- Clear packages
DELETE FROM public.packages;

-- Clear events
DELETE FROM public.events;

-- Clear test profiles and auth users (keep real users with real emails)
DELETE FROM public.profiles WHERE email LIKE '%@vidflow.test';
DELETE FROM auth.users WHERE email LIKE '%@vidflow.test';

-- Reset sequences
ALTER SEQUENCE events_id_seq RESTART WITH 1;
ALTER SEQUENCE packages_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE pipeline_cards_id_seq RESTART WITH 1;
ALTER SEQUENCE deliverables_id_seq RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE showcase_items_id_seq RESTART WITH 1;

-- =============================================
-- STEP 2: CREATE 5 EVENTS
-- =============================================
INSERT INTO public.events (title, event_date, location, is_active, thumbnail_url, disciplines) VALUES
  ('2026 NABBA Korea Championship', '2026-03-15', '서울 올림픽공원 체조경기장', true, 
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
   '["Bodybuilding", "Classic Physique", "Men''s Physique", "Bikini", "Figure", "Wellness"]'),
  
  ('IFBB Korea Pro Qualifier', '2026-04-20', '부산 벡스코', true,
   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
   '["Men''s Open", "Classic Physique", "Men''s Physique", "Women''s Physique", "Bikini", "Figure"]'),
  
  ('WFF Asia Grand Prix 2026', '2026-05-10', '인천 송도컨벤시아', true,
   'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800',
   '["Bodybuilding", "Athletic Physique", "Sports Model", "Bikini", "Fitness"]'),
  
  ('NPCA Korea National', '2026-06-22', '대구 EXCO', true,
   'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
   '["Natural Bodybuilding", "Classic Physique", "Men''s Physique", "Bikini", "Figure"]'),
  
  ('Muscle Mania Korea 2026', '2026-07-18', '서울 코엑스', false,
   'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
   '["Bodybuilding", "Fitness Model", "Sports Model", "Bikini Model", "Transformation"]');

-- =============================================
-- STEP 3: CREATE 3 PACKAGES PER EVENT (15 total)
-- =============================================

DO $$
DECLARE
  event_record RECORD;
BEGIN
  FOR event_record IN SELECT id FROM public.events LOOP
    -- Basic Package
    INSERT INTO public.packages (event_id, name, price, description, composition, specs, is_sold_out) VALUES
    (event_record.id, 'Basic Cut', 99000, '핵심 무대 영상만 담은 기본 패키지',
     '["본선 무대 영상", "비교심사 하이라이트"]'::jsonb,
     '{"duration": "3-5분", "resolution": "1080p Full HD", "delivery": "3일 이내"}'::jsonb,
     false);
    
    -- Premium Package
    INSERT INTO public.packages (event_id, name, price, description, composition, specs, is_sold_out) VALUES
    (event_record.id, 'Premium Edit', 199000, '풀 커버리지 + 하이라이트 편집 포함',
     '["예선 무대 영상", "본선 무대 영상", "비교심사 전체", "하이라이트 편집본", "시상식 클립"]'::jsonb,
     '{"duration": "8-12분", "resolution": "4K Ultra HD", "delivery": "5일 이내", "extras": "BGM 선택 가능"}'::jsonb,
     false);
    
    -- Ultimate Package
    INSERT INTO public.packages (event_id, name, price, description, composition, specs, is_sold_out) VALUES
    (event_record.id, 'Ultimate Collection', 299000, '최고급 풀 패키지 + SNS 숏폼 포함',
     '["예선 무대 영상", "본선 무대 영상", "비교심사 전체", "하이라이트 편집본", "시상식 클립", "원본 RAW 영상", "SNS 릴스/숏츠 3편", "프리미엄 BGM"]'::jsonb,
     '{"duration": "15분+", "resolution": "4K Ultra HD + RAW", "delivery": "7일 이내", "extras": "무제한 수정, 1년 보관"}'::jsonb,
     false);
  END LOOP;
END $$;

-- =============================================
-- STEP 4: CREATE 50 TEST USERS IN auth.users & profiles
-- =============================================

DO $$
DECLARE
  i INTEGER;
  customer_names TEXT[] := ARRAY[
    '김민수', '이영희', '박준영', '최서연', '정대현',
    '강수민', '조현우', '윤지영', '임태호', '한소희',
    '신동욱', '장미래', '오성민', '황보라', '문재현',
    '배수지', '송강호', '유아인', '권나라', '이병헌',
    '전지현', '손예진', '현빈', '공유', '이동욱',
    '박서준', '김태리', '정해인', '한효주', '이민호',
    '수지', '아이유', '박보검', '김고은', '송중기',
    '전혜진', '조정석', '유연석', '서현진', '김수현',
    '안성기', '하정우', '황정민', '설경구', '조인성',
    '이정재', '송강', '김선호', '남주혁', '차은우'
  ];
  disciplines TEXT[] := ARRAY['Bodybuilding', 'Classic Physique', 'Men''s Physique', 'Bikini', 'Figure', 'Wellness'];
  new_uuid UUID;
  user_email TEXT;
  random_event_id INTEGER;
  random_package_id INTEGER;
  random_discipline TEXT;
  random_athlete_number TEXT;
  random_stage TEXT;
  order_id_var INTEGER;
BEGIN
  FOR i IN 1..50 LOOP
    -- Generate UUID
    new_uuid := gen_random_uuid();
    user_email := 'testuser' || i || '@vidflow.test';
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      new_uuid,
      '00000000-0000-0000-0000-000000000000',
      user_email,
      crypt('testpass123!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      ('{"name": "' || customer_names[i] || '"}')::jsonb,
      NOW() - (INTERVAL '1 day' * (60 - i)),
      NOW(),
      'authenticated',
      'authenticated'
    );
    
    -- Insert into profiles
    INSERT INTO public.profiles (id, email, name, role, phone, commission_rate)
    VALUES (
      new_uuid,
      user_email,
      customer_names[i],
      'USER',
      '010-' || LPAD((1000 + i)::TEXT, 4, '0') || '-' || LPAD((5000 + i * 17)::TEXT, 4, '0'),
      0
    );
    
    -- Random event (1-5)
    random_event_id := 1 + ((i - 1) % 5);
    
    -- Random package based on event (3 packages per event)
    random_package_id := (random_event_id - 1) * 3 + 1 + ((i - 1) % 3);
    
    -- Random discipline
    random_discipline := disciplines[1 + ((i - 1) % 6)];
    
    -- Random athlete number
    random_athlete_number := '#' || (100 + i);
    
    -- Create order
    INSERT INTO public.orders (user_id, event_id, package_id, payment_id, amount, status, discipline, athlete_number, created_at)
    VALUES (
      new_uuid,
      random_event_id,
      random_package_id,
      'pay_test_' || LPAD(i::TEXT, 3, '0') || '_' || TO_CHAR(NOW(), 'YYYYMMDD'),
      CASE ((i - 1) % 3) WHEN 0 THEN 99000 WHEN 1 THEN 199000 ELSE 299000 END,
      'PAID',
      random_discipline,
      random_athlete_number,
      NOW() - (INTERVAL '1 day' * (50 - i))
    )
    RETURNING id INTO order_id_var;
    
    -- Assign stage based on customer number (distributed)
    IF i <= 10 THEN
      random_stage := 'WAITING';
    ELSIF i <= 20 THEN
      random_stage := 'SHOOTING';
    ELSIF i <= 30 THEN
      random_stage := 'EDITING';
    ELSIF i <= 40 THEN
      random_stage := 'READY';
    ELSE
      random_stage := 'DELIVERED';
    END IF;
    
    -- Create pipeline card
    INSERT INTO public.pipeline_cards (order_id, stage, stage_entered_at, updated_at)
    VALUES (
      order_id_var,
      random_stage,
      NOW() - (INTERVAL '1 day' * (50 - i)),
      NOW() - (INTERVAL '1 hour' * ((i - 1) % 24))
    );
    
  END LOOP;
END $$;

-- =============================================
-- STEP 5: CREATE SAMPLE EXPENSES
-- =============================================
INSERT INTO public.expenses (event_id, category, description, amount, expensed_at) VALUES
  (1, 'LABOR', '촬영 스태프 인건비', 500000, '2026-03-15'),
  (1, 'EQUIPMENT', '4K 카메라 렌탈', 200000, '2026-03-14'),
  (1, 'TRAVEL', '서울 출장 교통비', 80000, '2026-03-15'),
  (1, 'FOOD', '현장 식사비', 120000, '2026-03-15'),
  
  (2, 'LABOR', '촬영 스태프 인건비', 600000, '2026-04-20'),
  (2, 'TRAVEL', '부산 출장 KTX', 150000, '2026-04-19'),
  (2, 'EQUIPMENT', '짐벌 렌탈', 100000, '2026-04-20'),
  
  (3, 'LABOR', '촬영 스태프 인건비', 550000, '2026-05-10'),
  (3, 'TRAVEL', '인천 출장비', 50000, '2026-05-10'),
  
  (4, 'LABOR', '촬영 스태프 인건비', 500000, '2026-06-22'),
  (4, 'TRAVEL', '대구 출장 KTX', 180000, '2026-06-21'),
  (4, 'EQUIPMENT', '드론 렌탈', 150000, '2026-06-22'),
  
  (5, 'LABOR', '촬영 스태프 인건비', 450000, '2026-07-18'),
  (5, 'FOOD', '현장 식사비', 100000, '2026-07-18');

-- =============================================
-- STEP 6: ADD SAMPLE SHOWCASE ITEMS
-- =============================================

INSERT INTO public.showcase_items (package_id, type, media_url, thumbnail_url, is_best_cut) VALUES
  (1, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', true),
  (1, 'IMAGE', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', false),
  
  (2, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400', true),
  (2, 'IMAGE', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
   'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400', false),

  (3, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400', true),
  (3, 'IMAGE', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
   'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400', false);

-- =============================================
-- STEP 7: CREATE SAMPLE DELIVERABLES
-- =============================================

DO $$
DECLARE
  card_record RECORD;
BEGIN
  FOR card_record IN 
    SELECT pc.id as card_id, o.id as order_id
    FROM public.pipeline_cards pc
    JOIN public.orders o ON pc.order_id = o.id
    WHERE pc.stage IN ('READY', 'DELIVERED')
  LOOP
    -- Main video deliverable
    INSERT INTO public.deliverables (card_id, type, external_link_url, link_status, is_downloaded)
    VALUES (
      card_record.card_id,
      'MAIN_VIDEO',
      'https://drive.google.com/file/d/example_' || card_record.order_id,
      CASE WHEN random() > 0.2 THEN 'VALID' ELSE 'UNCHECKED' END,
      random() > 0.5
    );
    
    -- Highlight reel for some
    IF random() > 0.5 THEN
      INSERT INTO public.deliverables (card_id, type, external_link_url, link_status, is_downloaded)
      VALUES (
        card_record.card_id,
        'HIGHLIGHT',
        'https://drive.google.com/file/d/highlight_' || card_record.order_id,
        'VALID',
        random() > 0.3
      );
    END IF;
  END LOOP;
END $$;

-- =============================================
-- STEP 8: VERIFICATION QUERIES
-- =============================================

SELECT 'Events' as table_name, COUNT(*) as count FROM public.events
UNION ALL SELECT 'Packages', COUNT(*) FROM public.packages
UNION ALL SELECT 'Auth Users (test)', COUNT(*) FROM auth.users WHERE email LIKE '%@vidflow.test'
UNION ALL SELECT 'Profiles', COUNT(*) FROM public.profiles WHERE email LIKE '%@vidflow.test'
UNION ALL SELECT 'Orders', COUNT(*) FROM public.orders
UNION ALL SELECT 'Pipeline Cards', COUNT(*) FROM public.pipeline_cards
UNION ALL SELECT 'Deliverables', COUNT(*) FROM public.deliverables
UNION ALL SELECT 'Expenses', COUNT(*) FROM public.expenses;

-- Pipeline stage distribution
SELECT stage, COUNT(*) as count
FROM public.pipeline_cards
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'WAITING' THEN 1
    WHEN 'SHOOTING' THEN 2
    WHEN 'EDITING' THEN 3
    WHEN 'READY' THEN 4
    WHEN 'DELIVERED' THEN 5
  END;

-- Orders by event
SELECT e.title, COUNT(o.id) as order_count, SUM(o.amount) as total_revenue
FROM public.events e
LEFT JOIN public.orders o ON e.id = o.event_id
GROUP BY e.id, e.title
ORDER BY e.id;
