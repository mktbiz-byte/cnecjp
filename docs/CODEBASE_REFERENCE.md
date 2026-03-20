# CNEC Japan - 코드베이스 종합 레퍼런스 문서

> 이 문서는 클로드 프로젝트에 넣어서 코드 컨텍스트를 제공하기 위한 목적으로 작성되었습니다.
> 최종 업데이트: 2026-02-25

---

## 1. 프로젝트 개요

**CNEC Japan**은 일본 시장을 타겟으로 하는 **K-Beauty 인플루언서 마케팅 플랫폼**입니다.
한국 뷰티 브랜드와 일본 크리에이터(인플루언서)를 연결하여, 캠페인 진행부터 SNS 콘텐츠 제작, 보상 지급까지의 전체 워크플로우를 관리합니다.

- **도메인**: cnec.jp
- **대상 시장**: 일본 (UI는 일본어 기본, 관리자는 한국어/일본어 전환 가능)
- **리포지토리**: `mktbiz-byte/cnecjp`

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | React 19 + Vite 6 |
| **언어** | JavaScript (JSX) |
| **스타일링** | Tailwind CSS 4 + shadcn/ui (Radix UI 기반) |
| **백엔드/DB** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **인증** | Supabase Auth (Google OAuth 2.0 + Email/Password), PKCE flow |
| **상태관리** | React Context API (AuthContext, LanguageContext) |
| **라우팅** | React Router DOM v7 |
| **차트** | Recharts |
| **아이콘** | Lucide React |
| **애니메이션** | Framer Motion |
| **폼 유효성** | React Hook Form + Zod |
| **이메일** | EmailJS (클라이언트) / Gmail SMTP (서버 사이드 발송) |
| **엑셀** | xlsx (SheetJS) |
| **날짜** | date-fns |
| **배포** | Netlify (자동 빌드/배포) |
| **패키지 매니저** | pnpm |

---

## 3. 프로젝트 디렉토리 구조

```
cnecjp/
├── public/                    # 정적 파일
├── src/
│   ├── App.jsx                # 루트 컴포넌트 (라우팅 정의)
│   ├── main.jsx               # 엔트리 포인트
│   ├── App.css                # 글로벌 스타일
│   ├── index.css              # Tailwind 기본 스타일
│   ├── components/
│   │   ├── ui/                # shadcn/ui 공통 컴포넌트 (40개+)
│   │   ├── admin/             # 관리자 전용 컴포넌트
│   │   └── *.jsx              # 사용자 페이지 컴포넌트
│   ├── contexts/
│   │   ├── AuthContext.jsx    # 인증 상태 관리
│   │   └── LanguageContext.jsx # 다국어 상태 관리
│   ├── constants/
│   │   └── beautyProfileOptions.js  # 뷰티 프로필 상수 (피부타입, 은행 등)
│   ├── hooks/
│   │   └── use-mobile.js      # 모바일 감지 훅
│   └── lib/
│       ├── supabase.js        # 핵심: Supabase 클라이언트 + 모든 DB API
│       ├── emailService.js    # 이메일 템플릿 + 발송 서비스
│       ├── emailScheduler.js  # 마감일 자동 알림 스케줄러
│       ├── i18n.js            # 다국어 번역 데이터 (ko/ja/en)
│       ├── googleDriveService.js  # Google Drive API 연동
│       ├── gmailEmailService.js   # Gmail SMTP 발송
│       └── utils.js           # cn() 유틸리티 (tailwind-merge)
├── netlify/
│   └── functions/
│       ├── send-gmail.js      # Gmail SMTP 이메일 발송 (서버리스)
│       ├── send-email.js      # 범용 이메일 발송
│       └── package.json       # Netlify Functions 의존성
├── sql/
│   ├── 001_japan_user_profiles_migration.sql  # 일본 프로필 마이그레이션
│   ├── 002_fix_rls_infinite_recursion.sql     # RLS 순환참조 수정
│   └── fix_upload_and_revision.sql            # 업로드/수정 관련 SQL
├── vite.config.js             # Vite 설정 (빌드 최적화, 코드스플리팅)
├── package.json               # 의존성 관리
├── netlify.toml               # Netlify 배포 설정
└── *.md                       # 각종 문서
```

---

## 4. 라우팅 구조 (App.jsx)

### 4.1 공개 페이지 (ProtectedRoute 없음, 누구나 접근)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `HomePageJP` | 메인 홈페이지 (일본어) - 캠페인 목록 표시 |
| `/login` | `LoginPageExactReplica` | 로그인 (Google OAuth / 이메일) |
| `/signup` | `SignupPageExactReplica` | 회원가입 |
| `/auth/callback` | `AuthCallbackSafe` | OAuth 콜백 처리 |
| `/privacy` | `PrivacyPolicy` | 개인정보처리방침 |
| `/terms` | `TermsOfService` | 이용약관 |
| `/guide` | `CampaignGuide` | 캠페인 가이드 페이지 |
| `/secret-admin-login` | `SecretAdminLogin` | 관리자 전용 로그인 (ProtectedRoute 없음, URL 직접 입력으로만 접근) |

### 4.2 사용자 페이지 (ProtectedRoute 없음, 로그인 상태에서 사용)

