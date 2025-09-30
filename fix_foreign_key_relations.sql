-- 외래키 관계 문제 해결
-- campaign_applications와 user_profiles 간의 관계 설정

-- 1. 현재 외래키 제약조건 확인
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('campaign_applications', 'user_profiles');

-- 2. campaign_applications 테이블에 user_profiles 외래키 추가 (존재하지 않는 경우)
DO $$ 
BEGIN
    -- 기존 외래키 제약조건이 있는지 확인
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'campaign_applications_user_id_fkey'
        AND table_name = 'campaign_applications'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- user_id 컬럼이 존재하는지 확인
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'campaign_applications' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            -- 외래키 제약조건 추가
            ALTER TABLE campaign_applications 
            ADD CONSTRAINT campaign_applications_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES user_profiles(user_id);
            
            RAISE NOTICE '외래키 제약조건 campaign_applications_user_id_fkey 추가됨';
        ELSE
            RAISE NOTICE 'campaign_applications 테이블에 user_id 컬럼이 없음';
        END IF;
    ELSE
        RAISE NOTICE '외래키 제약조건 campaign_applications_user_id_fkey 이미 존재함';
    END IF;
END $$;

-- 3. campaign_applications 테이블에 campaigns 외래키 추가 (존재하지 않는 경우)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'campaign_applications_campaign_id_fkey'
        AND table_name = 'campaign_applications'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'campaign_applications' 
            AND column_name = 'campaign_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE campaign_applications 
            ADD CONSTRAINT campaign_applications_campaign_id_fkey 
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id);
            
            RAISE NOTICE '외래키 제약조건 campaign_applications_campaign_id_fkey 추가됨';
        ELSE
            RAISE NOTICE 'campaign_applications 테이블에 campaign_id 컬럼이 없음';
        END IF;
    ELSE
        RAISE NOTICE '외래키 제약조건 campaign_applications_campaign_id_fkey 이미 존재함';
    END IF;
END $$;

-- 4. withdrawals 테이블 생성 (존재하지 않는 경우)
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

-- 5. user_points 테이블 생성 (존재하지 않는 경우)
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

-- 6. RLS (Row Level Security) 정책 설정
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 출금 내역만 조회/생성 가능
CREATE POLICY "Users can view own withdrawals" ON withdrawals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals" ON withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 포인트만 조회 가능
CREATE POLICY "Users can view own points" ON user_points
    FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 모든 데이터 접근 가능 (별도 정책 필요시 추가)

-- 7. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_campaign_applications_user_id ON campaign_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- 8. 스키마 캐시 새로고침 (PostgREST)
NOTIFY pgrst, 'reload schema';
