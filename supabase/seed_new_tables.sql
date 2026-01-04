-- ============================================
-- VidFlow 신규 테이블 테스트 데이터
-- Supabase SQL Editor에서 실행하세요
-- ============================================
-- 작성: Agent 4 (Backend/Integration Master)
-- 날짜: 2026-01-05
-- ============================================

-- 1. 공지사항 테스트 데이터
INSERT INTO announcements (title, content, type, target_audience, is_pinned, is_active, starts_at, expires_at)
VALUES
    (
        '🎉 VidFlow Manager 신규 기능 출시',
        '안녕하세요! VidFlow 팀입니다.\n\n새로운 Analytics 대시보드와 파이프라인 개선 기능이 출시되었습니다.\n\n주요 변경사항:\n• 실시간 매출 추이 차트\n• 고객 세그먼트 분석\n• 파이프라인 병목 분석\n\n많은 이용 부탁드립니다!',
        'info',
        'all',
        true,
        true,
        NOW(),
        NOW() + INTERVAL '30 days'
    ),
    (
        '⚡ 시스템 점검 안내 (1/10)',
        '2026년 1월 10일 02:00 ~ 06:00 (한국시간) 서버 점검이 예정되어 있습니다.\n\n점검 내용:\n• 데이터베이스 최적화\n• 보안 업데이트\n• 성능 개선\n\n점검 시간 동안 서비스 이용이 제한될 수 있습니다.',
        'maintenance',
        'all',
        true,
        true,
        NOW(),
        '2026-01-10 06:00:00+09'
    ),
    (
        '🏆 신년 촬영 프로모션',
        '2026년 신년을 맞아 특별 할인 프로모션을 진행합니다!\n\n• 모든 패키지 10% 할인\n• 3팀 이상 단체 예약 시 추가 5% 할인\n• 기간: 1월 1일 ~ 1월 31일\n\n프로모션 코드: NEWYEAR2026',
        'promotion',
        'users',
        false,
        true,
        '2026-01-01 00:00:00+09',
        '2026-01-31 23:59:59+09'
    ),
    (
        '⚠️ 결제 시스템 일시 장애 안내',
        '현재 일부 결제 수단에서 간헐적인 오류가 발생하고 있습니다.\n카카오페이 결제 시 문제가 발생하면 신용카드 결제를 이용해 주세요.\n\n빠른 시일 내 정상화될 예정입니다. 불편을 드려 죄송합니다.',
        'warning',
        'all',
        false,
        true,
        NOW(),
        NOW() + INTERVAL '7 days'
    )
ON CONFLICT DO NOTHING;

-- 2. 문의 테스트 데이터
INSERT INTO contact_submissions (name, email, subject, message, category, status, admin_notes)
VALUES
    (
        '김철수',
        'chulsoo.kim@example.com',
        '영상 편집 진행 상황 문의',
        '안녕하세요, 지난 주 NPCA Seoul 대회에서 촬영하셨던 Pro Stage 패키지 주문했습니다.\n\n현재 편집 진행 상황이 어떻게 되는지 궁금합니다. 언제쯤 영상을 받아볼 수 있을까요?\n\n주문번호: ORD-2026-0123\n\n감사합니다.',
        'support',
        'in_progress',
        '편집 70% 완료, 1/8 예상 납품 예정 - 담당: 김편집'
    ),
    (
        '박영희',
        'younghee.park@example.com',
        '환불 요청 관련',
        '안녕하세요.\n\n촬영 당일 개인 사정으로 대회에 불참하게 되었습니다.\n환불 절차가 어떻게 되는지 알려주세요.\n\n주문번호: ORD-2026-0087\n\n정말 죄송합니다.',
        'complaint',
        'pending',
        NULL
    ),
    (
        '이민수',
        'minsoo.lee@example.com',
        '추가 영상 요청',
        '기본 패키지로 주문했는데, 백스테이지 영상도 추가로 구매할 수 있을까요?\n가능하다면 가격도 알려주세요!',
        'support',
        'resolved',
        '업그레이드 안내 완료, Pro Stage로 차액 결제 진행됨'
    ),
    (
        '최지현',
        'jihyun.choi@example.com',
        '영상 품질 관련 문의',
        '받은 영상의 해상도가 4K가 맞나요?\n제 컴퓨터에서 재생하면 1080p로 보이는데 확인 부탁드립니다.',
        'feedback',
        'resolved',
        '4K 원본 파일 재전송 완료, 고객 확인 완료'
    ),
    (
        '정우성',
        'woosung.jung@example.com',
        '대회 촬영 예약 문의',
        '2026 Spring Physique Classic 대회에서 촬영 예약하고 싶습니다.\n\nUltimate Pack 패키지로 진행하고 싶은데, 아직 결제 페이지가 안 열린 것 같아서 문의드립니다.\n\n미리 예약 가능할까요?',
        'general',
        'pending',
        NULL
    )
