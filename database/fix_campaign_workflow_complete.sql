-- ============================================================
-- CNEC.JP 캠페인 워크플로우 완전 수정 스크립트
-- 진단 + 테이블 생성 + 트리거 + 기존 데이터 백필
--
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================================

-- ============================================================
-- STEP 1: 진단 - 현재 상태 확인
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '=== 진단 시작 ===';
END $$;

-- 1-1. campaign_submissions 테이블 존재 여부
SELECT '1. campaign_submissions 테이블' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'campaign_submissions' AND table_schema = 'public'
    ) THEN '✅ 존재함' ELSE '❌ 없음 → 생성 필요' END as result;

-- 1-2. 트리거 함수 존재 여부
SELECT '2. create_campaign_submissions 함수' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'create_campaign_submissions'
    ) THEN '✅ 존재함' ELSE '❌ 없음 → 생성 필요' END as result;

-- 1-3. 트리거 존재 여부
SELECT '3. trigger_create_campaign_submissions' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_create_campaign_submissions'
    ) THEN '✅ 존재함' ELSE '❌ 없음 → 생성 필요' END as result;

-- 1-4. approved 상태인 applications 수
SELECT '4. approved applications 수' as check_item,
    COUNT(*)::text as result
FROM applications WHERE status = 'approved';

-- 1-5. campaign_submissions 레코드 수 (테이블이 있는 경우)
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'campaign_submissions' AND table_schema = 'public'
    ) THEN
        EXECUTE 'SELECT COUNT(*) FROM campaign_submissions' INTO v_count;
        RAISE NOTICE '5. campaign_submissions 레코드 수: %', v_count;
    ELSE
        RAISE NOTICE '5. campaign_submissions 테이블이 없어서 레코드 수 확인 불가';
    END IF;
END $$;

-- 1-6. campaigns 테이블 주요 컬럼 확인
SELECT '6. campaigns.campaign_type 컬럼' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'campaign_type' AND table_schema = 'public'
    ) THEN '✅ 존재함' ELSE '❌ 없음' END as result;

SELECT '7. campaigns.total_steps 컬럼' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'total_steps' AND table_schema = 'public'
    ) THEN '✅ 존재함' ELSE '❌ 없음' END as result;

SELECT '8. campaigns.guide_type 컬럼' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'guide_type' AND table_schema = 'public'
    ) THEN '✅ 존재함' ELSE '❌ 없음' END as result;

SELECT '9. campaigns.guide_pdf_url 컬럼' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'guide_pdf_url' AND table_schema = 'public'
    ) THEN '✅ 존재함' ELSE '❌ 없음' END as result;

-- 1-7. RLS 상태 확인
SELECT '10. campaign_submissions RLS' as check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename = 'campaign_submissions' AND rowsecurity = true
    ) THEN '✅ RLS 활성화됨'
    WHEN EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'campaign_submissions'
    ) THEN '⚠️ RLS 비활성화'
    ELSE '❌ 테이블 없음' END as result;

-- 1-8. applications 테이블에 status='video_submitted'인 레코드 확인 (이전 버그로 변경된 것)
SELECT '11. status=video_submitted인 applications' as check_item,
    COUNT(*)::text || '개 (있으면 approved로 복구 필요)' as result
FROM applications WHERE status = 'video_submitted';


-- ============================================================
-- STEP 2: campaigns 테이블 컬럼 추가 (없는 경우)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'campaign_type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN campaign_type TEXT DEFAULT 'regular';
        RAISE NOTICE 'campaign_type 컬럼 추가됨';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'total_steps' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN total_steps INTEGER DEFAULT 1;
        RAISE NOTICE 'total_steps 컬럼 추가됨';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'step_deadlines' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN step_deadlines JSONB;
        RAISE NOTICE 'step_deadlines 컬럼 추가됨';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'shooting_guide_url' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN shooting_guide_url TEXT;
        RAISE NOTICE 'shooting_guide_url 컬럼 추가됨';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'shooting_guide_content' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN shooting_guide_content TEXT;
        RAISE NOTICE 'shooting_guide_content 컬럼 추가됨';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'ad_code_required' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN ad_code_required BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'clean_video_required' AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN clean_video_required BOOLEAN DEFAULT true;
    END IF;
END $$;

-- campaign_type NULL인 기존 데이터 기본값 설정
UPDATE campaigns SET campaign_type = 'regular', total_steps = 1
WHERE campaign_type IS NULL;


