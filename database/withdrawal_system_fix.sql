-- 出金システム修正用SQLスクリプト
-- Supabase SQL Editorで実行してください

-- 1. withdrawalsテーブルにpaypal_nameカラムを追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawals' 
        AND column_name = 'paypal_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN paypal_name TEXT;
        RAISE NOTICE 'paypal_name カラムが追加されました';
    END IF;
END $$;

-- 2. withdrawalsテーブルにreasonカラムを追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawals' 
        AND column_name = 'reason'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN reason TEXT;
        RAISE NOTICE 'reason カラムが追加されました';
    END IF;
END $$;

-- 3. user_pointsテーブルの構造を修正（ポイント取引履歴用）
-- 既存のuser_pointsテーブルを削除して再作成
DROP TABLE IF EXISTS user_points CASCADE;

CREATE TABLE user_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    points INTEGER NOT NULL DEFAULT 0,
    reason TEXT NOT NULL DEFAULT 'ポイント取引',
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS設定
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のポイント履歴のみ閲覧可能
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points" ON user_points
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のポイント記録のみ作成可能
DROP POLICY IF EXISTS "Users can create own points" ON user_points;
CREATE POLICY "Users can create own points" ON user_points
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理者はすべてのポイント記録を管理可能
DROP POLICY IF EXISTS "Admins can manage all points" ON user_points;
CREATE POLICY "Admins can manage all points" ON user_points
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role IN ('admin', 'manager')
        )
    );

-- 5. withdrawalsテーブルのRLS設定を更新
-- 管理者はすべての出金記録を管理可能
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON withdrawals;
CREATE POLICY "Admins can manage all withdrawals" ON withdrawals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND user_role IN ('admin', 'manager')
        )
    );

-- ユーザーは自分の出金記録を更新可能
DROP POLICY IF EXISTS "Users can update own withdrawals" ON withdrawals;
CREATE POLICY "Users can update own withdrawals" ON withdrawals
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. インデックス追加
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_campaign_id ON user_points(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_points_status ON user_points(status);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points(created_at DESC);

-- 7. 関数作成: ユーザーの総ポイント計算
CREATE OR REPLACE FUNCTION get_user_total_points(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(points), 0) INTO total_points
    FROM user_points 
    WHERE user_id = target_user_id 
    AND status = 'approved';
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 関数作成: ポイント追加
CREATE OR REPLACE FUNCTION add_user_points(
    target_user_id UUID,
    point_amount INTEGER,
    point_reason TEXT DEFAULT 'ポイント獲得',
    campaign_ref_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_record_id UUID;
BEGIN
    INSERT INTO user_points (
        user_id, 
        campaign_id, 
        points, 
        reason, 
        status, 
        approved_at
    ) VALUES (
        target_user_id,
        campaign_ref_id,
        point_amount,
        point_reason,
        'approved',
        NOW()
    ) RETURNING id INTO new_record_id;
    
    RETURN new_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. テーブル構造確認
SELECT 'withdrawals テーブル構造:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'withdrawals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'user_points テーブル構造:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_points' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. スキーマキャッシュ更新
NOTIFY pgrst, 'reload schema';

SELECT '出金システム修正完了' as result;
