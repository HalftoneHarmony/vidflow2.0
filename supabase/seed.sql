-- =============================================
-- VidFlow Manager 2.0 - Seed Data
-- =============================================

-- 1. Clean up existing data (Optional: for testing reset)
-- RLS 정책 등으로 인해 삭제가 막힐 수 있으므로 필요시 주석 해제하여 사용
-- TRUNCATE public.packages, public.events, public.profiles CASCADE;

-- 2. EVENTS (대회 정보)
INSERT INTO public.events (id, title, event_date, location, is_active, thumbnail_url)
VALUES 
  (1, '2026 NPCA Seoul', '2026-04-15', 'Seoul Olympic Park', true, 'https://placehold.co/600x400/000000/FFFFFF?text=NPCA+Seoul'),
  (2, '2025 NPCA Busan', '2025-11-20', 'Busan BEXCO', false, 'https://placehold.co/600x400/000000/FFFFFF?text=NPCA+Busan')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, is_active = EXCLUDED.is_active;

-- 3. PACKAGES (패키지 상품)
INSERT INTO public.packages (event_id, name, price, description, composition, is_sold_out)
VALUES
  -- 2026 NPCA Seoul Packages
  (1, 'Basic Cut', 150000, '무대 사진 10장 + 영상 1분', '["PHOTO_ZIP", "SHORTS"]'::jsonb, false),
  (1, 'Pro Stage', 350000, '무대 영상 원본(4K) + 편집본 3분 + 사진 30장', '["MAIN_VIDEO", "EDITED_VIDEO", "PHOTO_ZIP"]'::jsonb, false),
  (1, 'All-in-One', 500000, '모든 영상/사진 포함 + 백스테이지 촬영', '["MAIN_VIDEO", "EDITED_VIDEO", "SHORTS", "PHOTO_ZIP", "BACKSTAGE"]'::jsonb, false),
  
  -- 2025 NPCA Busan Packages (Ended)
  (2, 'Standard', 200000, '기본 패키지', '["MAIN_VIDEO"]'::jsonb, true);

-- 4. PROFILES (Dummy Users for Testing)
-- 실제 로그인을 위해서는 Supabase Auth에서 회원가입이 필요합니다.
-- 여기서는 데이터 관계 테스트를 위해 auth.users에 "존재한다고 가정"하거나, 
-- 이미 존재하는 사용자의 이메일을 기반으로 역할을 업데이트하는 쿼리를 제공합니다.

-- 예시: 특정 이메일을 가진 유저를 관리자로 승격 (실제 실행 시 주석 해제 후 이메일 수정)
/*
UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'admin@vidflow.com';

UPDATE public.profiles
SET role = 'EDITOR'
WHERE email = 'editor@vidflow.com';
*/
