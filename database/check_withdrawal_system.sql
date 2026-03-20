-- 출금 시스템 데이터 구조 및 데이터 확인

-- 1. withdrawal_requests 테이블 존재 여부 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%withdrawal%';

-- 2. withdrawal_requests 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'withdrawal_requests'
ORDER BY ordinal_position;

-- 3. withdrawal_requests 테이블 데이터 확인
SELECT COUNT(*) as total_count FROM withdrawal_requests;

-- 4. withdrawal_requests 샘플 데이터 확인
SELECT * FROM withdrawal_requests LIMIT 5;

-- 5. point_transactions 테이블에서 출금 관련 데이터 확인
SELECT 
    transaction_type,
    COUNT(*) as count,
    SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) as negative_amounts
FROM point_transactions 
GROUP BY transaction_type;

-- 6. point_transactions에서 출금 관련 데이터 샘플
SELECT 
    id,
    user_id,
    amount,
    transaction_type,
    description,
    created_at
FROM point_transactions 
WHERE amount < 0 OR transaction_type IN ('pending', 'withdrawal', 'spent')
ORDER BY created_at DESC
LIMIT 10;

-- 7. user_profiles와 조인하여 실제 사용자 정보 확인
SELECT 
    pt.id,
    pt.amount,
    pt.transaction_type,
    pt.description,
    up.name,
    up.email
FROM point_transactions pt
LEFT JOIN user_profiles up ON pt.user_id = up.user_id
WHERE pt.amount < 0
ORDER BY pt.created_at DESC
LIMIT 5;
