-- PG 수수료율 설정 추가
-- general_settings 테이블에 pg_fee_rate 삽입

INSERT INTO general_settings (key, value, description, updated_at)
VALUES (
    'pg_fee_rate',
    '0.035',
    'PG사(PortOne) 수수료율. 0.035 = 3.5%',
    NOW()
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();