> 주의: 이 페이지들은 ProtectedRoute로 감싸져 있지 않습니다. 컴포넌트 내부에서 useAuth()로 로그인 여부를 확인합니다.

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/campaign-application` | `CampaignApplicationUpdated` | 캠페인 신청 페이지 |
| `/mypage` | `MyPageWithWithdrawal` | 마이페이지 (캠페인 진행상황, 포인트, 출금) |
| `/profile` | `ProfileSettings` | 프로필 설정 |
| `/profile-settings` | `ProfileSettings` | 프로필 설정 (중복 경로) |
| `/profile-beauty` | `ProfileSettingsBeauty` | 뷰티 프로필 상세 설정 |
| `/paypal-withdrawal` | `PayPalWithdrawal` | PayPal 출금 (레거시) |
| `/company-report/:campaignId` | `CompanyReportNew` | 기업용 캠페인 보고서 |

### 4.3 관리자 페이지 (ProtectedRoute + requireAdmin=true)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/dashboard` | `AdminDashboardSimple` | 관리자 대시보드 (통계) |
| `/campaigns-manage` | `AdminCampaignsWithQuestions` | 캠페인 관리 (CRUD) |
| `/campaign-create` | `CampaignCreationWithTranslator` | 캠페인 생성 (번역 기능 포함) |
| `/applications-manage` | `ApplicationsReportSimple` | 신청 관리 |
| `/applications-report` | `ApplicationsReportSimple` | 신청 리포트 |
| `/confirmed-creators` | `AdminConfirmedCreators` | 확정 크리에이터 목록 |
| `/confirmed-creators/:campaignId` | `ConfirmedCreatorsNew` | 캠페인별 확정 크리에이터 |
| `/sns-uploads` | `SNSUploadNew` | SNS 업로드 관리 |
| `/sns-uploads/:campaignId` | `SNSUploadNew` | 캠페인별 SNS 업로드 |
| `/campaign-report/:campaignId` | `CampaignReportEnhanced` | 캠페인 상세 보고서 |
| `/email-templates` | `EmailTemplateManager` | 이메일 템플릿 관리 |
| `/users-manage` | `UserApprovalManagerEnhanced` | 사용자 승인 관리 |
| `/user-approval` | `UserApprovalManagerEnhanced` | 사용자 승인 (중복 경로) |
| `/withdrawals-manage` | `AdminWithdrawals` | 출금 요청 관리 |
| `/system-settings` | `SystemSettings` | 시스템 설정 |
| `/email-settings` | `EmailSettings` | 이메일 발송 설정 |

---

## 5. 핵심 Context (상태관리)

### 5.1 AuthContext (`src/contexts/AuthContext.jsx`)

전역 인증 상태를 관리합니다.

**제공하는 값:**
```javascript
{
  user,              // Supabase Auth User 객체 (null이면 비로그인)
  userProfile,       // user_profiles 테이블의 프로필 데이터
  loading,           // 인증 상태 로딩 중 여부
  signInWithEmail,   // (email, password) => 이메일 로그인
  signUpWithEmail,   // (email, password, name) => 이메일 회원가입
  signInWithGoogle,  // () => Google OAuth 로그인
  signOut,           // () => 로그아웃 (쿠키/스토리지 전체 정리)
  updateProfile,     // (profileData) => 프로필 업데이트
  loadUserProfile    // (userId) => 프로필 새로고침
}
```

**주요 동작:**
- 앱 시작 시 `getSession()`으로 기존 세션 복원
- `onAuthStateChange` 리스너로 로그인/로그아웃 이벤트 감지
- `SIGNED_IN` 시 자동으로 `user_profiles` 존재 여부 확인 → 없으면 자동 생성
- `SIGNED_OUT` 시 모든 쿠키, localStorage, sessionStorage 정리

### 5.2 LanguageContext (`src/contexts/LanguageContext.jsx`)

다국어 지원 상태를 관리합니다.

**제공하는 값:**
```javascript
{
  language,          // 현재 언어 ('ko' | 'ja')
  changeLanguage,    // (lang) => 언어 변경
  t,                 // (key) => 번역 텍스트 반환
  isKorean,          // boolean
  isJapanese         // boolean
}
```

**특이사항:**
- 기본 언어는 **일본어(ja)**로 고정 (홈페이지/마이페이지는 항상 일본어)
- 관리자 페이지에서만 한국어 전환 가능

---

## 6. Supabase API 레이어 (`src/lib/supabase.js`)

이 파일이 **프로젝트의 핵심 데이터 레이어**입니다. 모든 DB 접근은 이 파일의 함수를 통해 이루어집니다.

### 6.1 환경변수

```
VITE_SUPABASE_URL      # Supabase 프로젝트 URL
VITE_SUPABASE_ANON_KEY # Supabase 익명 키
```

### 6.2 Supabase 클라이언트 설정

```javascript
export const supabase = createClient(url, key, {
  auth: {
    redirectTo: `${getCurrentSiteUrl()}/auth/callback`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'     // PKCE 인증 플로우 사용
  },
  global: {
    headers: { 'x-my-custom-header': 'cnec-platform' }
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  },
  db: {
    schema: 'public'
  },
  fetch: (url, options) => fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30000)  // 30초 타임아웃
  })
})
```

### 6.3 safeQuery - 재시도 래퍼

모든 DB 쿼리는 `safeQuery()`로 감싸져 있어서:
- 최대 3회 재시도 (1초, 2초, 3초 간격)
- RLS 권한 오류 시 빈 결과 반환 (앱 크래시 방지)

