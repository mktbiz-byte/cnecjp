-- 출금 요청 데이터 확인

-- 1. point_transactions 테이블에서 출금 관련 데이터 확인
SELECT 
    pt.id,
    pt.user_id,
    pt.amount,
    pt.transaction_type,
    pt.description,
    pt.created_at,
    up.name,
    up.email,
    up.phone
FROM point_transactions pt
LEFT JOIN user_profiles up ON pt.user_id = up.user_id
WHERE pt.transaction_type = 'pending'
   OR pt.description LIKE '%출금%'
   OR pt.description LIKE '%출금 신청%'
ORDER BY pt.created_at DESC
LIMIT 10;

-- 2. withdrawal_requests 테이블이 존재하는지 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('withdrawal_requests', 'withdrawals');

-- 3. 모든 테이블 목록 확인 (출금 관련 테이블 찾기)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name LIKE '%withdraw%'
ORDER BY table_name;
