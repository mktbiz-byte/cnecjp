-- ============================================================
-- 영상 업로드 실패 + 수정 요청 표시 안됨 수정 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================================

-- ============================================================
-- 진단 1: 현재 상태 확인
-- ============================================================

-- campaign_submissions 테이블에 revision_requests 컬럼 있는지 확인
SELECT '1. campaign_submissions.revision_requests' AS check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaign_submissions'
        AND column_name = 'revision_requests'
        AND table_schema = 'public'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING → 추가 필요' END AS result;

-- applications 테이블에 revision_requests 컬럼 있는지 확인
SELECT '2. applications.revision_requests' AS check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications'
        AND column_name = 'revision_requests'
        AND table_schema = 'public'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING → 추가 필요' END AS result;

-- video_submissions 테이블에 revision_requests 컬럼 있는지 확인
SELECT '3. video_submissions.revision_requests' AS check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'video_submissions'
        AND column_name = 'revision_requests'
        AND table_schema = 'public'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING → 추가 필요' END AS result;

-- campaign_submissions RLS 정책 확인
SELECT '4. campaign_submissions RLS policies' AS check_item,
    COALESCE(string_agg(polname::text || ' (' || polcmd::text || ')', ', '), '❌ NO POLICIES') AS result
FROM pg_policy
WHERE polrelid = 'public.campaign_submissions'::regclass;

-- storage 버킷 확인
SELECT '5. campaign-videos bucket' AS check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'campaign-videos'
    ) THEN '✅ EXISTS (public=' ||
        (SELECT public::text FROM storage.buckets WHERE id = 'campaign-videos') ||
        ', size_limit=' ||
        COALESCE((SELECT file_size_limit::text FROM storage.buckets WHERE id = 'campaign-videos'), 'none') ||
    ')' ELSE '❌ MISSING → 생성 필요' END AS result;

-- storage RLS 정책 확인 (campaign-videos 관련)
SELECT '6. storage.objects policies' AS check_item,
    COALESCE(string_agg(polname::text || ' (' || polcmd::text || ')', ', '), '❌ NO POLICIES for campaign-videos') AS result
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass;

-- applications RLS 확인
SELECT '7. applications RLS enabled' AS check_item,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_tables
        WHERE tablename = 'applications' AND rowsecurity = true AND schemaname = 'public'
    ) THEN '✅ RLS 활성화' ELSE '⚠️ RLS 비활성화 (모든 유저 접근 가능)' END AS result;


-- ============================================================
-- 수정 2: 누락 컬럼 추가
-- ============================================================

-- campaign_submissions에 revision_requests 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaign_submissions'
        AND column_name = 'revision_requests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_submissions ADD COLUMN revision_requests JSONB DEFAULT '[]'::JSONB;
        RAISE NOTICE '✅ campaign_submissions.revision_requests 컬럼 추가됨';
    ELSE
        RAISE NOTICE 'ℹ️ campaign_submissions.revision_requests 이미 존재';
    END IF;
END $$;

-- applications에 revision_requests 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications'
        AND column_name = 'revision_requests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE applications ADD COLUMN revision_requests JSONB DEFAULT '[]'::JSONB;
        RAISE NOTICE '✅ applications.revision_requests 컬럼 추가됨';
    ELSE
        RAISE NOTICE 'ℹ️ applications.revision_requests 이미 존재';
    END IF;
END $$;

-- applications에 revision_notes 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications'
        AND column_name = 'revision_notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE applications ADD COLUMN revision_notes TEXT;
        RAISE NOTICE '✅ applications.revision_notes 컬럼 추가됨';
    ELSE
        RAISE NOTICE 'ℹ️ applications.revision_notes 이미 존재';
    END IF;
END $$;

-- video_submissions에 revision_requests 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'video_submissions' AND table_schema = 'public'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'video_submissions'
            AND column_name = 'revision_requests'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE video_submissions ADD COLUMN revision_requests JSONB DEFAULT '[]'::JSONB;
            RAISE NOTICE '✅ video_submissions.revision_requests 컬럼 추가됨';
        ELSE
            RAISE NOTICE 'ℹ️ video_submissions.revision_requests 이미 존재';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ video_submissions 테이블 없음 (skip)';
    END IF;
END $$;


-- ============================================================
-- 수정 3: Storage 버킷 + RLS 정책 설정
-- ============================================================

-- campaign-videos 버킷 생성 (없는 경우)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'campaign-videos',
    'campaign-videos',
    true,  -- public=true: 누구나 영상 URL로 접근 가능 (업로드는 정책으로 제어)
    2147483648,  -- 2GB
    ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg', 'video/3gpp', 'video/x-matroska']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS 정책 설정