### 6.4 auth - 인증 API

```javascript
export const auth = {
  getCurrentUser()              // 현재 로그인 유저 반환
  getSession()                  // 현재 세션 정보 반환
  signInWithGoogle()            // Google OAuth 로그인
  signInWithEmail(email, pass)  // 이메일/비밀번호 로그인
  signUpWithEmail(email, pass, userData)  // 이메일 회원가입
  signOut()                     // 로그아웃
  onAuthStateChange(callback)   // 인증 상태 변경 리스너
}
```

### 6.5 database.campaigns - 캠페인 API

```javascript
database.campaigns = {
  getAll()          // 전체 캠페인 조회 (최신순)
  getActive()       // status='active'인 캠페인만 조회
  getById(id)       // 특정 캠페인 조회
  create(data)      // 캠페인 생성
  update(id, data)  // 캠페인 수정
  delete(id)        // 캠페인 삭제
}
```

### 6.6 database.applications - 신청 API

**중요**: `applications`와 `campaign_applications` 두 테이블을 폴백 구조로 사용합니다.
- `getAll()`, `getByUser()`, `create()`, `updateStatus()`, `update()`: `applications` 테이블 우선 → 실패 시 `campaign_applications` 폴백
- `requestPoints()`: `campaign_applications` 테이블 직접 사용

**주의 (코드 버그)**: `getByCampaign()`이 코드 내에서 **2번 정의**되어 있습니다. 뒤의 정의(line ~626)가 앞(line ~392)을 덮어씁니다. 실제로는 `campaign_applications` 테이블을 직접 조회합니다.

```javascript
database.applications = {
  getAll()                            // 전체 신청 조회 (applications → user_profiles, campaigns 병합)
  getByUser(userId)                   // 사용자별 신청 조회 (applications 우선 → campaign_applications 폴백)
  getByCampaign(campaignId)           // ⚠️ 실제로는 campaign_applications 테이블 직접 조회 (중복정의 덮어쓰기)
  getByUserAndCampaign(userId, cId)   // 특정 사용자의 특정 캠페인 신청 확인 (applications 테이블)
  create(data)                        // 신청 생성 (applications 테이블)
  updateStatus(id, status)            // 상태 업데이트 + 타임스탬프 자동 관리 (applications → campaign_applications 폴백)
  update(id, data)                    // 신청 정보 업데이트 (applications → campaign_applications 폴백)
  requestPoints(id)                   // 포인트 요청 (campaign_applications 테이블 직접)
}
```

**신청 상태(status) 흐름:**
```
pending → virtual_selected → approved → (콘텐츠 제작) → sns_submitted → points_requested → completed
                           → rejected
```

**updateStatus 시 자동 타임스탬프:**
- `virtual_selected` → `virtual_selected_at` 기록
- `approved` → `approved_at` 기록
- `rejected` → `rejected_at` 기록
- `pending` (되돌림) → 모든 타임스탬프 초기화

### 6.7 database.userProfiles - 사용자 프로필 API

```javascript
database.userProfiles = {
  get(userId)           // user_id로 프로필 조회
  getById(id)           // PK id로 프로필 조회
  getAll()              // 전체 프로필 조회 (관리자용)
  upsert(profileData)   // 프로필 생성 또는 업데이트
  update(userId, data)  // 프로필 업데이트 (user_id 우선, 실패 시 id로 재시도)
}
```

### 6.8 database.users - 사용자 별칭 API

```javascript
database.users = {
  getAll()  // database.userProfiles.getAll()의 별칭 (단순 래퍼)
}
```

### 6.9 database.emailTemplates - 이메일 템플릿 API

```javascript
database.emailTemplates = {
  getAll()              // 전체 템플릿 조회 (template_type 정렬)
  getById(id)           // 특정 템플릿 조회
  create(data)          // 템플릿 생성
  upsert(data)          // 템플릿 생성/업데이트
  update(id, data)      // 템플릿 수정
  delete(id)            // 템플릿 삭제
  getByCategory(cat)    // 카테고리별 조회
}
```

### 6.10 database.withdrawals - 출금 API

```javascript
database.withdrawals = {
  getAll()    // 전체 출금 요청 조회 (user_profiles 조인)
  getByUser(userId)  // 사용자별 출금 내역 조회
  create(data)       // 출금 신청 (withdrawal_requests 테이블)
  updateStatus(id, status, processedBy, notes)  // 출금 상태 업데이트
}
```

**출금 상태 흐름:**
```
pending → completed (승인/입금완료)
       → rejected  (거부)
```

### 6.11 database.userPoints - 포인트 API

```javascript
database.userPoints = {
  getUserTotalPoints(userId)  // 총 보유 포인트 (트랜잭션 합계 계산)
  getUserPoints(userId)       // 포인트 내역 조회
  deductPoints(userId, amount, reason)  // 포인트 차감 (음수 트랜잭션 추가)
}
```

**포인트 시스템:**
- `point_transactions` 테이블 사용
- 양수(+) = 적립, 음수(-) = 차감
- 총 포인트 = 모든 트랜잭션 amount의 합계

### 6.12 storage - 파일 업로드 API

```javascript
export const storage = {
  uploadCampaignImage(file)        // 캠페인 이미지 업로드 → 공개 URL 반환
  deleteCampaignImage(filePath)    // 업로드된 이미지 삭제
}
```
- Storage 버킷: `campaign-images`
- 파일 경로: `campaigns/{timestamp}-{random}.{ext}`

