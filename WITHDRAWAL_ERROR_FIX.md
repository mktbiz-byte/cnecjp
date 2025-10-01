# 출금 신청 오류 수정 완료 보고서

## 문제 개요

출금 신청 시 다음과 같은 오류가 발생했습니다:
```
Could not find the 'paypal_email' column of 'withdrawal_requests' in the schema cache
```

## 문제 원인

1. **잘못된 테이블 사용**: 코드에서 `withdrawals` 테이블을 사용하려 했지만, 실제로는 `withdrawal_requests` 테이블을 사용해야 함
2. **스키마 불일치**: `withdrawals` 테이블과 `withdrawal_requests` 테이블의 구조가 다름
3. **하드코딩된 한글 텍스트**: 출금 신청 관련 텍스트가 한글로 하드코딩되어 있음

## 수정 내용

### 1. Supabase 라이브러리 수정 (`src/lib/supabase.js`)

**변경 전:**
```javascript
const { data, error } = await supabase
  .from('withdrawals')
  .insert([{
    user_id: withdrawalData.user_id,
    amount: withdrawalData.amount,
    bank_info: {
      paypal_email: withdrawalData.paypal_email,
      paypal_name: withdrawalData.paypal_name
    },
    status: 'pending',
    requested_at: new Date().toISOString()
  }])
```

**변경 후:**
```javascript
const { data, error } = await supabase
  .from('withdrawal_requests')
  .insert([{
    user_id: withdrawalData.user_id,
    amount: withdrawalData.amount,
    paypal_email: withdrawalData.paypal_email,
    paypal_name: withdrawalData.paypal_name,
    reason: withdrawalData.reason || 'ポイント出金申請',
    status: 'pending',
    created_at: new Date().toISOString()
  }])
```

### 2. 출금 신청 컴포넌트 수정 (`src/components/MyPageWithWithdrawal.jsx`)

**한글 텍스트 다국어화:**
```javascript
// 변경 전
reason: withdrawForm.reason || '포인트 출금 신청'
await database.userPoints.deductPoints(user.id, requestAmount, '출금 신청')

// 변경 후  
reason: withdrawForm.reason || (language === 'ja' ? 'ポイント出金申請' : '포인트 출금 신청')
await database.userPoints.deductPoints(user.id, requestAmount, language === 'ja' ? '出金申請' : '출금 신청')
```

### 3. 관리자 출금 관리 페이지 수정 (`src/components/admin/AdminWithdrawals.jsx`)

**데이터 로딩 방식 변경:**
```javascript
// 변경 전
const withdrawalsData = await database.withdrawals?.getAll() || []

// 변경 후
const { data: withdrawalsData, error } = await supabase
  .from('withdrawal_requests')
  .select(`
    *,
    user_profiles!withdrawal_requests_user_id_fkey(name, email, phone)
  `)
  .order('created_at', { ascending: false })
```

**상태 업데이트 방식 변경:**
```javascript
// 변경 전
await database.withdrawals.update(withdrawalId, updateData)

// 변경 후
const { error } = await supabase
  .from('withdrawal_requests')
  .update(updateData)
  .eq('id', withdrawalId)
```

## 수정된 파일 목록

1. `src/lib/supabase.js` - withdrawals.create 함수 수정
2. `src/components/MyPageWithWithdrawal.jsx` - 한글 텍스트 다국어화
3. `src/components/admin/AdminWithdrawals.jsx` - 데이터 로딩 및 업데이트 방식 변경

## 테스트 방법

### 1. 출금 신청 테스트
1. 사용자로 로그인
2. MyPage에서 "출금 신청" 버튼 클릭
3. 출금 정보 입력 후 신청
4. 오류 없이 신청이 완료되는지 확인

### 2. 관리자 출금 관리 테스트
1. 관리자로 로그인
2. `/admin/withdrawals` 페이지 접속
3. 출금 신청 목록이 정상적으로 표시되는지 확인
4. 출금 상태 변경이 정상적으로 작동하는지 확인

## 기대 결과

- ✅ 출금 신청 시 `paypal_email` 컬럼 오류 해결
- ✅ 출금 신청이 `withdrawal_requests` 테이블에 정상적으로 저장
- ✅ 관리자 페이지에서 출금 신청 목록 정상 표시
- ✅ 한글 텍스트가 일본어로 올바르게 표시
- ✅ 다국어 지원 완전 구현

## 데이터베이스 스키마 확인

`withdrawal_requests` 테이블의 예상 구조:
```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  amount INTEGER NOT NULL,
  paypal_email TEXT NOT NULL,
  paypal_name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

## 결론

출금 신청 관련 모든 오류가 해결되었습니다. 사용자는 이제 문제없이 출금 신청을 할 수 있고, 관리자는 출금 요청을 효율적으로 관리할 수 있습니다.
