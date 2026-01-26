-- ============================================================
-- CNEC.JP 캠페인 워크플로우 개선 SQL 스크립트
-- 캠페인 유형: 기획형, 메가와리, 4주 챌린지, 올영세일
-- ============================================================

-- 1. campaigns 테이블에 campaign_type 컬럼 추가
-- ============================================================
DO $$
BEGIN
    -- campaign_type 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns'
        AND column_name = 'campaign_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN campaign_type TEXT DEFAULT 'regular'
            CHECK (campaign_type IN ('regular', 'megawari', '4week_challenge', 'oliveyoung'));
        RAISE NOTICE 'campaign_type 컬럼 추가됨';
    END IF;

    -- total_steps 컬럼 추가 (각 캠페인의 총 스텝 수)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns'
        AND column_name = 'total_steps'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN total_steps INTEGER DEFAULT 1;
        RAISE NOTICE 'total_steps 컬럼 추가됨';
    END IF;

    -- shooting_guide_url 컬럼 추가 (촬영 가이드 URL)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns'
        AND column_name = 'shooting_guide_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN shooting_guide_url TEXT;
        RAISE NOTICE 'shooting_guide_url 컬럼 추가됨';
    END IF;

    -- ad_code_required 컬럼 추가 (광고코드 필수 여부)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns'
        AND column_name = 'ad_code_required'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN ad_code_required BOOLEAN DEFAULT true;
        RAISE NOTICE 'ad_code_required 컬럼 추가됨';
    END IF;

    -- clean_video_required 컬럼 추가 (클린본 필수 여부)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns'
        AND column_name = 'clean_video_required'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN clean_video_required BOOLEAN DEFAULT true;
        RAISE NOTICE 'clean_video_required 컬럼 추가됨';
    END IF;
END $$;

-- 2. campaign_submissions 테이블 생성
-- 각 스텝별 영상 제출 및 SNS 업로드 관리
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 기본 연결 정보
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

    -- 스텝 정보
    step_number INTEGER NOT NULL DEFAULT 1,  -- 1, 2, 3, 4 (4주 챌린지는 1~4)
    step_label TEXT,  -- 'Week 1', 'Step 1', '1스텝' 등 표시용

    -- 워크플로우 상태
    workflow_status TEXT DEFAULT 'guide_pending'
        CHECK (workflow_status IN (
            'guide_pending',      -- 가이드 확인 대기
            'guide_confirmed',    -- 가이드 확인 완료
            'video_uploading',    -- 영상 업로드 중
            'video_uploaded',     -- 영상 업로드 완료
            'sns_pending',        -- SNS URL 입력 대기
            'sns_submitted',      -- SNS URL 제출 완료
            'review_pending',     -- 관리자 검토 대기
            'revision_required',  -- 수정 필요
            'completed',          -- 완료
            'points_paid'         -- 포인트 지급 완료
        )),

    -- 영상 업로드 정보 (Supabase Storage)
    video_file_path TEXT,         -- Supabase Storage 경로
    video_file_url TEXT,          -- 공개 URL
    video_file_name TEXT,         -- 원본 파일명
    video_file_size BIGINT,       -- 파일 크기 (bytes)
    video_uploaded_at TIMESTAMP WITH TIME ZONE,

    -- 클린본 (자막 없는 버전)
    clean_video_file_path TEXT,
    clean_video_file_url TEXT,
    clean_video_file_name TEXT,
    clean_video_uploaded_at TIMESTAMP WITH TIME ZONE,

    -- SNS 업로드 정보
    sns_platform TEXT CHECK (sns_platform IN ('instagram', 'tiktok', 'youtube', 'other')),
    sns_url TEXT,                 -- SNS 게시물 URL
    sns_uploaded_at TIMESTAMP WITH TIME ZONE,

    -- 광고코드
    ad_code TEXT,                 -- 광고코드 (예: #AD, #PR, #협찬 등)

    -- 관리자 메모 및 피드백
    admin_notes TEXT,
    revision_notes TEXT,          -- 수정 요청 내용

    -- 포인트 정보
    points_amount INTEGER DEFAULT 0,
    points_paid_at TIMESTAMP WITH TIME ZONE,

    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 복합 유니크 제약 (한 신청에서 같은 스텝은 하나만)
    UNIQUE(application_id, step_number)
);

-- 3. 인덱스 생성
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_application_id ON campaign_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_user_id ON campaign_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign_id ON campaign_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_workflow_status ON campaign_submissions(workflow_status);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_step_number ON campaign_submissions(step_number);
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_type ON campaigns(campaign_type);

