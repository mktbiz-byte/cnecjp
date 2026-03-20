# 데이터베이스 구조 분석 및 API 수정 필요사항

## 현재 데이터베이스 구조 분석

### 주요 테이블 구조
실제 데이터베이스에는 다음과 같은 테이블들이 존재합니다:

1. **campaigns** - 캠페인 정보
2. **applications** - 기존 신청 시스템
3. **campaign_applications** - 새로운 신청 시스템 (중복)
4. **user_profiles** - 사용자 프로필
5. **email_templates** - 이메일 템플릿
6. **email_logs** - 이메일 발송 로그
7. **point_requests** - 포인트 요청
8. **point_transactions** - 포인트 거래 내역
9. **user_points** - 사용자 포인트
10. **shipping_tracking** - 배송 추적
11. **sns_uploads** - SNS 업로드 관리
12. **withdrawal_requests** - 출금 요청
13. **withdrawals** - 출금 내역
14. **admin_settings** - 관리자 설정

## API 코드와 실제 DB 구조 간 차이점 분석

### 1. 누락된 테이블 API
현재 `supabase.js`에는 다음 테이블들에 대한 API가 누락되어 있습니다:

- **campaign_applications** (새로운 신청 시스템)
- **email_logs** (이메일 발송 로그)
- **point_requests** (포인트 요청)
- **point_transactions** (포인트 거래)
- **user_points** (사용자 포인트)
- **shipping_tracking** (배송 추적)
- **sns_uploads** (SNS 업로드)
- **withdrawal_requests** (출금 요청)
- **withdrawals** (출금 내역)
- **admin_settings** (관리자 설정)

### 2. 테이블 구조 차이점

#### applications vs campaign_applications
- **applications**: 기존 시스템, 더 단순한 구조
- **campaign_applications**: 새로운 시스템, 더 상세한 필드들
  - `name`, `age`, `phone`, `email` 등 개별 필드로 분리
  - `temp_selected`, `final_confirmed` 등 선발 단계 관리
  - `tracking_number`, `video_upload_links` 등 추가 기능

#### user_profiles 필드 차이
실제 DB에는 API 코드에 없는 추가 필드들이 있습니다:
- `weight`, `height` (체중, 키)
- `has_children`, `is_married` (자녀 유무, 결혼 여부)
- `region` (지역)
- `other_sns_url` (기타 SNS URL)
- `instagram_followers`, `tiktok_followers`, `youtube_subscribers` (팔로워 수)
- `user_role`, `approval_status` (사용자 역할, 승인 상태)
- `points` (포인트)

### 3. RLS 정책 분석
현재 RLS 정책에서 관리자 권한 확인 방식이 두 가지로 혼재되어 있습니다:
1. `user_profiles.role = 'admin'` 방식
2. `auth.users.email IN ('mkt_biz@cnec.co.kr', 'admin@cnec.test')` 방식

## 필요한 API 수정사항

### 1. 누락된 테이블 API 추가
모든 테이블에 대한 CRUD API를 추가해야 합니다.

### 2. user_profiles API 확장
실제 DB 필드에 맞춰 API를 확장해야 합니다.

### 3. 이중화된 신청 시스템 정리
`applications`와 `campaign_applications` 중 어느 것을 메인으로 사용할지 결정 필요합니다.

### 4. 포인트 시스템 통합
`user_points`, `point_requests`, `point_transactions` 테이블을 활용한 통합 포인트 시스템 API가 필요합니다.

### 5. 권한 관리 일원화
RLS 정책의 관리자 권한 확인 방식을 통일해야 합니다.

## 권장 수정 방향

### 1. 우선순위 높음
- **campaign_applications** API 추가 (새로운 신청 시스템)
- **user_profiles** API 확장 (누락된 필드들)
- **포인트 시스템** API 추가 (point_requests, point_transactions, user_points)

### 2. 우선순위 중간
- **shipping_tracking** API 추가
- **sns_uploads** API 추가
- **email_logs** API 추가

### 3. 우선순위 낮음
- **withdrawal_requests/withdrawals** API 추가
- **admin_settings** API 추가

이러한 분석을 바탕으로 API 코드를 단계적으로 수정하여 실제 데이터베이스 구조와 일치시킬 수 있습니다.