ON CONFLICT DO NOTHING;

-- 3. 활동 로그 테스트 데이터
-- 시스템 로그 (user_id가 NULL인 경우)
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_value, new_value, created_at)
VALUES
    (
        NULL,
        'SYSTEM_STARTUP',
        'system',
        NULL,
        NULL,
        '{"version": "2.0.0", "environment": "production"}'::jsonb,
        NOW() - INTERVAL '2 hours'
    ),
    (
        NULL,
        'AUTO_BACKUP_COMPLETED',
        'system',
        NULL,
        NULL,
        '{"backup_size": "2.4GB", "duration_seconds": 45}'::jsonb,
        NOW() - INTERVAL '6 hours'
    );

-- 실제 사용자 활동 로그 (profiles 테이블의 첫 번째 관리자 사용)
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_value, new_value, created_at)
SELECT 
    p.id,
    log.action,
    log.entity_type,
    log.entity_id,
    log.old_value::jsonb,
    log.new_value::jsonb,
    log.created_at
FROM (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1) p
CROSS JOIN (
    VALUES
        ('ORDER_CREATED', 'order', 'ORD-2026-0150', NULL, '{"event": "NPCA Seoul", "package": "Pro Stage", "amount": 280000}', NOW() - INTERVAL '30 minutes'),
        ('STATUS_CHANGED', 'pipeline_task', 'TASK-001', '{"status": "EDITING"}', '{"status": "READY"}', NOW() - INTERVAL '1 hour'),
        ('EVENT_UPDATED', 'event', '1', '{"location": "서울 올림픽공원"}', '{"location": "서울 올림픽공원 체조경기장"}', NOW() - INTERVAL '3 hours'),
        ('EXPENSE_ADDED', 'expense', 'EXP-123', NULL, '{"category": "EQUIPMENT", "amount": 150000}', NOW() - INTERVAL '5 hours'),
        ('USER_LOGIN', 'auth', NULL, NULL, '{"ip": "192.168.1.100"}', NOW() - INTERVAL '8 hours')
) AS log(action, entity_type, entity_id, old_value, new_value, created_at)
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'ADMIN');

-- 4. 사용자 설정 테스트 데이터 (관리자용 기본 설정)
INSERT INTO user_preferences (user_id, email_notifications, sms_notifications, language, timezone, theme)
SELECT 
    id,
    true,
    false,
    'ko',
    'Asia/Seoul',
    'dark'
FROM profiles
WHERE role IN ('ADMIN', 'EDITOR')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 실행 확인
-- ============================================
SELECT 'Announcements:', count(*) FROM announcements;
SELECT 'Contact Submissions:', count(*) FROM contact_submissions;
SELECT 'Activity Logs:', count(*) FROM activity_logs;
SELECT 'User Preferences:', count(*) FROM user_preferences;

-- 상세 확인
SELECT '--- Active Announcements ---' AS info;
SELECT id, title, type, is_pinned FROM announcements WHERE is_active = true ORDER BY is_pinned DESC, created_at DESC;

SELECT '--- Pending Contacts ---' AS info;
SELECT id, name, category, status FROM contact_submissions WHERE status = 'pending';

SELECT '--- Recent Activity Logs ---' AS info;
SELECT id, action, entity_type, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 5;
