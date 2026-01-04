-- ============================================================
-- 🔧 VidFlow Manager 2.0 - Fix User Creation Error
-- ============================================================
-- 이 스크립트는 새 사용자 생성 시 발생하는 Database Error를 수정합니다.
-- 
-- 문제: 트리거 함수가 profiles 테이블에 INSERT할 때 RLS에 막힘
-- 해결: 트리거 함수에 RLS 우회 권한 부여 + INSERT 정책 추가
--
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- ============================================================

-- ============================================================
-- STEP 1: 기존 트리거/함수 삭제 (깨끗하게 재시작)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- STEP 2: profiles 테이블 RLS 정책 확인 및 수정
-- ============================================================
-- RLS가 켜져 있다면, 서비스 롤이 INSERT할 수 있도록 정책 추가

-- 기존 INSERT 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Trigger can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.profiles;

-- 새 INSERT 정책: 인증된 사용자 또는 서비스 롤이 자신의 프로필 생성 가능
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'service_role'
);

-- ============================================================
-- STEP 3: 개선된 트리거 함수 생성
-- ============================================================
-- SECURITY DEFINER: 함수 생성자(superuser)의 권한으로 실행
-- search_path: public 스키마만 사용

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, commission_rate)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'USER',
        0
    )
    ON CONFLICT (id) DO NOTHING;  -- 이미 존재하면 무시
    
    RETURN NEW;
END;
$$;

-- 함수 소유자를 postgres(superuser)로 설정
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- STEP 4: 트리거 재생성
-- ============================================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 5: 함수 권한 부여
-- ============================================================
-- postgres 역할에 실행 권한 확인
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================================
-- 완료 확인: 새 유저 생성 테스트
-- ============================================================
-- Supabase Dashboard > Authentication > Add User로 테스트하세요.
-- 또는 앱의 회원가입 페이지(/join)에서 테스트하세요.

SELECT 'Trigger and policies updated successfully!' as status;
