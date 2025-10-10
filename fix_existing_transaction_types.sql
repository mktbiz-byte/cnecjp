-- 기존 point_transactions 데이터의 transaction_type 확인 및 수정

-- 1. 현재 사용 중인 모든 transaction_type 값 확인
SELECT DISTINCT transaction_type, COUNT(*) as count
FROM point_transactions 
GROUP BY transaction_type
ORDER BY count DESC;

-- 2. 기존 제약 조건 삭제 (먼저 삭제해야 함)
ALTER TABLE point_transactions 
DROP CONSTRAINT IF EXISTS point_transactions_transaction_type_check;

-- 3. 기존 데이터의 transaction_type 값들을 새로운 규칙에 맞게 수정
-- 'withdrawal_request' → 'pending'
UPDATE point_transactions 
SET transaction_type = 'pending' 
WHERE transaction_type = 'withdrawal_request';

-- 'withdrawal' → 'spent'
UPDATE point_transactions 
SET transaction_type = 'spent' 
WHERE transaction_type = 'withdrawal';

-- 'reward' → 'earned' (만약 있다면)
UPDATE point_transactions 
SET transaction_type = 'earned' 
WHERE transaction_type = 'reward';

-- 'campaign_reward' → 'earned' (만약 있다면)
UPDATE point_transactions 
SET transaction_type = 'earned' 
WHERE transaction_type = 'campaign_reward';

-- 'point_request' → 'pending' (만약 있다면)
UPDATE point_transactions 
SET transaction_type = 'pending' 
WHERE transaction_type = 'point_request';

-- 기타 알 수 없는 값들을 'earned'로 설정 (안전한 기본값)
UPDATE point_transactions 
SET transaction_type = 'earned' 
WHERE transaction_type NOT IN ('earned', 'spent', 'bonus', 'pending', 'approved', 'rejected', 'refund');

-- 4. 수정 후 다시 확인
SELECT DISTINCT transaction_type, COUNT(*) as count
FROM point_transactions 
GROUP BY transaction_type
ORDER BY count DESC;

-- 5. 새로운 제약 조건 추가
ALTER TABLE point_transactions 
ADD CONSTRAINT point_transactions_transaction_type_check 
CHECK (transaction_type IN (
    'earned',     -- 포인트 획득
    'spent',      -- 포인트 사용/출금
    'bonus',      -- 보너스 포인트
    'pending',    -- 대기 중 (출금 신청, SNS 업로드 등)
    'approved',   -- 승인됨
    'rejected',   -- 거절됨
    'refund'      -- 환불
));

-- 6. 최종 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'point_transactions'::regclass 
AND contype = 'c';