-- 기존 campaign-videos 관련 정책 삭제 후 재생성

-- INSERT: 인증된 유저가 자기 폴더에 업로드 가능
DROP POLICY IF EXISTS "Users can upload videos" ON storage.objects;
CREATE POLICY "Users can upload videos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'campaign-videos'
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- SELECT: 인증된 유저면 누구나 조회 가능 (공유 필요)
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
CREATE POLICY "Anyone can view videos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'campaign-videos'
    );

-- UPDATE: 자기 폴더의 파일만 수정 가능
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
CREATE POLICY "Users can update own videos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'campaign-videos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- DELETE: 자기 폴더의 파일만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
CREATE POLICY "Users can delete own videos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'campaign-videos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- ============================================================
-- 수정 4: campaign_submissions RLS 정책 재설정
-- (revision_requested 상태도 포함되도록)
-- ============================================================

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

-- 관리자 정책 (user_profiles.role 또는 user_role 사용)
DROP POLICY IF EXISTS "Admins can view all submissions" ON campaign_submissions;
CREATE POLICY "Admins can view all submissions" ON campaign_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND (user_profiles.role IN ('admin', 'manager')
                 OR user_profiles.user_role IN ('admin', 'manager'))
        )
    );

DROP POLICY IF EXISTS "Admins can update all submissions" ON campaign_submissions;
CREATE POLICY "Admins can update all submissions" ON campaign_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND (user_profiles.role IN ('admin', 'manager')
                 OR user_profiles.user_role IN ('admin', 'manager'))
        )
    );

DROP POLICY IF EXISTS "Admins can insert submissions" ON campaign_submissions;
CREATE POLICY "Admins can insert submissions" ON campaign_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND (user_profiles.role IN ('admin', 'manager')
                 OR user_profiles.user_role IN ('admin', 'manager'))
        )
    );

DROP POLICY IF EXISTS "Admins can delete submissions" ON campaign_submissions;
CREATE POLICY "Admins can delete submissions" ON campaign_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND (user_profiles.role IN ('admin', 'manager')
                 OR user_profiles.user_role IN ('admin', 'manager'))
        )
    );


-- ============================================================
-- 수정 5: workflow_status CHECK 제약 조건에 'revision_requested' 포함 확인
-- (원본 스키마에 revision_requested가 없을 수 있음)
-- ============================================================
DO $$
DECLARE
    v_constraint_def TEXT;
BEGIN
    SELECT pg_get_constraintdef(c.oid)
    INTO v_constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'campaign_submissions'
    AND c.conname LIKE '%workflow_status%';

    IF v_constraint_def IS NOT NULL AND v_constraint_def NOT LIKE '%revision_requested%' THEN
        -- CHECK 제약 조건에 revision_requested가 없으면 재생성
        EXECUTE 'ALTER TABLE campaign_submissions DROP CONSTRAINT IF EXISTS campaign_submissions_workflow_status_check';
        EXECUTE 'ALTER TABLE campaign_submissions ADD CONSTRAINT campaign_submissions_workflow_status_check CHECK (workflow_status IN (
            ''guide_pending'', ''guide_confirmed'', ''video_uploading'', ''video_uploaded'',
            ''sns_pending'', ''sns_submitted'', ''review_pending'', ''revision_required'',
            ''revision_requested'', ''completed'', ''points_paid''
        ))';
        RAISE NOTICE '✅ workflow_status CHECK 제약 조건에 revision_requested 추가됨';
    ELSE
        RAISE NOTICE 'ℹ️ workflow_status CHECK 제약 조건 정상 (revision_requested 포함)';
    END IF;
END $$;


-- ============================================================
-- 확인: 수정 후 상태 재확인
-- ============================================================
SELECT '=== 수정 후 확인 ===' AS info;

SELECT col, status FROM (
    SELECT 'campaign_submissions.revision_requests' AS col,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_submissions' AND column_name = 'revision_requests') THEN '✅' ELSE '❌' END AS status
    UNION ALL
    SELECT 'applications.revision_requests',
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'revision_requests') THEN '✅' ELSE '❌' END
    UNION ALL
    SELECT 'applications.revision_notes',
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'revision_notes') THEN '✅' ELSE '❌' END
) checks;

SELECT polname, polcmd, polroles::text
FROM pg_policy
WHERE polrelid = 'public.campaign_submissions'::regclass
ORDER BY polname;

SELECT polname, polcmd
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass
AND polname LIKE '%video%'
ORDER BY polname;
