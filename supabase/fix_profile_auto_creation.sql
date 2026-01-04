-- ============================================================
-- 🔧 VidFlow Manager 2.0 - Profile Auto-Creation Fix
-- ============================================================
-- 이 스크립트는 회원가입 시 profiles 테이블에 자동으로 레코드를
-- 생성하는 트리거를 설정합니다.
-- 
-- Supabase Dashboard > SQL Editor 에서 실행하세요.
-- ============================================================

-- ============================================================
-- STEP 1: 기존 누락된 사용자 복구
-- ============================================================
-- auth.users에는 있지만 profiles에 없는 유저들을 자동 생성

INSERT INTO public.profiles (id, email, name, role, commission_rate)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'USER',
    0
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================================
-- STEP 2: 자동 생성 트리거 함수 정의
-- ============================================================
-- 새 유저가 auth.users에 추가될 때 자동으로 profiles 레코드 생성

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, commission_rate)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'USER',
        0
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- 이미 존재하는 경우 무시 (중복 방지)
        RETURN NEW;
END;
$$;

-- ============================================================
-- STEP 3: 트리거 생성
-- ============================================================
-- 기존 트리거가 있으면 삭제 후 재생성

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 4: 첫 번째 관리자 계정 설정
-- ============================================================
-- 기존에 가입한 사용자 중 하나를 ADMIN으로 승격
-- (이메일 주소를 실제 관리자 이메일로 변경하세요)

UPDATE public.profiles
SET role = 'ADMIN'
WHERE email = 'rlarigus221@gmail.com';

-- ============================================================
-- 완료 확인
-- ============================================================
-- 아래 쿼리로 profiles 테이블 확인:
-- SELECT * FROM profiles;

