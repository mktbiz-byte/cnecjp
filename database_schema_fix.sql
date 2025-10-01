-- cnec.jp 데이터베이스 스키마 수정 통합 스크립트
-- Supabase SQL Editor에서 실행

-- 1. withdrawal_requests 테이블 구조 확인 및 생성
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    paypal_email TEXT NOT NULL,
    paypal_name TEXT NOT NULL,
    reason TEXT DEFAULT 'ポイント出金申請',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 2. user_profiles 테이블에 누락된 컬럼 추가
DO $$ 
BEGIN
    -- age 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'age'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN age INTEGER;
    END IF;

    -- region 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'region'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN region TEXT;
    END IF;

    -- bio 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'bio'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN bio TEXT;
    END IF;

    -- weight 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'weight'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN weight DECIMAL(5,2);
    END IF;

    -- height 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'height'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN height DECIMAL(5,2);
    END IF;

    -- has_children 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'has_children'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN has_children BOOLEAN DEFAULT FALSE;
    END IF;

    -- is_married 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_married'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN is_married BOOLEAN DEFAULT FALSE;
    END IF;

    -- instagram_followers 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'instagram_followers'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN instagram_followers INTEGER DEFAULT 0;
    END IF;

    -- tiktok_followers 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'tiktok_followers'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN tiktok_followers INTEGER DEFAULT 0;
    END IF;

    -- youtube_subscribers 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'youtube_subscribers'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN youtube_subscribers INTEGER DEFAULT 0;
    END IF;

END $$;

-- 3. point_transactions 테이블 구조 확인 및 생성
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'bonus', 'admin_add', 'admin_subtract', 'campaign_reward', 'pending_reward')),
    description TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS 정책 설정
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- withdrawal_requests 정책
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can create own withdrawal requests" ON withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Admins can manage all withdrawal requests" ON withdrawal_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role IN ('admin', 'manager')
        )
    );

-- point_transactions 정책
DROP POLICY IF EXISTS "Users can view own point transactions" ON point_transactions;
CREATE POLICY "Users can view own point transactions" ON point_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own point transactions" ON point_transactions;
CREATE POLICY "Users can create own point transactions" ON point_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all point transactions" ON point_transactions;
CREATE POLICY "Admins can manage all point transactions" ON point_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role IN ('admin', 'manager')
        )
    );

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_application_id ON point_transactions(application_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_campaign_id ON point_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_status ON point_transactions(status);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- 6. 유틸리티 함수 생성
CREATE OR REPLACE FUNCTION get_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_points
    FROM point_transactions 
    WHERE user_id = target_user_id 
    AND status = 'completed'
    AND transaction_type IN ('earn', 'bonus', 'admin_add', 'campaign_reward');
    
    -- 출금된 포인트 차감
    SELECT total_points - COALESCE(SUM(amount), 0) INTO total_points
    FROM point_transactions 
    WHERE user_id = target_user_id 
    AND status = 'completed'
    AND transaction_type IN ('spend', 'admin_subtract');
    
    RETURN GREATEST(total_points, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';

-- 8. 테이블 구조 확인
SELECT 'withdrawal_requests 테이블 구조:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'withdrawal_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'user_profiles 테이블 구조 (새 컬럼들):' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name IN ('age', 'region', 'bio', 'weight', 'height', 'has_children', 'is_married', 'instagram_followers', 'tiktok_followers', 'youtube_subscribers')
ORDER BY column_name;

SELECT 'point_transactions 테이블 구조:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'point_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '데이터베이스 스키마 수정 완료' as result;


-- 9. applications 테이블에 shipped_at 컬럼 추가 (송장번호 업데이트 오류 해결)
DO $$ 
BEGIN
    -- shipped_at 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'shipped_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE applications ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- tracking_number 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'tracking_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE applications ADD COLUMN tracking_number TEXT;
    END IF;

    -- shipping_status 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'shipping_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE applications ADD COLUMN shipping_status TEXT DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'shipped', 'delivered'));
    END IF;

END $$;

-- applications 테이블 새 컬럼 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_applications_shipped_at ON applications(shipped_at);
CREATE INDEX IF NOT EXISTS idx_applications_tracking_number ON applications(tracking_number);
CREATE INDEX IF NOT EXISTS idx_applications_shipping_status ON applications(shipping_status);

SELECT 'applications 테이블 배송 관련 컬럼 추가 완료' as result;

-- 10. user_profiles 테이블에 address 컬럼 추가 (프로필 수정 오류 해결)
DO $$ 
BEGIN
    -- address 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'address'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN address TEXT;
    END IF;

    -- phone_number 컬럼 추가 (phone과 별도로)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'phone_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN phone_number TEXT;
    END IF;

END $$;

SELECT 'user_profiles 테이블 address 및 phone_number 컬럼 추가 완료' as result;
