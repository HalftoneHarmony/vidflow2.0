-- 1. Recursion을 방지하기 위한 보안 정의 함수 생성
-- SECURITY DEFINER를 사용하여 RLS를 우회하고 안전하게 권한을 체크합니다.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Profiles 테이블의 재귀 정책 수정
-- 기존에 자기 참조가 발생하던 정책들을 제거하고 새 함수를 사용합니다.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins full control profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users view own identity" ON public.profiles;

-- 본인 확인 (재귀 없음)
CREATE POLICY "Users view own identity" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- 관리자 전체 제어 (함수 사용으로 재귀 회피)
CREATE POLICY "Admins full control profiles" ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.check_is_admin());

-- 3. 다른 테이블의 정책들도 함수를 사용하여 효율화 (recursion 가능성 차단)

-- public.events
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true OR public.check_is_admin());

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (public.check_is_admin());

-- public.expenses
DROP POLICY IF EXISTS "Strict Admin Only Expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
CREATE POLICY "Strict Admin Only Expenses" ON public.expenses
    FOR ALL 
    TO authenticated
    USING (public.check_is_admin());

-- public.pipeline_cards
DROP POLICY IF EXISTS "Staff can view pipeline" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Staff can view pipeline cards" ON public.pipeline_cards;
CREATE POLICY "Staff can view pipeline cards" ON public.pipeline_cards
  FOR SELECT USING (public.check_is_staff());

DROP POLICY IF EXISTS "Staff can manage pipeline" ON public.pipeline_cards;
DROP POLICY IF EXISTS "Staff can manage pipeline cards" ON public.pipeline_cards;
CREATE POLICY "Staff can manage pipeline cards" ON public.pipeline_cards
  FOR ALL USING (public.check_is_staff());

-- public.deliverables
DROP POLICY IF EXISTS "Staff can manage deliverables" ON public.deliverables;
CREATE POLICY "Staff can manage deliverables" ON public.deliverables
  FOR ALL USING (public.check_is_staff());

-- public.orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.check_is_admin());

-- 4. 확인용 쿼리 (아무 결과나 나오면 성공)
SELECT count(*) FROM public.profiles;