-- ============================================================
-- STEP 3: campaign_submissions 테이블 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS campaign_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL DEFAULT 1,
    step_label TEXT,
    video_deadline TIMESTAMP WITH TIME ZONE,
    sns_deadline TIMESTAMP WITH TIME ZONE,
    workflow_status TEXT DEFAULT 'guide_pending'
        CHECK (workflow_status IN (
            'guide_pending', 'guide_confirmed', 'video_uploading', 'video_uploaded',
            'sns_pending', 'sns_submitted', 'review_pending', 'revision_required',
            'revision_requested', 'completed', 'points_paid'
        )),
    video_file_path TEXT,
    video_file_url TEXT,
    video_file_name TEXT,
    video_file_size BIGINT,
    video_uploaded_at TIMESTAMP WITH TIME ZONE,
    video_versions JSONB DEFAULT '[]'::JSONB,
    clean_video_file_path TEXT,
    clean_video_file_url TEXT,
    clean_video_file_name TEXT,
    clean_video_uploaded_at TIMESTAMP WITH TIME ZONE,
    sns_platform TEXT CHECK (sns_platform IN ('instagram', 'tiktok', 'youtube', 'other')),
    sns_url TEXT,
    sns_uploaded_at TIMESTAMP WITH TIME ZONE,
    ad_code TEXT,
    admin_notes TEXT,
    revision_notes TEXT,
    revision_requests JSONB,
    points_amount INTEGER DEFAULT 0,
    points_paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(application_id, step_number)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_cs_application_id ON campaign_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_cs_user_id ON campaign_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_campaign_id ON campaign_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_cs_workflow_status ON campaign_submissions(workflow_status);


-- ============================================================
-- STEP 4: RLS 정책 설정
-- ============================================================
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 재생성
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

DROP POLICY IF EXISTS "Admins can insert submissions" ON campaign_submissions;
CREATE POLICY "Admins can insert submissions" ON campaign_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete submissions" ON campaign_submissions;
CREATE POLICY "Admins can delete submissions" ON campaign_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );


-- ============================================================
-- STEP 5: 트리거 함수 생성 (applications approved → submissions 자동 생성)
-- ============================================================
CREATE OR REPLACE FUNCTION create_campaign_submissions()
RETURNS TRIGGER AS $$
DECLARE
    v_campaign_type TEXT;
    v_total_steps INTEGER;
    v_step INTEGER;
    v_step_label TEXT;
BEGIN
    -- approved/selected/filming 상태로 변경된 경우 실행
    -- cnecbiz.com 관리자가 selected, filming 상태도 사용함
    IF NEW.status IN ('approved', 'selected', 'filming') AND (OLD IS NULL OR OLD.status IS DISTINCT FROM NEW.status) THEN
        -- 캠페인 정보 조회
        SELECT campaign_type, total_steps
        INTO v_campaign_type, v_total_steps
        FROM campaigns
        WHERE id = NEW.campaign_id;

        -- 기본 스텝 수 설정
        IF v_total_steps IS NULL OR v_total_steps < 1 THEN
            v_total_steps := CASE v_campaign_type
                WHEN '4week_challenge' THEN 4
                WHEN 'megawari' THEN 2
                ELSE 1
            END;
        END IF;

        -- 각 스텝에 대한 submission 생성
        FOR v_step IN 1..v_total_steps LOOP
            v_step_label := CASE v_campaign_type
                WHEN '4week_challenge' THEN 'Week ' || v_step
                WHEN 'megawari' THEN 'Step ' || v_step
                ELSE NULL
            END;

            -- 이미 존재하지 않는 경우에만 생성
            INSERT INTO campaign_submissions (
                application_id, user_id, campaign_id,
                step_number, step_label, workflow_status
            )
            SELECT NEW.id, NEW.user_id, NEW.campaign_id,
                   v_step, v_step_label, 'guide_pending'
            WHERE NOT EXISTS (
                SELECT 1 FROM campaign_submissions
                WHERE application_id = NEW.id AND step_number = v_step
            );
        END LOOP;

        RAISE NOTICE 'Created % submissions for application %', v_total_steps, NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 6: 트리거 생성
-- ============================================================
DROP TRIGGER IF EXISTS trigger_create_campaign_submissions ON applications;
CREATE TRIGGER trigger_create_campaign_submissions
    AFTER UPDATE OF status ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_campaign_submissions();

DROP TRIGGER IF EXISTS trigger_create_campaign_submissions_insert ON applications;
CREATE TRIGGER trigger_create_campaign_submissions_insert
    AFTER INSERT ON applications
    FOR EACH ROW
    WHEN (NEW.status IN ('approved', 'selected', 'filming'))
    EXECUTE FUNCTION create_campaign_submissions();


