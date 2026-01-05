-- =============================================
-- 🏗️ Pipeline Stages 테이블 생성
-- 파이프라인 단계를 DB에서 관리하도록 변경
-- =============================================

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,        -- 'WAITING', 'EDITING' 등 코드
    title VARCHAR(100) NOT NULL,              -- 화면에 표시될 이름
    color VARCHAR(50) DEFAULT 'zinc',         -- 색상 코드 (tailwind 색상명)
    sort_order INTEGER NOT NULL DEFAULT 0,    -- 정렬 순서
    is_active BOOLEAN DEFAULT true,           -- 활성화 여부
    is_terminal BOOLEAN DEFAULT false,        -- 최종 단계 여부 (DELIVERED 등)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_sort ON pipeline_stages(sort_order);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_active ON pipeline_stages(is_active);

-- 3. 초기 데이터 삽입 (현재 사용 중인 4단계)
INSERT INTO pipeline_stages (code, title, color, sort_order, is_active, is_terminal)
VALUES 
    ('WAITING', 'Waiting', 'zinc', 1, true, false),
    ('EDITING', 'Editing', 'blue', 2, true, false),
    ('READY', 'Ready', 'emerald', 3, true, false),
    ('DELIVERED', 'Delivered', 'green', 4, true, true)
ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    color = EXCLUDED.color,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    is_terminal = EXCLUDED.is_terminal,
    updated_at = NOW();

-- 4. RLS 정책 설정 (읽기는 모두 허용, 수정은 ADMIN만)
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 읽을 수 있음
CREATE POLICY "pipeline_stages_read_all" ON pipeline_stages
    FOR SELECT TO authenticated
    USING (true);

-- ADMIN만 수정 가능
CREATE POLICY "pipeline_stages_admin_modify" ON pipeline_stages
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- 5. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_pipeline_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pipeline_stages_updated_at ON pipeline_stages;
CREATE TRIGGER trigger_pipeline_stages_updated_at
    BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_pipeline_stages_updated_at();

-- 완료 메시지
SELECT 'Pipeline Stages 테이블 생성 완료! 🎉' as result;
