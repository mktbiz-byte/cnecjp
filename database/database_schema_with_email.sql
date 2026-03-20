-- CNEC 캠페인 플랫폼 데이터베이스 스키마 (이메일 시스템 포함)

-- 기존 테이블들...
-- (user_profiles, campaigns, applications, points, withdrawals 등)

-- 이메일 로그 테이블
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    data JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 스케줄 테이블
CREATE TABLE email_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 템플릿 설정 테이블
CREATE TABLE email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_type VARCHAR(100) UNIQUE NOT NULL,
    subject_template VARCHAR(500) NOT NULL,
    html_template TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 구독 설정 테이블
CREATE TABLE email_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_type VARCHAR(100) NOT NULL,
    is_subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email_type)
);

-- 인덱스 생성
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX idx_email_schedules_campaign_id ON email_schedules(campaign_id);
CREATE INDEX idx_email_schedules_scheduled_at ON email_schedules(scheduled_at);
CREATE INDEX idx_email_schedules_status ON email_schedules(status);
CREATE INDEX idx_email_subscriptions_user_id ON email_subscriptions(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- 관리자만 이메일 로그 및 스케줄 접근 가능
CREATE POLICY "Admin can manage email logs" ON email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage email schedules" ON email_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 사용자는 자신의 구독 설정만 관리 가능
CREATE POLICY "Users can manage own subscriptions" ON email_subscriptions
    FOR ALL USING (user_id = auth.uid());

-- 이메일 템플릿 기본 데이터 삽입
INSERT INTO email_templates (template_type, subject_template, html_template, variables) VALUES
('SIGNUP_COMPLETE', '【CNEC Japan】会員登録が完了しました', 
 '<!DOCTYPE html><html><!-- 회원가입 완료 템플릿 --></html>', 
 '{"name": "string", "email": "string"}'),

('APPLICATION_SUBMITTED', '【CNEC Japan】キャンペーン応募を受け付けました',
 '<!DOCTYPE html><html><!-- 캠페인 신청 완료 템플릿 --></html>',
 '{"name": "string", "campaignTitle": "string", "brandName": "string", "rewardAmount": "number"}'),

('APPLICATION_APPROVED', '【CNEC Japan】🎉 キャンペーン参加が確定しました！',
 '<!DOCTYPE html><html><!-- 캠페인 승인 템플릿 --></html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}'),

('GUIDE_DELIVERED', '【CNEC Japan】📋 キャンペーンガイドをお送りします',
 '<!DOCTYPE html><html><!-- 가이드 전달 템플릿 --></html>',
 '{"name": "string", "campaignTitle": "string", "googleDriveLink": "string", "googleSlidesLink": "string"}'),

('DEADLINE_REMINDER_3DAYS', '【CNEC Japan】⏰ 投稿締切まで3日です - リマインダー',
 '<!DOCTYPE html><html><!-- 3일전 알림 템플릿 --></html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}'),

('DEADLINE_REMINDER_1DAY', '【CNEC Japan】🚨 投稿締切まで1日です - 最終リマインダー',
 '<!DOCTYPE html><html><!-- 1일전 알림 템플릿 --></html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}'),

('DEADLINE_TODAY', '【CNEC Japan】🔥 本日が投稿締切日です！',
 '<!DOCTYPE html><html><!-- 당일 알림 템플릿 --></html>',
 '{"name": "string", "campaignTitle": "string", "deadline": "string", "rewardAmount": "number"}'),

('POINT_REQUEST_SUBMITTED', '【CNEC Japan】💰 ポイント申請を受け付けました',
 '<!DOCTYPE html><html><!-- 포인트 신청 완료 템플릿 --></html>',
 '{"name": "string", "pointAmount": "number", "amount": "number", "bankName": "string"}'),

('POINT_TRANSFER_COMPLETED', '【CNEC Japan】🎉 ポイント入金が完了しました！',
 '<!DOCTYPE html><html><!-- 포인트 입금 완료 템플릿 --></html>',
 '{"name": "string", "amount": "number", "transferDate": "string", "campaignTitle": "string"}');

-- 트리거 함수: 이메일 로그 업데이트 시간 자동 설정
CREATE OR REPLACE FUNCTION update_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_schedules_updated_at
    BEFORE UPDATE ON email_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER update_email_subscriptions_updated_at
    BEFORE UPDATE ON email_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_email_updated_at();

-- 이메일 발송 통계를 위한 뷰
CREATE VIEW email_stats AS
SELECT 
    template_type,
    status,
    COUNT(*) as count,
    DATE(created_at) as date
FROM email_logs
GROUP BY template_type, status, DATE(created_at)
ORDER BY date DESC, template_type;

-- 스케줄된 이메일 현황을 위한 뷰
CREATE VIEW scheduled_email_summary AS
SELECT 
    es.email_type,
    es.status,
    COUNT(*) as count,
    MIN(es.scheduled_at) as earliest_scheduled,
    MAX(es.scheduled_at) as latest_scheduled,
    c.title as campaign_title,
    c.brand as campaign_brand
FROM email_schedules es
LEFT JOIN campaigns c ON es.campaign_id = c.id
GROUP BY es.email_type, es.status, c.title, c.brand
ORDER BY earliest_scheduled;

-- 사용자별 이메일 수신 통계를 위한 뷰
CREATE VIEW user_email_stats AS
SELECT 
    el.recipient_email,
    up.name as user_name,
    COUNT(*) as total_emails,
    COUNT(CASE WHEN el.status = 'sent' THEN 1 END) as sent_emails,
    COUNT(CASE WHEN el.status = 'error' THEN 1 END) as failed_emails,
    MAX(el.created_at) as last_email_date
FROM email_logs el
LEFT JOIN user_profiles up ON el.recipient_email = up.email
GROUP BY el.recipient_email, up.name
ORDER BY total_emails DESC;
