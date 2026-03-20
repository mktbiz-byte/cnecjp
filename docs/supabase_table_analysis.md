# Supabase 테이블 구조 분석 결과

## 문제 상황
- 출금 신청 시 `Could not find the 'paypal_email' column of 'withdrawals'` 오류 발생
- 마이페이지 로딩 문제 및 권한 오류

## withdrawals 테이블 현재 구조
확인된 컬럼:
- `id` (uuid)
- `user_id` (uuid) 
- `amount` (int4)
- `status` (varchar)

## 문제점
1. `withdrawals` 테이블에 `paypal_email`, `paypal_name`, `reason` 컬럼이 없음
2. 코드에서는 이 컬럼들을 사용하려고 시도
3. `withdrawal_requests` 테이블은 존재하지만 다른 구조를 가짐

## 해결 방안
1. `withdrawals` 테이블에 필요한 컬럼 추가
2. 또는 `withdrawal_requests` 테이블 사용으로 코드 변경
3. RLS 권한 문제 해결
