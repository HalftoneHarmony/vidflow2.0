-- =============================================
-- VidFlow: Add Sample Disciplines to Events
-- =============================================

-- 모든 이벤트에 기본 종목 데이터 추가
-- 보디빌딩 대회에서 일반적인 종목들을 추가합니다

-- 이벤트 ID 1 (NPCA Seoul 등) - 일반적인 보디빌딩 대회 종목
UPDATE public.events 
SET disciplines = '["Bodybuilding", "Classic Physique", "Men''s Physique", "Bikini", "Figure", "Wellness"]'::jsonb
WHERE id = 1;

-- 이벤트 ID 2 이상 - 동일한 종목 적용 (모든 활성 이벤트에)
UPDATE public.events 
SET disciplines = '["Bodybuilding", "Classic Physique", "Men''s Physique", "Bikini", "Figure", "Wellness"]'::jsonb
WHERE disciplines IS NULL OR disciplines = '[]'::jsonb;

-- 결과 확인
SELECT id, title, disciplines FROM public.events;
