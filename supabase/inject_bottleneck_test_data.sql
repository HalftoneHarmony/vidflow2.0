-- =============================================
-- VidFlow Manager - Insert Bottleneck Test Data
-- Created: 2026-01-06
-- Purpose: Inject test data into pipeline_cards to visualize bottlenecks
-- =============================================

DO $$
DECLARE
    v_user_id UUID;
    v_event_id INTEGER;
    v_package_id INTEGER;
    v_order_id INTEGER;
    v_loop_idx INTEGER;
BEGIN
    -- 1. 사용할 사용자(관리자/직원 등) ID 가져오기
    -- profiles 테이블에서 하나 가져옵니다. (RLS 우회를 위해 postgres 롤로 실행 가정)
    SELECT id INTO v_user_id FROM public.profiles WHERE role IN ('ADMIN', 'EDITOR', 'USER') LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found in profiles table.';
        RETURN;
    END IF;

    -- 2. 이벤트와 패키지 가져오기 (없으면 생성하지 않고 종료)
    SELECT id INTO v_event_id FROM public.events WHERE is_active = true LIMIT 1;
    -- active 이벤트가 없으면 아무거나
    IF v_event_id IS NULL THEN
        SELECT id INTO v_event_id FROM public.events LIMIT 1;
    END IF;

    IF v_event_id IS NULL THEN
        RAISE NOTICE 'No events found.';
        RETURN;
    END IF;

    SELECT id INTO v_package_id FROM public.packages WHERE event_id = v_event_id LIMIT 1;
    
    IF v_package_id IS NULL THEN
        RAISE NOTICE 'No packages found for event %', v_event_id;
        RETURN;
    END IF;

    RAISE NOTICE 'Using User: %, Event: %, Package: %', v_user_id, v_event_id, v_package_id;

    -- 3. [심각한 병목] SHOOTING 단계 테스트 데이터 (5개, 오래됨)
    -- 5일 ~ 15일 전 진입 (매우 늦음)
    FOR v_loop_idx IN 1..5 LOOP
        INSERT INTO public.orders (user_id, event_id, package_id, amount, status)
        VALUES (v_user_id, v_event_id, v_package_id, 150000, 'PAID')
        RETURNING id INTO v_order_id;
        
        -- 트리거에 의해 자동으로 WAITING 카드가 생겼을 수 있으므로 업데이트하거나 삭제 후 삽입
        DELETE FROM public.pipeline_cards WHERE order_id = v_order_id;

        INSERT INTO public.pipeline_cards (order_id, stage, stage_entered_at, assignee_id)
        VALUES (
            v_order_id, 
            'SHOOTING', 
            NOW() - (v_loop_idx * INTERVAL '2 days' + INTERVAL '3 days'), 
            v_user_id
        );
    END LOOP;

    -- 4. [주의 단계] EDITING 단계 테스트 데이터 (3개, 적당함)
    -- 2일 ~ 5일 전 진입
    FOR v_loop_idx IN 1..3 LOOP
        INSERT INTO public.orders (user_id, event_id, package_id, amount, status)
        VALUES (v_user_id, v_event_id, v_package_id, 250000, 'PAID')
        RETURNING id INTO v_order_id;

        DELETE FROM public.pipeline_cards WHERE order_id = v_order_id;

        INSERT INTO public.pipeline_cards (order_id, stage, stage_entered_at, assignee_id)
        VALUES (
            v_order_id, 
            'EDITING', 
            NOW() - (v_loop_idx * INTERVAL '1 day' + INTERVAL '1 day'), 
            v_user_id
        );
    END LOOP;

    -- 5. [원활] WAITING 단계 테스트 데이터 (8개, 신규)
    -- 1시간 ~ 8시간 전 진입
    FOR v_loop_idx IN 1..8 LOOP
        INSERT INTO public.orders (user_id, event_id, package_id, amount, status)
        VALUES (v_user_id, v_event_id, v_package_id, 100000, 'PAID')
        RETURNING id INTO v_order_id;

        DELETE FROM public.pipeline_cards WHERE order_id = v_order_id;

        INSERT INTO public.pipeline_cards (order_id, stage, stage_entered_at, assignee_id)
        VALUES (
            v_order_id, 
            'WAITING', 
            NOW() - (v_loop_idx * INTERVAL '1 hour'), 
            NULL
        );
    END LOOP;

     -- 6. [완료] READY 단계 테스트 데이터 (4개)
    FOR v_loop_idx IN 1..4 LOOP
        INSERT INTO public.orders (user_id, event_id, package_id, amount, status)
        VALUES (v_user_id, v_event_id, v_package_id, 100000, 'PAID')
        RETURNING id INTO v_order_id;

        DELETE FROM public.pipeline_cards WHERE order_id = v_order_id;

        INSERT INTO public.pipeline_cards (order_id, stage, stage_entered_at, assignee_id)
        VALUES (
            v_order_id, 
            'READY', 
            NOW() - (v_loop_idx * INTERVAL '4 hour'), 
            v_user_id
        );
    END LOOP;

    RAISE NOTICE 'Successfully injected bottleneck test data.';

END $$;
