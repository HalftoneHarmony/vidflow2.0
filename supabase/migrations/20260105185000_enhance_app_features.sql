-- =============================================
-- VidFlow Manager 2.0 - Enhanced App Features
-- Created by: Antigravity Agent
-- Date: 2026-01-05
-- Purpose: DB 통합 및 앱 개선을 위한 테이블/함수 추가
-- =============================================

-- =============================================
-- 1. FAQs 테이블 - 자주 묻는 질문 관리
-- =============================================
CREATE TABLE IF NOT EXISTS public.faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'payment', 'delivery', 'account', 'technical')),
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs" ON public.faqs
    FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage FAQs" ON public.faqs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- =============================================
-- 2. LEGAL_DOCUMENTS 테이블 - Privacy, Terms 관리
-- =============================================
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('privacy', 'terms', 'cookie', 'refund')),
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- HTML or Markdown content
    version TEXT DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active legal documents" ON public.legal_documents
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage legal documents" ON public.legal_documents
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- =============================================
-- 3. CONTACT_SUBMISSIONS 테이블 - 문의 접수
-- =============================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'support', 'partnership', 'complaint', 'feedback')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    user_id UUID REFERENCES public.profiles(id), -- Optional: linked user
    admin_notes TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.contact_submissions
    FOR SELECT USING (
        (user_id IS NOT NULL AND auth.uid() = user_id) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Anyone can insert (for contact form)
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Admins can manage all
CREATE POLICY "Admins can manage submissions" ON public.contact_submissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- =============================================
-- 4. ANNOUNCEMENTS 테이블 - 공지사항/알림
-- =============================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'promotion', 'maintenance', 'urgent')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'users', 'admins', 'editors')),
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements" ON public.announcements
    FOR SELECT USING (
        is_active = true AND 
        starts_at <= NOW() AND 
        (expires_at IS NULL OR expires_at > NOW())
    );

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- =============================================
-- 5. ACTIVITY_LOGS 테이블 - 감사 추적
-- =============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- e.g., 'order.created', 'pipeline.stage_changed'
    entity_type TEXT, -- e.g., 'order', 'event', 'package'
    entity_id TEXT, -- The ID of the affected entity
    old_value JSONB,
    new_value JSONB,
    metadata JSONB, -- Additional context
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Staff can insert logs (triggered by application)
CREATE POLICY "Staff can insert logs" ON public.activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
    );

-- =============================================
-- 6. USER_PREFERENCES 테이블 - 사용자 설정
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'ko',
    timezone TEXT DEFAULT 'Asia/Seoul',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences" ON public.user_preferences
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- =============================================
-- 7. USEFUL VIEWS - 비즈니스 인텔리전스
-- =============================================

-- View: Order Summary with Package & Event Info
CREATE OR REPLACE VIEW public.v_order_summary AS
SELECT 
    o.id AS order_id,
    o.user_id,
    p_user.name AS user_name,
    p_user.email AS user_email,
    e.id AS event_id,
    e.title AS event_title,
    e.event_date,
    pkg.id AS package_id,
    pkg.name AS package_name,
    pkg.price AS package_price,
    o.amount,
    o.status AS order_status,
    pc.stage AS pipeline_stage,
    pc.assignee_id,
    p_worker.name AS worker_name,
    o.created_at AS order_date
FROM public.orders o
LEFT JOIN public.events e ON o.event_id = e.id
LEFT JOIN public.packages pkg ON o.package_id = pkg.id
LEFT JOIN public.profiles p_user ON o.user_id = p_user.id
LEFT JOIN public.pipeline_cards pc ON pc.order_id = o.id
LEFT JOIN public.profiles p_worker ON pc.assignee_id = p_worker.id;

-- View: Event Revenue Summary
CREATE OR REPLACE VIEW public.v_event_revenue AS
SELECT 
    e.id AS event_id,
    e.title AS event_title,
    e.event_date,
    e.location,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.amount), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) AS paid_revenue,
    COALESCE(SUM(CASE WHEN o.status = 'REFUNDED' THEN o.amount ELSE 0 END), 0) AS refunded_amount,
    COALESCE((SELECT SUM(amount) FROM public.expenses exp WHERE exp.event_id = e.id), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN o.amount ELSE 0 END), 0) - 
        COALESCE((SELECT SUM(amount) FROM public.expenses exp WHERE exp.event_id = e.id), 0) AS net_profit
