# CNEC 캠페인 플랫폼 프로젝트 분석

## 프로젝트 개요
- **프로젝트명**: CNEC Campaign Platform
- **기술 스택**: React + Vite + Supabase
- **패키지 매니저**: pnpm
- **UI 라이브러리**: Radix UI + Tailwind CSS

## 주요 API 구조

### Supabase 클라이언트 (`src/lib/supabase.js`)
메인 API 클라이언트 파일로, 다음과 같은 기능을 제공합니다:

#### 1. 인증 관련 API (`auth`)
- `getCurrentUser()`: 현재 사용자 정보 가져오기
- `getSession()`: 세션 정보 가져오기
- `signInWithGoogle()`: 구글 OAuth 로그인
- `signInWithEmail()`: 이메일/패스워드 로그인
- `signUpWithEmail()`: 이메일 회원가입
- `signOut()`: 로그아웃
- `onAuthStateChange()`: 인증 상태 변경 리스너

#### 2. 캠페인 관련 API (`database.campaigns`)
- `getAll()`: 모든 캠페인 조회
- `getActive()`: 활성 캠페인만 조회
- `getById(id)`: 특정 캠페인 조회
- `create(campaignData)`: 캠페인 생성
- `update(id, updates)`: 캠페인 수정
- `delete(id)`: 캠페인 삭제

#### 3. 신청 관련 API (`database.applications`)
- `getAll()`: 모든 신청 조회 (캠페인 정보 포함)
- `getByUser(userId)`: 사용자별 신청 조회
- `getByCampaign(campaignId)`: 캠페인별 신청 조회
- `getByUserAndCampaign(userId, campaignId)`: 특정 사용자의 특정 캠페인 신청 확인
- `create(applicationData)`: 신청 생성
- `updateStatus(id, status)`: 신청 상태 업데이트
- `updateSnsUrls(id, snsUrls)`: SNS URL 업데이트
- `update(id, updateData)`: 신청 정보 업데이트
- `requestPoints(id)`: 포인트 요청

#### 4. 사용자 프로필 API (`database.userProfiles`)
- `get(userId)`: 사용자 프로필 조회
- `getById(id)`: ID로 프로필 조회
- `getAll()`: 모든 프로필 조회 (관리자용)
- `upsert(profileData)`: 프로필 생성/업데이트
- `update(userId, updateData)`: 프로필 업데이트

#### 5. 이메일 템플릿 API (`database.emailTemplates`)
- `getAll()`: 모든 템플릿 조회
- `getById(id)`: 특정 템플릿 조회
- `create(templateData)`: 템플릿 생성
- `upsert(templateData)`: 템플릿 생성/업데이트
- `update(id, updates)`: 템플릿 업데이트
- `delete(id)`: 템플릿 삭제
- `getByCategory(category)`: 카테고리별 템플릿 조회

## 주요 특징

### 1. 네트워크 안정성
- 재시도 로직이 포함된 `safeQuery` 함수 구현
- 30초 타임아웃 설정
- 권한 오류 시 빈 결과 반환으로 안정성 확보

### 2. 권한 관리
- RLS(Row Level Security) 권한 오류 처리
- 권한 부족 시 빈 배열/null 반환으로 UI 안정성 확보

### 3. 환경 설정
- Supabase URL과 키는 환경변수로 관리
- 기본값으로 하드코딩된 값 사용 (개발용)

## 개발 환경 준비 완료

### 1. 리포지토리 클론 완료
- GitHub 토큰을 사용한 인증 설정
- 프로젝트 파일 다운로드 완료

### 2. 의존성 설치 완료
- pnpm을 사용한 패키지 설치 완료
- 모든 필요한 라이브러리 준비됨

### 3. Git 설정 완료
- 토큰 기반 인증 구성
- 수정 사항 커밋/푸시 준비 완료

## 수정 가능한 영역

### API 수정 시 주의사항
1. **UI 최소 변경**: 기존 컴포넌트에서 사용하는 API 인터페이스 유지
2. **하위 호환성**: 기존 함수 시그니처 변경 시 기존 코드 영향 검토 필요
3. **에러 처리**: 기존의 안전한 에러 처리 로직 유지
4. **권한 처리**: RLS 권한 오류에 대한 안전한 처리 유지

### 주요 수정 대상 파일
- `src/lib/supabase.js`: 메인 API 클라이언트
- `src/assets/supabase-client-*.js`: 추가 클라이언트 파일들
- 환경변수 설정 (`.env` 파일)

## 다음 단계
프로젝트 분석이 완료되었으며, API 수정을 위한 모든 준비가 완료되었습니다. 구체적인 수정 요구사항을 제시해주시면 해당 API를 안전하게 수정할 수 있습니다.