---

## 7. 데이터베이스 스키마 (Supabase PostgreSQL)

### 7.1 주요 테이블

| 테이블명 | 설명 |
|----------|------|
| `campaigns` | 캠페인 정보 (제목, 브랜드, 보상, 기간, 상태 등) |
| `applications` | 캠페인 신청 (주 사용 테이블) |
| `campaign_applications` | 캠페인 신청 (백업/폴백 테이블) |
| `user_profiles` | 사용자 상세 프로필 (SNS, 피부타입, 주소, 은행정보 등) |
| `withdrawal_requests` | 출금 요청 |
| `point_transactions` | 포인트 거래 내역 (적립/차감) |
| `email_templates` | 이메일 템플릿 |
| `email_logs` | 이메일 발송 기록 |
| `email_schedules` | 예약 이메일 스케줄 |
| `video_submissions` | 영상 제출 정보 |

### 7.2 campaigns 테이블 주요 컬럼

```
id                UUID (PK)
title             VARCHAR       - 캠페인 제목
brand             VARCHAR       - 브랜드명
description       TEXT          - 설명
status            VARCHAR       - 상태 (draft/active/closed/completed)
reward_amount     INT           - 보상 금액 (엔)
start_date        TIMESTAMP     - 시작일
end_date          TIMESTAMP     - 종료일 (마감일)
deadline          TIMESTAMP     - 콘텐츠 제출 마감일
image_url         TEXT          - 캠페인 이미지 URL
google_drive_link TEXT          - Google Drive 링크
google_slides_link TEXT         - Google Slides 링크
guide_type        VARCHAR       - 가이드 유형
guide_pdf_url     TEXT          - 가이드 PDF URL
requirements      TEXT          - 요구사항
hashtags          TEXT          - 필수 해시태그
questions         JSONB         - 맞춤 질문 목록
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### 7.3 applications 테이블 주요 컬럼

```
id                 UUID (PK)
user_id            UUID (FK → auth.users)
campaign_id        UUID (FK → campaigns)
status             VARCHAR    - 신청 상태
applicant_name     VARCHAR    - 신청자 이름
age                VARCHAR    - 나이
skin_type          VARCHAR    - 피부 타입
instagram_url      TEXT       - 인스타그램 URL
tiktok_url         TEXT       - 틱톡 URL
youtube_url        TEXT       - 유튜브 URL
other_sns_url      TEXT       - 기타 SNS URL
bio                TEXT       - 자기소개
answers            JSONB      - 맞춤 질문 답변
sns_urls           JSONB      - SNS 업로드 URL
video_url          TEXT       - 영상 URL
submission_status  VARCHAR    - 제출 상태
google_drive_link  TEXT       - 개인 Google Drive 링크
google_slides_link TEXT       - 개인 Google Slides 링크
shipping_address   TEXT       - 배송지 주소
tracking_number    VARCHAR    - 배송 추적번호
shipping_status    VARCHAR    - 배송 상태
points_requested   BOOLEAN    - 포인트 요청 여부
virtual_selected_at TIMESTAMP - 가선정 시각
approved_at        TIMESTAMP  - 승인 시각
rejected_at        TIMESTAMP  - 거부 시각
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### 7.4 user_profiles 테이블 주요 컬럼

```
id                UUID (PK)
user_id           UUID (FK → auth.users, UNIQUE)
email             VARCHAR    - 이메일
name              VARCHAR    - 이름
nickname          VARCHAR    - 닉네임
age               VARCHAR    - 나이
gender            VARCHAR    - 성별
phone             VARCHAR    - 전화번호
bio               TEXT       - 자기소개
role              VARCHAR    - 역할 ('user' | 'admin')
is_admin          BOOLEAN    - 관리자 여부
is_approved       BOOLEAN    - 승인 여부
approval_status   VARCHAR    - 승인 상태

# SNS 정보
instagram_url     TEXT
youtube_url       TEXT
tiktok_url        TEXT
other_sns_url     TEXT

# 뷰티 프로필 (일본 시장 특화)
skin_type         VARCHAR    - 피부 타입
skin_shade        VARCHAR    - 피부 밝기
personal_color    VARCHAR    - 퍼스널 컬러
hair_type         VARCHAR    - 모발 타입
skin_concerns     TEXT[]     - 피부 고민 (다중)
hair_concerns     TEXT[]     - 모발 고민 (다중)
primary_interest  VARCHAR    - 주요 콘텐츠 분야
editing_level     VARCHAR    - 편집 능력
shooting_level    VARCHAR    - 촬영 능력
follower_range    VARCHAR    - 팔로워 규모
upload_frequency  VARCHAR    - 업로드 빈도
video_styles      TEXT[]     - 영상 스타일 (다중)

# 배송 정보
postcode          VARCHAR    - 우편번호
prefecture        VARCHAR    - 도도부현
address           TEXT       - 주소
detail_address    TEXT       - 상세 주소

# 은행 정보 (일본 은행 송금)
bank_name         VARCHAR    - 은행명
branch_code       VARCHAR    - 지점 코드
account_type      VARCHAR    - 계좌 종별 (futsu/touza)
account_number    VARCHAR    - 계좌번호
account_holder    VARCHAR    - 예금주

created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### 7.5 withdrawal_requests 테이블

```
id              UUID (PK)
user_id         UUID (FK → user_profiles)
amount          INT        - 출금 금액 (엔)
status          VARCHAR    - 상태 (pending/completed/rejected)
withdrawal_method VARCHAR  - 출금 방법 (bank_transfer)
paypal_email    VARCHAR    - PayPal 이메일 (레거시)
paypal_name     VARCHAR    - PayPal 이름 (레거시)
reason          TEXT       - 신청 사유
notes           TEXT       - 관리자 메모
processed_by    UUID       - 처리 관리자
processed_at    TIMESTAMP  - 처리 시각
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### 7.6 point_transactions 테이블