-- ============================================================
-- STEP 7: 기존 approved/selected/filming applications에 대해 누락된 submissions 백필
-- (트리거가 없었을 때 승인된 applications에 submissions가 없는 경우)
-- ============================================================
DO $$
DECLARE
    v_app RECORD;
    v_campaign_type TEXT;
    v_total_steps INTEGER;
    v_step INTEGER;
    v_step_label TEXT;
    v_created_count INTEGER := 0;
BEGIN
    -- approved/selected/filming 상태이지만 submissions가 없는 applications 찾기
    FOR v_app IN
        SELECT a.id, a.user_id, a.campaign_id
        FROM applications a
        WHERE a.status IN ('approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed')
        AND NOT EXISTS (
            SELECT 1 FROM campaign_submissions cs
            WHERE cs.application_id = a.id
        )
    LOOP
        -- 캠페인 정보 조회
        SELECT COALESCE(campaign_type, 'regular'), COALESCE(total_steps, 1)
        INTO v_campaign_type, v_total_steps
        FROM campaigns
        WHERE id = v_app.campaign_id;

        -- 기본 스텝 수
        IF v_total_steps IS NULL OR v_total_steps < 1 THEN
            v_total_steps := CASE v_campaign_type
                WHEN '4week_challenge' THEN 4
                WHEN 'megawari' THEN 2
                ELSE 1
            END;
        END IF;

        -- 스텝별 submission 생성
        FOR v_step IN 1..v_total_steps LOOP
            v_step_label := CASE v_campaign_type
                WHEN '4week_challenge' THEN 'Week ' || v_step
                WHEN 'megawari' THEN 'Step ' || v_step
                ELSE NULL
            END;

            INSERT INTO campaign_submissions (
                application_id, user_id, campaign_id,
                step_number, step_label, workflow_status
            ) VALUES (
                v_app.id, v_app.user_id, v_app.campaign_id,
                v_step, v_step_label, 'guide_pending'
            )
            ON CONFLICT (application_id, step_number) DO NOTHING;

            v_created_count := v_created_count + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE '백필 완료: %개 submissions 생성됨', v_created_count;
END $$;


-- ============================================================
-- STEP 8: 이전 버그로 status='video_submitted'된 applications 복구
-- (status는 approved로 복구, submission_status는 유지)
-- ============================================================
DO $$
DECLARE
    v_fixed_count INTEGER;
BEGIN
    UPDATE applications
    SET status = 'approved',
        submission_status = COALESCE(submission_status, 'video_submitted'),
        updated_at = NOW()
    WHERE status = 'video_submitted';

    GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
    RAISE NOTICE 'status=video_submitted → approved 복구: %개', v_fixed_count;

    UPDATE applications
    SET status = 'approved',
        submission_status = COALESCE(submission_status, status),
        updated_at = NOW()
    WHERE status = 'sns_submitted';

    GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
    RAISE NOTICE 'status=sns_submitted → approved 복구: %개', v_fixed_count;
END $$;


-- ============================================================
-- STEP 9: applications 테이블에 submission_status 컬럼 추가 (없는 경우)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications' AND column_name = 'submission_status' AND table_schema = 'public'
    ) THEN
        ALTER TABLE applications ADD COLUMN submission_status TEXT;
        RAISE NOTICE 'applications.submission_status 컬럼 추가됨';
    END IF;
END $$;


-- ============================================================
-- STEP 10: 스키마 캐시 새로고침
-- ============================================================
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- STEP 11: 최종 확인
-- ============================================================
SELECT '=== 최종 확인 ===' as status;

SELECT 'campaign_submissions 총 레코드' as item,
    COUNT(*)::text as value
FROM campaign_submissions;

SELECT 'approved/selected/filming applications' as item,
    COUNT(*)::text as value
FROM applications WHERE status IN ('approved', 'selected', 'filming');

SELECT 'submissions가 있는 applications' as item,
    COUNT(DISTINCT application_id)::text as value
FROM campaign_submissions;

SELECT 'submissions가 없는 승인 applications' as item,
    COUNT(*)::text || '개 (0이어야 정상)' as value
FROM applications a
WHERE a.status IN ('approved', 'selected', 'filming')
AND NOT EXISTS (
    SELECT 1 FROM campaign_submissions cs WHERE cs.application_id = a.id
);

SELECT 'workflow_status 분포' as item, workflow_status, COUNT(*)::text as count
FROM campaign_submissions
GROUP BY workflow_status
ORDER BY COUNT(*) DESC;

SELECT '✅ 캠페인 워크플로우 완전 수정 완료!' as result;
