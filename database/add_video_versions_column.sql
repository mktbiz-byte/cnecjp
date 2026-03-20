-- ============================================================
-- campaign_submissions 테이블에 video_versions JSONB 컬럼 추가
-- 영상 버전 히스토리를 보존하기 위한 마이그레이션
-- v1, v2, v3... 순차적 버전 추적
-- ============================================================

DO $$
BEGIN
    -- video_versions JSONB 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaign_submissions'
        AND column_name = 'video_versions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_submissions
            ADD COLUMN video_versions JSONB DEFAULT '[]'::JSONB;
        RAISE NOTICE 'video_versions 컬럼 추가됨';
    END IF;
END $$;

-- 기존 데이터 마이그레이션: 이미 영상이 업로드된 submission의 경우
-- video_file_path가 있지만 video_versions가 비어있으면 v1으로 추가
UPDATE campaign_submissions
SET video_versions = jsonb_build_array(
    jsonb_build_object(
        'version', COALESCE(
            (regexp_match(video_file_path, '_v(\d+)_'))[1]::INTEGER,
            1
        ),
        'file_path', video_file_path,
        'file_url', video_file_url,
        'file_name', video_file_name,
        'file_size', video_file_size,
        'uploaded_at', COALESCE(video_uploaded_at, created_at)
    )
)
WHERE video_file_path IS NOT NULL
AND (video_versions IS NULL OR video_versions = '[]'::JSONB);

-- 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';

SELECT '✅ video_versions 컬럼 추가 및 기존 데이터 마이그레이션 완료!' as result;
