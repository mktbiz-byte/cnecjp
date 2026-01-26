-- ============================================================
-- CNEC.JP 캠페인 워크플로우 개선 SQL 스크립트 v2
-- 스텝별 마감일 + 가이드 기능 추가
-- ============================================================

-- 1. campaigns 테이블에 새 컬럼 추가
-- ============================================================
DO $$
BEGIN
    -- campaign_type 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'campaign_type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN campaign_type TEXT DEFAULT 'regular'
            CHECK (campaign_type IN ('regular', 'megawari', '4week_challenge', 'oliveyoung'));
    END IF;

    -- total_steps 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'total_steps' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN total_steps INTEGER DEFAULT 1;
    END IF;

    -- shooting_guide_url 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'shooting_guide_url' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN shooting_guide_url TEXT;
    END IF;

    -- shooting_guide_content 컬럼 추가 (텍스트 가이드)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'shooting_guide_content' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN shooting_guide_content TEXT;
    END IF;

    -- ad_code_required 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'ad_code_required' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN ad_code_required BOOLEAN DEFAULT true;
    END IF;

    -- clean_video_required 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'clean_video_required' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN clean_video_required BOOLEAN DEFAULT true;
    END IF;

    -- step_deadlines 컬럼 추가 (각 스텝별 마감일 JSON 배열)
    -- 예: [{"step": 1, "video_deadline": "2024-02-01", "sns_deadline": "2024-02-08"}, ...]
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'step_deadlines' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN step_deadlines JSONB;
    END IF;
END $$;

-- 2. campaign_submissions 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 기본 연결 정보
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- 스텝 정보
    step_number INTEGER NOT NULL DEFAULT 1,
    step_label TEXT,

    -- 스텝별 마감일 (캠페인에서 복사되거나 개별 설정)
    video_deadline TIMESTAMP WITH TIME ZONE,  -- 영상 제출 마감일
    sns_deadline TIMESTAMP WITH TIME ZONE,    -- SNS 업로드 마감일

    -- 워크플로우 상태
    workflow_status TEXT DEFAULT 'guide_pending'
        CHECK (workflow_status IN (
            'guide_pending',
            'guide_confirmed',
            'video_uploading',
            'video_uploaded',
            'sns_pending',
            'sns_submitted',
            'review_pending',
            'revision_required',
            'completed',
            'points_paid'
        )),

    -- 영상 업로드 정보
    video_file_path TEXT,
    video_file_url TEXT,
    video_file_name TEXT,
    video_file_size BIGINT,
    video_uploaded_at TIMESTAMP WITH TIME ZONE,

    -- 클린본
    clean_video_file_path TEXT,
    clean_video_file_url TEXT,
    clean_video_file_name TEXT,
    clean_video_uploaded_at TIMESTAMP WITH TIME ZONE,

    -- SNS 업로드 정보
    sns_platform TEXT CHECK (sns_platform IN ('instagram', 'tiktok', 'youtube', 'other')),
    sns_url TEXT,
    sns_uploaded_at TIMESTAMP WITH TIME ZONE,

    -- 광고코드
    ad_code TEXT,

    -- 관리자 메모
    admin_notes TEXT,
    revision_notes TEXT,

    -- 포인트
    points_amount INTEGER DEFAULT 0,
    points_paid_at TIMESTAMP WITH TIME ZONE,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(application_id, step_number)
);

-- 3. 인덱스 생성
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_application_id ON campaign_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_user_id ON campaign_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign_id ON campaign_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_workflow_status ON campaign_submissions(workflow_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_type ON campaigns(campaign_type);

-- 4. RLS 정책
-- ============================================================
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON campaign_submissions;
CREATE POLICY "Users can view own submissions" ON campaign_submissions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own submissions" ON campaign_submissions;
CREATE POLICY "Users can create own submissions" ON campaign_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own submissions" ON campaign_submissions;
CREATE POLICY "Users can update own submissions" ON campaign_submissions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all submissions" ON campaign_submissions;
CREATE POLICY "Admins can view all submissions" ON campaign_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all submissions" ON campaign_submissions;
CREATE POLICY "Admins can update all submissions" ON campaign_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- 5. 기존 데이터 마이그레이션
-- ============================================================
UPDATE campaigns
SET campaign_type = 'regular', total_steps = 1
WHERE campaign_type IS NULL;

-- 6. 캠페인 유형 라벨 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_type_labels (
    type_code TEXT PRIMARY KEY,
    icon TEXT,
    label_ko TEXT NOT NULL,
    label_ja TEXT NOT NULL,
    description_ko TEXT,
    description_ja TEXT,
    default_steps INTEGER DEFAULT 1
);

INSERT INTO campaign_type_labels (type_code, icon, label_ko, label_ja, description_ko, description_ja, default_steps)
VALUES
    ('regular', '📹', '기획형', '企画型', '1개 영상 제작', '1本の動画制作', 1),
    ('megawari', '🎯', '메가와리', 'メガ割', '2개 영상 (스텝 1/2)', '2本の動画（ステップ1/2）', 2),
    ('4week_challenge', '🗓️', '4주 챌린지', '4週チャレンジ', '매주 1개씩 총 4개', '毎週1本ずつ計4本', 4),
    ('oliveyoung', '🛍️', '올영세일', 'オリーブヤング', '올리브영 세일 캠페인', 'オリーブヤングセールキャンペーン', 1)
ON CONFLICT (type_code) DO UPDATE SET
    icon = EXCLUDED.icon,
    label_ko = EXCLUDED.label_ko,
    label_ja = EXCLUDED.label_ja,
    description_ko = EXCLUDED.description_ko,
    description_ja = EXCLUDED.description_ja,
    default_steps = EXCLUDED.default_steps;

-- 7. 스키마 캐시 새로고침
-- ============================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ 캠페인 워크플로우 스키마 v2 설정 완료!' as result;