FROM public.events e
LEFT JOIN public.orders o ON o.event_id = e.id
GROUP BY e.id, e.title, e.event_date, e.location;

-- View: Package Performance
CREATE OR REPLACE VIEW public.v_package_performance AS
SELECT 
    pkg.id AS package_id,
    pkg.name AS package_name,
    pkg.price,
    e.id AS event_id,
    e.title AS event_title,
    COUNT(o.id) AS times_sold,
    COALESCE(SUM(o.amount), 0) AS total_revenue,
    pkg.is_sold_out
FROM public.packages pkg
LEFT JOIN public.events e ON pkg.event_id = e.id
LEFT JOIN public.orders o ON o.package_id = pkg.id AND o.status = 'PAID'
GROUP BY pkg.id, pkg.name, pkg.price, e.id, e.title, pkg.is_sold_out;

-- View: Pipeline Status Overview
CREATE OR REPLACE VIEW public.v_pipeline_overview AS
SELECT 
    pc.stage,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.pipeline_cards), 0), 1) AS percentage
FROM public.pipeline_cards pc
GROUP BY pc.stage
ORDER BY 
    CASE pc.stage 
        WHEN 'WAITING' THEN 1
        WHEN 'SHOOTING' THEN 2
        WHEN 'EDITING' THEN 3
        WHEN 'READY' THEN 4
        WHEN 'DELIVERED' THEN 5
    END;

-- View: Worker Performance
CREATE OR REPLACE VIEW public.v_worker_performance AS
SELECT 
    p.id AS worker_id,
    p.name AS worker_name,
    p.role,
    p.commission_rate,
    COUNT(pc.id) AS assigned_cards,
    COUNT(CASE WHEN pc.stage = 'DELIVERED' THEN 1 END) AS completed_cards,
    ROUND(AVG(
        CASE WHEN pc.stage = 'DELIVERED' 
        THEN EXTRACT(EPOCH FROM (pc.updated_at - pc.stage_entered_at)) / 3600 
        END
    )::numeric, 1) AS avg_completion_hours
FROM public.profiles p
LEFT JOIN public.pipeline_cards pc ON pc.assignee_id = p.id
WHERE p.role IN ('ADMIN', 'EDITOR')
GROUP BY p.id, p.name, p.role, p.commission_rate;

-- =============================================
-- 8. USEFUL FUNCTIONS - 비즈니스 로직
-- =============================================

