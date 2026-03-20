-- withdrawals 테이블 생성
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    bank_info JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 출금 내역만 볼 수 있음
CREATE POLICY "Users can view their own withdrawals" 
ON public.withdrawals FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 출금 신청만 생성할 수 있음
CREATE POLICY "Users can create their own withdrawals" 
ON public.withdrawals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 출금 내역을 볼 수 있음
CREATE POLICY "Admins can view all withdrawals" 
ON public.withdrawals FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- 관리자는 모든 출금 내역을 업데이트할 수 있음
CREATE POLICY "Admins can update all withdrawals" 
ON public.withdrawals FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS withdrawals_user_id_idx ON public.withdrawals (user_id);
CREATE INDEX IF NOT EXISTS withdrawals_status_idx ON public.withdrawals (status);
CREATE INDEX IF NOT EXISTS withdrawals_requested_at_idx ON public.withdrawals (requested_at);

-- 출금 신청 시 사용자 포인트 차감을 위한 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  -- 사용자 포인트 차감 기록 추가
  INSERT INTO public.user_points (
    user_id, 
    points, 
    reason, 
    status, 
    approved_at
  ) VALUES (
    NEW.user_id, 
    -NEW.amount, 
    '출금 신청', 
    'approved', 
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_new_withdrawal ON public.withdrawals;
CREATE TRIGGER on_new_withdrawal
  AFTER INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_withdrawal();

-- 출금 신청 취소 시 사용자 포인트 복구를 위한 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_withdrawal_rejection()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 rejected로 변경된 경우에만 포인트 복구
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    -- 사용자 포인트 복구 기록 추가
    INSERT INTO public.user_points (
      user_id, 
      points, 
      reason, 
      status, 
      approved_at
    ) VALUES (
      NEW.user_id, 
      NEW.amount, 
      '출금 신청 취소', 
      'approved', 
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_withdrawal_rejection ON public.withdrawals;
CREATE TRIGGER on_withdrawal_rejection
  AFTER UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_withdrawal_rejection();
