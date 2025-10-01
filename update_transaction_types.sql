-- point_transactions 테이블의 transaction_type 제약 조건 업데이트

-- 기존 제약 조건 삭제
ALTER TABLE point_transactions 
DROP CONSTRAINT IF EXISTS point_transactions_transaction_type_check;

-- 새로운 제약 조건 추가 (모든 필요한 값 포함)
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