```
id                UUID (PK)
user_id           UUID (FK)
amount            INT        - 금액 (+적립, -차감)
transaction_type  VARCHAR    - 거래 유형 (admin_add 등)
description       TEXT       - 설명
created_at        TIMESTAMP
```

### 7.7 보안: Row Level Security (RLS)

모든 테이블에 RLS가 활성화되어 있습니다:
- 일반 사용자: 자기 데이터만 읽기/쓰기 가능
- 관리자 (role='admin' 또는 is_admin=true): 모든 데이터 접근 가능
- 익명: campaigns 테이블만 읽기 가능 (공개 캠페인 조회)

---

## 8. 인증 시스템

### 8.1 인증 흐름

```
[회원가입] → Supabase Auth signUp → 이메일 인증 → user_profiles 자동 생성
[로그인]   → Google OAuth / Email+Password → 세션 유지 (autoRefreshToken)
[로그아웃] → 쿠키/스토리지 전체 정리 → 홈으로 리다이렉트
```

### 8.2 관리자 확인 (ProtectedRoute)

관리자 페이지 접근 시 3단계 확인:
1. `AuthContext.userProfile`에서 `role === 'admin'` 또는 `is_admin === true` 확인
2. `user_profiles` 테이블에서 `user_id`로 조회
3. `user_profiles` 테이블에서 `email`로 조회 (백업)

---

## 9. 이메일 시스템

### 9.1 자동 이메일 유형 (emailService.js)

| 코드 | 발송 시점 | 제목 |
|------|-----------|------|
| `SIGNUP_COMPLETE` | 회원가입 완료 | 会員登録が完了しました |
| `APPLICATION_SUBMITTED` | 캠페인 신청 | キャンペーン応募を受け付けました |
| `APPLICATION_APPROVED` | 캠페인 승인 | キャンペーン参加が確定しました！ |
| `GUIDE_DELIVERED` | 가이드 자료 전달 | キャンペーンガイドをお送りします |
| `DEADLINE_REMINDER_3DAYS` | 마감 3일 전 | 投稿締切まで3日です |
| `DEADLINE_REMINDER_1DAY` | 마감 1일 전 | 投稿締切まで1日です |
| `DEADLINE_TODAY` | 마감 당일 | 本日が投稿締切日です！ |
| `POINT_REQUEST_SUBMITTED` | 포인트 신청 | ポイント申請を受け付けました |
| `POINT_TRANSFER_COMPLETED` | 입금 완료 | ポイント入金が完了しました！ |

### 9.2 발송 방식

1. Gmail SMTP 설정이 있으면 실제 발송
2. 설정이 없으면 콘솔 로그만 출력
3. 모든 발송은 `email_logs` 테이블에 기록

### 9.3 마감일 자동 알림 (emailScheduler.js)

- `EmailScheduler` 클래스 (싱글톤)
- App 시작 시 `start()` → 24시간 간격 실행
- 활성 캠페인의 마감일 확인 → 3일전/2일전/1일전/당일 알림
- **영상 제출 완료된 사용자에게는 알림을 보내지 않음**

---

## 10. 다국어 시스템 (i18n)

### 10.1 LanguageContext (간단한 번역)

- `ko`, `ja` 2개 언어
- 키-값 기반 단순 번역 (네비게이션, 공통 UI 텍스트)

### 10.2 i18n.js (상세 번역)

- `ko`, `ja`, `en` 3개 언어
- 중첩 키 지원 (`companyReport.title` → "キャンペーンレポート")
- 파라미터 치환 지원 (`{name}` → 실제 값)
- 보고서, 관리자 페이지 등 상세 텍스트에 사용

---

## 11. 뷰티 프로필 상수 (`constants/beautyProfileOptions.js`)

일본 시장에 특화된 크리에이터 프로필 옵션들:

### 단일 선택 (Single Select)
- **SKIN_TYPES**: 피부 타입 (건성/지성/복합/민감/보통)
- **SKIN_SHADES**: 피부 밝기 (ファンデーション 기준)
- **PERSONAL_COLORS**: 퍼스널 컬러 (이에베춘/블루베여름/이에베가을/블루베겨울)
- **HAIR_TYPES**: 모발 타입
- **PRIMARY_INTERESTS**: 주요 콘텐츠 분야 (스킨케어/메이크업/패션 등)
- **EDITING_LEVELS**: 편집 능력 (초급/중급/상급)
- **SHOOTING_LEVELS**: 촬영 능력
- **FOLLOWER_RANGES**: 팔로워 규모 (1K~10K / 10K~100K / 100K~1M / 1M+)
- **UPLOAD_FREQUENCIES**: 업로드 빈도
- **GENDERS**: 성별
- **VIDEO_LENGTH_STYLES**: 영상 길이 스타일
- **REVIEW_PLATFORM_OPTIONS**: @cosme/LIPS 리뷰 가능 여부