-- Function: Get Dashboard Stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_revenue', COALESCE((SELECT SUM(amount) FROM public.orders WHERE status = 'PAID'), 0),
        'total_orders', (SELECT COUNT(*) FROM public.orders),
        'active_events', (SELECT COUNT(*) FROM public.events WHERE is_active = true),
        'total_users', (SELECT COUNT(*) FROM public.profiles WHERE role = 'USER'),
        'pipeline_counts', (
            SELECT json_object_agg(stage, cnt)
            FROM (SELECT stage, COUNT(*) as cnt FROM public.pipeline_cards GROUP BY stage) sub
        ),
        'pending_deliveries', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage = 'READY'),
        'unassigned_tasks', (SELECT COUNT(*) FROM public.pipeline_cards WHERE stage IN ('SHOOTING', 'EDITING') AND assignee_id IS NULL)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log Activity
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id TEXT DEFAULT NULL,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, old_value, new_value, metadata)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_value, p_new_value, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Monthly Revenue
CREATE OR REPLACE FUNCTION public.get_monthly_revenue(p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER)
RETURNS TABLE (
    month INTEGER,
    revenue BIGINT,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(MONTH FROM o.created_at)::INTEGER AS month,
        COALESCE(SUM(o.amount), 0)::BIGINT AS revenue,
        COUNT(*)::BIGINT AS order_count
    FROM public.orders o
    WHERE 
        EXTRACT(YEAR FROM o.created_at) = p_year
        AND o.status = 'PAID'
    GROUP BY EXTRACT(MONTH FROM o.created_at)
    ORDER BY month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Top Packages
CREATE OR REPLACE FUNCTION public.get_top_packages(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    package_id INTEGER,
    package_name TEXT,
    event_title TEXT,
    times_sold BIGINT,
    total_revenue BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pkg.id::INTEGER,
        pkg.name::TEXT,
        e.title::TEXT,
        COUNT(o.id)::BIGINT,
        COALESCE(SUM(o.amount), 0)::BIGINT
    FROM public.packages pkg
    LEFT JOIN public.events e ON pkg.event_id = e.id
    LEFT JOIN public.orders o ON o.package_id = pkg.id AND o.status = 'PAID'
    GROUP BY pkg.id, pkg.name, e.title
    ORDER BY COUNT(o.id) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. INITIAL DATA - 초기 데이터 삽입
-- =============================================

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
('계정은 어떻게 만드나요?', '우측 상단의 "Sign Up" 버튼을 클릭하고 이름, 이메일, 비밀번호를 입력해주세요. 가입 확인 이메일이 발송됩니다.', 'account', 1),
('영상을 다운로드할 수 있나요?', '네, 패키지 구매 후 마이페이지에서 직접 다운로드 받으실 수 있습니다.', 'delivery', 2),
('어떤 결제 수단을 사용할 수 있나요?', '신용카드(Visa, Mastercard, Amex)와 계좌이체를 지원합니다.', 'payment', 3),
('고객 지원은 어떻게 받나요?', 'support@vidflow.com으로 이메일을 보내시거나 문의하기 양식을 이용해주세요.', 'general', 4),
('환불 정책은 어떻게 되나요?', '영상 전달 전에는 전액 환불이 가능합니다. 전달 후에는 영상 품질 문제의 경우에만 환불 검토가 가능합니다.', 'payment', 5)
ON CONFLICT DO NOTHING;

-- Insert default Legal Documents
INSERT INTO public.legal_documents (type, title, content) VALUES
('privacy', '개인정보 처리방침', E'## 1. 수집하는 개인정보\n\n당사는 서비스 제공을 위해 다음 정보를 수집합니다:\n- 이름, 이메일 주소, 연락처\n- 결제 정보\n- 서비스 이용 기록\n\n## 2. 개인정보의 이용\n\n수집된 정보는 다음 목적으로 사용됩니다:\n- 서비스 제공 및 운영\n- 고객 지원\n- 서비스 개선\n\n## 3. 정보 보안\n\n당사는 개인정보 보호를 위해 적절한 보안 조치를 시행합니다.'),
('terms', '이용약관', E'## 1. 약관의 동의\n\nVidFlow 서비스 이용 시 본 약관에 동의하는 것으로 간주됩니다.\n\n## 2. 이용자의 의무\n\n이용자는 계정 정보의 보안을 유지할 책임이 있으며, 계정 하에서 발생하는 모든 활동에 대해 책임을 집니다.\n\n## 3. 지적재산권\n\nVidFlow에서 제공되는 모든 콘텐츠와 자료는 VidFlow 또는 라이선서의 재산이며, 저작권법으로 보호됩니다.'),
('refund', '환불 정책', E'## 환불 정책\n\n### 영상 전달 전\n전액 환불 가능\n\n### 영상 전달 후\n영상 품질 문제가 있는 경우에만 검토 후 환불 가능')
ON CONFLICT DO NOTHING;

-- Insert Homepage Settings
INSERT INTO public.general_settings (key, value, description) VALUES
('home_hero_title', 'VidFlow Manager', '홈페이지 히어로 섹션 타이틀'),
('home_hero_subtitle', '보디빌딩 대회 영상 프로덕션의 전 과정을 관통하는 통합 비즈니스 엔진', '홈페이지 히어로 섹션 서브타이틀'),
('home_cta_text', '지금 시작하기', '홈페이지 CTA 버튼 텍스트'),
('support_email', 'support@vidflow.com', '고객지원 이메일'),
('support_phone', '02-1234-5678', '고객지원 전화번호')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 10. INDEXES - 성능 최적화
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pipeline_cards_stage ON public.pipeline_cards(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_cards_assignee ON public.pipeline_cards(assignee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON public.expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active, starts_at, expires_at);

-- =============================================
-- ✅ MIGRATION COMPLETE
-- =============================================
