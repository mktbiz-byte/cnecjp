-- 출금 관련 테이블 구조 확인 SQL

-- 1. withdrawal_requests 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'withdrawal_requests' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. withdrawals 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'withdrawals' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. withdrawal_requests 데이터 확인
SELECT * FROM withdrawal_requests LIMIT 5;

-- 4. withdrawals 데이터 확인
SELECT * FROM withdrawals LIMIT 5;

-- 5. user_points 테이블 구조 확인 (출금 가능 포인트 확인용)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_points' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. user_points 데이터 확인
SELECT * FROM user_points LIMIT 5;

-- 7. point_transactions 테이블 구조 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'point_transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