### 다중 선택 (Multi Select)
- **SKIN_CONCERNS**: 피부 고민 (여드름/모공/시미 등)
- **HAIR_CONCERNS**: 모발 고민
- **DIET_CONCERNS**: 다이어트/바디 고민
- **CONTENT_FORMATS**: 콘텐츠 형식 (Shorts/Reels/피드/라이브 등)
- **COLLABORATION_PREFERENCES**: 협업 희망 유형
- **VIDEO_STYLES**: 영상 스타일

### 일본 특화 데이터
- **JAPAN_BANKS**: 일본 주요 은행 목록 (13개)
- **ACCOUNT_TYPES**: 계좌 종별 (普通/当座)
- **PREFECTURES**: 47 도도부현

### 등급 시스템
```
1: FRESH (フレッシュ) - 시작 단계
2: GLOW (グロウ) - 성장 단계
3: BLOOM (ブルーム) - 성숙 단계
4: ICONIC (アイコニック) - 브랜드 지명
5: MUSE (ミューズ) - 최고 등급
```

### 캠페인 타입
- `regular`: 通常キャンペーン (일반 상품 PR)
- `review_challenge`: レビューチャレンジ (@cosme/LIPS 연동)
- `drugstore`: ドラッグストアキャンペーン (매장 연동)
- `cnec_plus`: CNEC Plus (장기 앰버서더)

---

## 12. 핵심 비즈니스 워크플로우

### 12.1 크리에이터 (사용자) 워크플로우

```
1. 회원가입 (Google/이메일)
   └→ user_profiles 자동 생성
   └→ SIGNUP_COMPLETE 이메일 발송
   └→ LINE 친구추가 안내

2. 프로필 완성
   └→ 기본정보 (이름, 나이, SNS)
   └→ 뷰티 프로필 (피부타입, 콘텐츠 스타일 등)
   └→ 배송정보 (일본 주소, 우편번호)
   └→ 은행정보 (일본 은행 계좌)

3. 캠페인 신청
   └→ 홈페이지에서 활성 캠페인 확인
   └→ 캠페인 상세 확인 후 신청
   └→ 맞춤 질문 답변
   └→ applications 테이블에 status='pending'으로 생성
   └→ APPLICATION_SUBMITTED 이메일 발송

4. 선정 대기
   └→ 관리자 가선정 → status='virtual_selected'
   └→ 관리자 최종확정 → status='approved'
   └→ APPLICATION_APPROVED 이메일 발송 + 마감일 알림 스케줄

5. 콘텐츠 제작
   └→ Google Drive/Slides 자료 확인
   └→ 상품 수령 (배송 추적)
   └→ 가이드라인에 따라 영상 제작
   └→ 마감일 3일전/1일전/당일 리마인더 수신

6. SNS 업로드 보고
   └→ SNS에 영상 업로드
   └→ 마이페이지에서 URL 제출
   └→ status='sns_submitted'

7. 보상 수령
   └→ 포인트 요청 → points_requested=true
   └→ 관리자 포인트 지급 (point_transactions에 +금액)
   └→ 출금 신청 (withdrawal_requests 생성)
   └→ 관리자 출금 처리 → 일본 은행 계좌로 송금
```

### 12.2 관리자 워크플로우

```
1. 대시보드 확인
   └→ 총 캠페인/신청/사용자/보상 통계

2. 캠페인 관리
   └→ 캠페인 생성 (한국어 입력 → 일본어 번역 기능)
   └→ 맞춤 질문 설정
   └→ 이미지 업로드 (Supabase Storage)
   └→ Google Drive/Slides 링크 설정
   └→ 상태 관리 (draft/active/closed/completed)

3. 신청자 관리
   └→ 캠페인별 신청자 목록 확인
   └→ 2단계 선정: 가선정(virtual_selected) → 최종확정(approved)
   └→ 거부(rejected) 처리
   └→ 엑셀 다운로드

4. 확정 크리에이터 관리
   └→ 배송 정보 입력 (추적번호, 발송일)
   └→ Google Drive 자료 공유

5. SNS 업로드 확인
   └→ 크리에이터 제출 URL 확인
   └→ 콘텐츠 품질 확인

6. 포인트/출금 관리
   └→ 포인트 지급 (point_transactions 추가)
   └→ 출금 요청 승인/거부
   └→ 송금 처리 기록

7. 보고서
   └→ 캠페인별 성과 보고서
   └→ 기업 보고서 (외부 접근 가능)

8. 시스템 설정
   └→ Gmail SMTP 설정
   └→ 이메일 템플릿 편집
   └→ 사용자 승인 관리
```

---

## 13. 주요 컴포넌트 상세

### 13.1 사용자 컴포넌트

