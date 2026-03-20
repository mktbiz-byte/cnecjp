-- withdrawal_requests와 withdrawals 테이블 구조 및 데이터 확인

-- 1. withdrawal_requests 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'withdrawal_requests'
ORDER BY ordinal_position;

-- 2. withdrawals 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'withdrawals'
ORDER BY ordinal_position;

-- 3. withdrawal_requests 테이블 데이터 확인
SELECT * FROM withdrawal_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. withdrawals 테이블 데이터 확인
SELECT * FROM withdrawals 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. point_transactions에서 출금 관련 데이터 확인
SELECT 
    pt.id,
    pt.user_id,
    pt.amount,
    pt.transaction_type,
    pt.description,
    pt.created_at,
    up.name,
    up.email
FROM point_transactions pt
LEFT JOIN user_profiles up ON pt.user_id = up.user_id
WHERE pt.transaction_type = 'pending'
ORDER BY pt.created_at DESC
LIMIT 5;
