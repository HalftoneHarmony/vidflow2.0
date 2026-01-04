-- ============================================================
-- 🔑 VidFlow Manager 2.0 - Password Reset Script
-- ============================================================
-- 이 스크립트는 특정 사용자의 비밀번호를 강제로 재설정합니다.
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- ============================================================

-- test@test.com 계정의 비밀번호를 'vidflow1234'로 변경
UPDATE auth.users
SET encrypted_password = crypt('vidflow1234', gen_salt('bf'))
WHERE email = 'test@test.com';

-- 변경 확인용 쿼리
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'test@test.com';