| 파일 | 역할 |
|------|------|
| `HomePageJP.jsx` | 메인 홈페이지 - 활성 캠페인 카드 목록, 히어로 섹션, 가이드 버튼 |
| `CampaignApplicationUpdated.jsx` | 캠페인 신청 폼 - 맞춤 질문, 개인정보 입력 |
| `MyPageWithWithdrawal.jsx` | 마이페이지 - 캠페인 진행상황, 포인트 잔액, 출금 기능 통합 |
| `CampaignWorkflowCard.jsx` | 마이페이지 내 캠페인별 워크플로우 진행 카드 |
| `ProfileSettings.jsx` | 프로필 설정 - 기본정보, SNS, 배송지 |
| `ProfileSettingsBeauty.jsx` | 뷰티 프로필 상세 설정 (beautyProfileOptions 사용) |
| `VideoUploadModal.jsx` | 영상 업로드 모달 |
| `WithdrawalModal.jsx` | 출금 신청 모달 |
| `JapanWithdrawalRequest.jsx` | 일본 은행 송금 출금 신청 |
| `LoginPageExactReplica.jsx` | 로그인 페이지 (Google + 이메일) |
| `SignupPageExactReplica.jsx` | 회원가입 페이지 |
| `AuthCallbackSafe.jsx` | OAuth 콜백 처리 (에러 핸들링 포함) |
| `ProtectedRoute.jsx` | 인증/관리자 권한 가드 컴포넌트 |
| `CampaignGuide.jsx` | 캠페인 참여 가이드 페이지 |
| `HolidayNoticePopup.jsx` | 휴일 안내 팝업 (24시간 닫기 옵션) |
| `LineRegistrationBanner.jsx` | LINE 친구추가 안내 배너 |
| `ShootingGuideModal.jsx` | 촬영 가이드 모달 |

### 13.2 관리자 컴포넌트 (`components/admin/`)

| 파일 | 역할 |
|------|------|
| `AdminDashboardSimple.jsx` | 관리자 대시보드 - 통계, 차트 |
| `AdminCampaignsWithQuestions.jsx` | 캠페인 관리 - CRUD, 맞춤 질문 설정 |
| `CampaignCreationWithTranslator.jsx` | 캠페인 생성 - 한→일 번역 기능 |
| `ApplicationsReportSimple_final.jsx` | 신청 관리 - 목록, 상세보기, 상태 변경 |
| `AdminConfirmedCreators.jsx` | 확정 크리에이터 관리 |
| `ConfirmedCreatorsNew.jsx` | 캠페인별 확정 크리에이터 상세 |
| `SNSUploadNew.jsx` | SNS 업로드 관리 |
| `CampaignReportEnhanced.jsx` | 캠페인 보고서 (차트, 통계) |
| `CompanyReport_multilingual.jsx` | 기업 보고서 (다국어) |
| `EmailTemplateManager.jsx` | 이메일 템플릿 CRUD |
| `EmailSettings.jsx` | 이메일 발송 설정 (SMTP) |
| `UserApprovalManagerEnhanced.jsx` | 사용자 승인 관리 |
| `AdminWithdrawals.jsx` | 출금 관리 |
| `SystemSettings.jsx` | 시스템 설정 |
| `AdminHeader.jsx` | 관리자 페이지 공통 헤더 |
| `AdminNavigation.jsx` | 관리자 페이지 네비게이션 |
| `DriveModal.jsx` | Google Drive 링크 설정 모달 |
| `CreatorMaterialsManager.jsx` | 크리에이터 자료 관리 |

### 13.3 UI 컴포넌트 (`components/ui/`)

shadcn/ui 기반 공통 컴포넌트 (Radix UI 원시 컴포넌트 래핑, 총 46개):
- accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb
- button, calendar, card, carousel, chart, checkbox
- collapsible, command, context-menu, dialog, drawer
- dropdown-menu, form, hover-card, input, input-otp
- label, menubar, navigation-menu, pagination, popover
- progress, radio-group, resizable, scroll-area, select
- separator, sheet, sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea, toggle, toggle-group, tooltip

---

## 14. Netlify Functions (서버리스 백엔드)

`netlify/functions/` 디렉토리에 위치합니다.

### 14.1 send-gmail.js

Gmail SMTP를 통한 이메일 발송 서버리스 함수입니다.

**엔드포인트**: `POST /.netlify/functions/send-gmail`

**요청 본문:**
```json
{
  "emailSettings": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587",
    "smtpUser": "your@gmail.com",
    "smtpPass": "앱 비밀번호",
    "senderName": "CNEC Japan",
    "senderEmail": "your@gmail.com",
    "replyEmail": "support@cnec.jp"
  },
  "testEmail": "recipient@example.com",
  "subject": "이메일 제목",
  "message": "<html>이메일 내용</html>"
}
```

**기술 구현:**
- Nodemailer 사용
- CORS 처리 (preflight OPTIONS 대응)
- Gmail 2단계 인증 + 앱 비밀번호 방식
- 포트 465=SSL, 587=TLS 자동 전환
- 상세 에러 코드별 한국어 메시지 제공 (EAUTH, ECONNECTION, 535)

### 14.2 send-email.js

범용 이메일 발송 함수 (send-gmail의 일반화 버전)

---

## 15. 빌드 및 배포

### 15.1 Vite 설정 (vite.config.js)

```javascript
{
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": "./src" } },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', ...],
          utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
          icons: ['lucide-react']
        }
      }
    }
  }
}
```

### 15.2 배포

- **플랫폼**: Netlify
- **빌드 명령**: `vite build`
- **출력 디렉토리**: `dist`
- **SPA 리다이렉트**: 모든 경로 → `index.html` (Netlify `_redirects` 파일)

### 15.3 실행 명령