-- 4. RLS (Row Level Security) 정책 설정
-- ============================================================
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 제출물만 조회 가능
DROP POLICY IF EXISTS "Users can view own submissions" ON campaign_submissions;
CREATE POLICY "Users can view own submissions" ON campaign_submissions
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 제출물만 생성 가능
DROP POLICY IF EXISTS "Users can create own submissions" ON campaign_submissions;
CREATE POLICY "Users can create own submissions" ON campaign_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 제출물만 업데이트 가능
DROP POLICY IF EXISTS "Users can update own submissions" ON campaign_submissions;
CREATE POLICY "Users can update own submissions" ON campaign_submissions
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. 관리자 정책 (user_profiles의 role이 'admin'인 경우)
-- ============================================================
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

-- 6. Supabase Storage 버킷 설정 (SQL에서 직접 실행 불가, 참고용)
-- ============================================================
-- 아래 내용은 Supabase Dashboard > Storage에서 수동으로 설정해야 합니다:
--
-- 버킷 이름: campaign-videos
-- 공개 여부: private (인증된 사용자만 접근)
-- 파일 크기 제한: 500MB
-- 허용 MIME 타입: video/mp4, video/quicktime, video/x-msvideo, video/webm
--
-- Storage Policy 예시:
-- INSERT: auth.uid() = (storage.foldername())[1]::uuid
-- SELECT: auth.uid() = (storage.foldername())[1]::uuid OR 관리자
-- UPDATE: auth.uid() = (storage.foldername())[1]::uuid
-- DELETE: auth.uid() = (storage.foldername())[1]::uuid

-- 7. 자동 스텝 생성 함수
-- applications이 승인되면 캠페인 유형에 따라 자동으로 submissions 생성
-- ============================================================
CREATE OR REPLACE FUNCTION create_campaign_submissions()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_type TEXT;
    v_total_steps INTEGER;
    v_step INTEGER;
    v_step_label TEXT;
BEGIN
    -- 상태가 'approved'로 변경된 경우에만 실행
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- 캠페인 정보 조회
        SELECT campaign_type, total_steps
        INTO v_campaign_type, v_total_steps
        FROM campaigns
        WHERE id = NEW.campaign_id;

        -- 캠페인 유형에 따른 기본 스텝 수 설정
        IF v_total_steps IS NULL OR v_total_steps < 1 THEN
            v_total_steps := CASE v_campaign_type
                WHEN '4week_challenge' THEN 4
                WHEN 'megawari' THEN 2
                ELSE 1
            END;
        END IF;

        -- 각 스텝에 대한 submission 생성
        FOR v_step IN 1..v_total_steps LOOP
            -- 스텝 라벨 설정
            v_step_label := CASE v_campaign_type
                WHEN '4week_challenge' THEN 'Week ' || v_step
                WHEN 'megawari' THEN 'Step ' || v_step
                ELSE NULL
            END;

            -- 이미 존재하지 않는 경우에만 생성
            INSERT INTO campaign_submissions (
                application_id,
                user_id,
                campaign_id,
                step_number,
                step_label,
                workflow_status
            )
            SELECT
                NEW.id,
                NEW.user_id,
                NEW.campaign_id,
                v_step,
                v_step_label,
                'guide_pending'
            WHERE NOT EXISTS (
                SELECT 1 FROM campaign_submissions
                WHERE application_id = NEW.id
                AND step_number = v_step
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_create_campaign_submissions ON applications;
CREATE TRIGGER trigger_create_campaign_submissions
    AFTER UPDATE OF status ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_campaign_submissions();

-- 신규 승인된 applications에 대한 트리거 (INSERT 시)
DROP TRIGGER IF EXISTS trigger_create_campaign_submissions_insert ON applications;
CREATE TRIGGER trigger_create_campaign_submissions_insert
    AFTER INSERT ON applications
    FOR EACH ROW
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION create_campaign_submissions();

-- 8. 스키마 캐시 새로고침
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- 9. 현재 상태 확인
-- ============================================================
SELECT 'campaigns 테이블 새 컬럼 확인:' as status;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
AND column_name IN ('campaign_type', 'total_steps', 'shooting_guide_url', 'ad_code_required', 'clean_video_required')
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'campaign_submissions 테이블 존재 확인:' as status;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'campaign_submissions'
    AND table_schema = 'public'
) as campaign_submissions_exists;

-- 10. 기존 campaigns 데이터 마이그레이션 (기획형으로 설정)
-- ============================================================
UPDATE campaigns
SET campaign_type = 'regular', total_steps = 1
WHERE campaign_type IS NULL;

-- 11. 캠페인 유형별 한글/일본어 라벨 참조 테이블 (선택사항)
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

-- 기본 캠페인 유형 데이터 삽입
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

-- 완료 메시지
SELECT '✅ 캠페인 워크플로우 스키마 설정 완료!' as result;
