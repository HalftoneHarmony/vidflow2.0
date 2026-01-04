-- =============================================
-- VidFlow Manager 2.0 - RLS Policies (Security)
-- =============================================

-- 기존 정책 충돌 방지를 위해 먼저 삭제 (초기화용)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view packages" ON public.packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON public.packages;

-- 0. HELPER FUNCTIONS (To avoid Recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
-- 사용자는 자신의 프로필만 볼 수 있음
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 관리자는 모든 프로필을 보고 수정할 수 있음 (함수 사용)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.check_is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.check_is_admin());

-- 2. EVENTS (Public Area)
-- (public) 누구나 '활성' 상태의 대회를 조회 가능
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true OR public.check_is_admin());

-- 관리자만 대회를 생성/수정/삭제 가능
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (public.check_is_admin());

-- 3. PACKAGES (Public Area)
-- (public) 누구나 패키지 정보를 조회 가능
CREATE POLICY "Anyone can view packages" ON public.packages
  FOR SELECT USING (true);

-- 관리자만 패키지 관리 가능
CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL USING (public.check_is_admin());

-- 4. SHOWCASE ITEMS
-- (public) 누구나 쇼케이스 조회 가능
CREATE POLICY "Anyone can view showcase items" ON public.showcase_items
  FOR SELECT USING (true);

-- 관리자만 쇼케이스 아이템 관리 (CUD) 가능
CREATE POLICY "Admins can manage showcase items" ON public.showcase_items
  FOR ALL 
  TO authenticated
  USING (public.check_is_admin());

-- 5. ORDERS (Private)
-- 본인의 주문만 조회 가능
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 모든 주문 관리 가능
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- 6. PIPELINE & DELIVERABLES (Internal)
-- 관리자와 에디터만 접근 가능
CREATE POLICY "Staff can view pipeline" ON public.pipeline_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
  );

CREATE POLICY "Staff can manage pipeline" ON public.pipeline_cards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
  );

-- Deliverables 접근 권한 (Staff + 본인 확인용)
CREATE POLICY "Users can download own deliverables" ON public.deliverables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_cards pc
      JOIN public.orders o ON pc.order_id = o.id
      WHERE pc.id = deliverables.card_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage deliverables" ON public.deliverables
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
  );