```bash
pnpm dev        # 개발 서버 (localhost:5173)
pnpm build      # 프로덕션 빌드
pnpm preview    # 빌드 결과 미리보기
pnpm lint       # ESLint 실행
```

---

## 16. 상태 관리 시스템

이 플랫폼에서는 **2가지 별도의 상태 시스템**이 존재합니다.

### 16.1 applications.status - 신청/선정 상태 (관리자 관리)

`applications` 테이블의 `status` 컬럼. 관리자가 신청자를 선정하는 과정에서 사용됩니다.
`supabase.js`의 `updateStatus()` 함수에서 관리합니다.

```
┌─────────────┐
│   pending    │  신청 접수 (審査中)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ virtual_selected │  가선정 (仮選定) → virtual_selected_at 타임스탬프
└──────┬──────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐     ┌──────────┐
│   approved   │     │ rejected │  거부 (拒否) → rejected_at
│ (확정/承認)  │     └──────────┘
│ → approved_at│
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ video_submitted   │  영상 제출
└──────┬───────────┘
       │
       ▼
┌─────────────────┐
│ sns_submitted    │  SNS URL 제출
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   completed      │  최종 완료
└─────────────────┘
```

**MyPageWithWithdrawal.jsx에서 사용하는 추가 상태값:**
- `selected` (= approved와 동의어)
- `filming` (촬영중)

### 16.2 workflow_status - 워크플로우 진행 상태 (CampaignWorkflowCard)

`CampaignWorkflowCard.jsx`에서 사용하는 **UI 워크플로우 상태**입니다.
승인(approved) 이후 크리에이터의 작업 진행 단계를 세분화합니다.

```
┌──────────────┐
│ guide_pending │  ガイド確認 (가이드 확인 대기) ← 기본값
└──────┬───────┘
       ▼
┌────────────────┐
│ guide_confirmed │  ガイド確認済 (가이드 확인 완료)
└──────┬─────────┘
       ▼
┌─────────────────┐
│ video_uploading  │  動画アップロード中 (업로드 중)
└──────┬──────────┘
       ▼
┌────────────────┐
│ video_uploaded  │  動画アップロード済 (업로드 완료)
└──────┬─────────┘
       ▼
┌──────────────┐
│ sns_pending   │  SNS投稿待ち (SNS 공유 대기)
└──────┬───────┘
       ▼
┌────────────────┐
│ sns_submitted   │  SNS提出済み (SNS 제출 완료)
└──────┬─────────┘
       ▼
┌────────────────┐
│ review_pending  │  レビュー待ち (검토 대기)
└──────┬─────────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌────────────────────┐  ┌─────────────┐
│ revision_required   │  │  completed   │  完了
│ (修正必要 - 수정)  │  └──────┬──────┘
└─────────┬──────────┘         ▼
          │               ┌─────────────┐
          └──→ (재제출) → │ points_paid  │  ポイント支給済み
                          └─────────────┘
```

---

## 17. 알려진 이슈 및 기술 부채

1. **중복 테이블**: `applications`와 `campaign_applications` 두 테이블이 혼재 → 폴백 로직으로 처리 중
2. **getByCampaign 중복 정의**: `database.applications.getByCampaign()`이 supabase.js에서 2번 정의됨. 뒤의 정의가 앞을 덮어써서, 의도와 달리 `campaign_applications`를 직접 조회
3. **백업 파일 다수**: `_backup`, `_fixed`, `_old` 등 사용하지 않는 파일이 컴포넌트 폴더에 다수 존재 (64개 사용자 컴포넌트 중 절반 이상이 레거시)
4. **출금 방식 변경**: PayPal → 일본 은행 송금으로 전환했으나, `withdrawals.create()` 함수 내 `withdrawal_method: 'paypal'` 하드코딩 잔존
5. **이메일 발송**: 클라이언트 사이드에서 처리 (보안 개선 필요)
6. **emailScheduler**: 브라우저 기반 스케줄러 (24시간 간격) → 서버사이드(Edge Function)로 이전 권장
7. **사용자 라우트 보호 미비**: `/mypage`, `/profile`, `/campaign-application` 등이 ProtectedRoute로 감싸져 있지 않음 (컴포넌트 내부에서만 인증 확인)

---

## 18. 환경변수 목록

```env
# 필수
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 선택 (Gmail SMTP - localStorage로도 관리)
# 시스템 설정 페이지에서 관리자가 입력
```

---

## 19. 주요 파일 경로 요약

코드 수정 시 참고할 핵심 파일들:

```
src/App.jsx                              # 라우팅 정의
src/lib/supabase.js                      # 모든 DB API (가장 중요)
src/contexts/AuthContext.jsx             # 인증 상태관리
src/contexts/LanguageContext.jsx         # 다국어 상태관리
src/lib/emailService.js                  # 이메일 템플릿 + 발송
src/lib/emailScheduler.js               # 마감 알림 스케줄러
src/lib/i18n.js                          # 상세 번역 데이터
src/constants/beautyProfileOptions.js    # 프로필 상수
src/components/ProtectedRoute.jsx        # 인증/관리자 가드
src/components/HomePageJP.jsx            # 메인 홈페이지
src/components/MyPageWithWithdrawal.jsx  # 마이페이지
src/components/CampaignApplicationUpdated.jsx  # 캠페인 신청
vite.config.js                           # 빌드 설정
package.json                             # 의존성
```
