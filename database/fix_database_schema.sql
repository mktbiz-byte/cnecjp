-- 데이터베이스 스키마 문제 해결
-- 1. campaign_applications 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'campaign_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 누락된 컬럼들 추가 (존재하지 않는 경우에만)
DO $$ 
BEGIN
    -- virtual_selected_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'virtual_selected_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN virtual_selected_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- approved_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'approved_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- rejected_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'rejected_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- google_drive_url 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'google_drive_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN google_drive_url TEXT;
    END IF;

    -- google_slides_url 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'google_slides_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN google_slides_url TEXT;
    END IF;

    -- drive_notes 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'drive_notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN drive_notes TEXT;
    END IF;

    -- drive_provided_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'drive_provided_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN drive_provided_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. 비정상 사용자 데이터 확인
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE 'temp_%' 
ORDER BY created_at DESC;

-- 4. 비정상 사용자 프로필 확인
SELECT up.id, up.user_id, up.name, up.email, au.email as auth_email
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.email LIKE 'temp_%' OR au.email LIKE 'temp_%'
ORDER BY up.created_at DESC;

-- 5. campaign_applications 테이블의 현재 상태 확인
SELECT status, COUNT(*) as count
FROM campaign_applications
GROUP BY status;

-- 6. 최근 생성된 신청서들 확인
SELECT id, user_id, campaign_id, status, created_at, updated_at
FROM campaign_applications
ORDER BY created_at DESC
LIMIT 10;
