-- point_transactions 테이블의 transaction_type 제약 조건 확인 및 수정

-- 1. 현재 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'point_transactions'::regclass 
AND contype = 'c';

-- 2. 현재 테이블 구조 확인
\d point_transactions;

-- 3. 현재 사용 중인 transaction_type 값들 확인
SELECT DISTINCT transaction_type, COUNT(*) 
FROM point_transactions 
GROUP BY transaction_type;

-- 4. 기존 제약 조건 삭제 (있다면)
ALTER TABLE point_transactions 
DROP CONSTRAINT IF EXISTS point_transactions_transaction_type_check;

-- 5. 새로운 제약 조건 추가 (필요한 모든 값 포함)
ALTER TABLE point_transactions 
ADD CONSTRAINT point_transactions_transaction_type_check 
CHECK (transaction_type IN (
    'earned',           -- 포인트 획득
    'spent',            -- 포인트 사용
    'bonus',            -- 보너스 포인트
    'withdrawal',       -- 출금 (실제 차감)
    'withdrawal_request', -- 출금 신청
    'pending',          -- 대기 중 (SNS 업로드 등)
    'approved',         -- 승인됨
    'rejected',         -- 거절됨
    'refund',           -- 환불
    'adjustment'        -- 조정
));

-- 6. 테이블 구조 재확인
\d point_transactions;

-- 7. 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'point_transactions'::regclass 
AND contype = 'c';
