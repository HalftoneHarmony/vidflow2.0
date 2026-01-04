-- =============================================
-- VidFlow Manager 2.0 - Security & Integrity Reinforcement
-- Author: Agent 2 (Vulcan - The Forge Master)
-- =============================================

-- [Task 1] 무결성 방화벽 트리거 (Deliveries Check)
-- =============================================

-- 상태가 'DELIVERED'로 바뀔 때 산출물 링크를 검증하는 함수
CREATE OR REPLACE FUNCTION check_deliverables_before_delivery()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 'DELIVERED'로 변경되는 경우에만 실행
    IF NEW.stage = 'DELIVERED' THEN
        -- 연결된 deliverables 중 external_link_url이 NULL이거나 빈 값인 것이 있는지 확인
        IF EXISTS (
            SELECT 1 FROM public.deliverables 
            WHERE card_id = NEW.id AND (external_link_url IS NULL OR external_link_url = '')
        ) THEN
            RAISE EXCEPTION '모든 산출물에 유효한 링크가 등록되어야 배송 완료 처리할 수 있습니다. (Card ID: %)', NEW.id;
        END IF;

        -- 만약 deliverables가 아예 없는 경우도 누락으로 간주
        IF NOT EXISTS (
            SELECT 1 FROM public.deliverables WHERE card_id = NEW.id
        ) THEN
            RAISE EXCEPTION '등록된 산출물이 없습니다. 산출물을 먼저 등록해주세요. (Card ID: %)', NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결
DROP TRIGGER IF EXISTS trigger_check_deliverables ON public.pipeline_cards;
CREATE TRIGGER trigger_check_deliverables
    BEFORE UPDATE ON public.pipeline_cards
    FOR EACH ROW
    EXECUTE FUNCTION check_deliverables_before_delivery();


-- [Task 2] Admin 전용 RLS 강화 및 재무 보안
-- =============================================

-- 기존 정책 삭제 후 재설정 (충돌 방지)
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Staff can view expenses" ON public.expenses;

-- 1. EXPENSES: 오직 ADMIN만 조회 및 관리 가능 (결정적 보안)
-- 일반 유저와 에디터는 이 테이블의 존재 유무조차 쿼리로 알 수 없게 합니다.
CREATE POLICY "Strict Admin Only Expenses" ON public.expenses
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 2. PROFILES: 민감한 컬럼 보호
-- Supabase RLS는 컬럼 단위 보안보다 로우 단위 보안이 강력하므로, 
-- '나의 프로필' 혹은 '관리자의 전체 조회' 정책을 다시 한번 공고히 합니다.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 본인 프로필 조회 (본인의 commission_rate는 본인만 확인 가능)
CREATE POLICY "Users view own identity" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- 관리자의 전지적 조회/업데이트 권한
CREATE POLICY "Admins full control profiles" ON public.profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 3. COMMISSION_RATE 접근 제한 (서버 액션/함수 레벨 권장)
-- 주석: commission_rate 컬럼 자체를 비관리자에게 SELECT에서 제외하고 싶다면 
-- 일반적으로 DB VIEW를 만들어 보안을 적용하지만, 
-- 현재 RLS 정책하에서는 타인의 로우를 볼 수 없으므로 '타인의 정산 정보 조회'는 원천 차단됩니다.

COMMIT;
