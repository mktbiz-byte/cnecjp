-- CNEC.JP Supabase 데이터베이스 수정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. campaign_applications 테이블에 누락된 컬럼들 추가
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
        RAISE NOTICE 'virtual_selected_at 컬럼 추가됨';
    END IF;

    -- approved_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'approved_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'approved_at 컬럼 추가됨';
    END IF;

    -- rejected_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'rejected_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'rejected_at 컬럼 추가됨';
    END IF;

    -- google_drive_url 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'google_drive_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN google_drive_url TEXT;
        RAISE NOTICE 'google_drive_url 컬럼 추가됨';
    END IF;

    -- google_slides_url 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'google_slides_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN google_slides_url TEXT;
        RAISE NOTICE 'google_slides_url 컬럼 추가됨';
    END IF;

    -- drive_notes 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'drive_notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN drive_notes TEXT;
        RAISE NOTICE 'drive_notes 컬럼 추가됨';
    END IF;

    -- drive_provided_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'drive_provided_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE campaign_applications ADD COLUMN drive_provided_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'drive_provided_at 컬럼 추가됨';
    END IF;
END $$;

-- 2. withdrawals 테이블 생성 (존재하지 않는 경우)
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    paypal_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    admin_notes TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. user_points 테이블 생성 (존재하지 않는 경우)
CREATE TABLE IF NOT EXISTS user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_withdrawn INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. RLS (Row Level Security) 정책 설정
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 출금 내역만 조회/생성 가능
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
CREATE POLICY "Users can view own withdrawals" ON withdrawals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawals" ON withdrawals;
CREATE POLICY "Users can create own withdrawals" ON withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 포인트만 조회 가능
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points" ON user_points
    FOR SELECT USING (auth.uid() = user_id);

-- 5. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_campaign_applications_user_id ON campaign_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- 6. 스키마 캐시 새로고침 (PostgREST)
NOTIFY pgrst, 'reload schema';

-- 7. 현재 상태 확인
SELECT 'campaign_applications 테이블 컬럼 확인:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaign_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'withdrawals 테이블 존재 확인:' as status;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'withdrawals' 
    AND table_schema = 'public'
) as withdrawals_exists;

SELECT 'user_points 테이블 존재 확인:' as status;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_points' 
    AND table_schema = 'public'
) as user_points_exists;

-- 8. 비정상 사용자 확인 (삭제하지 않고 확인만)
SELECT '비정상 사용자 확인:' as status;
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE 'temp_%' 
ORDER BY created_at DESC
LIMIT 10;
