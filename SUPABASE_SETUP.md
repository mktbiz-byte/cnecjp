
# Supabase 설정 가이드

이 가이드는 CNEC 캠페인 플랫폼을 위한 Supabase 프로젝트 설정 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/)에 로그인하여 새 프로젝트를 생성합니다.
2. 프로젝트 이름과 데이터베이스 비밀번호를 설정하고, 리전을 선택합니다. (예: Northeast Asia - Tokyo)

## 2. 데이터베이스 테이블 생성

프로젝트의 `database_schema.sql` 파일에 있는 SQL 쿼리를 Supabase 대시보드의 **SQL Editor**에서 실행하여 필요한 모든 테이블과 관계를 생성합니다.

## 3. 인증(Authentication) 설정

### Google Provider 활성화

1. **Authentication > Providers**로 이동하여 Google을 활성화합니다.
2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID와 시크릿을 생성하고, Supabase에 입력합니다.
3. **Authorized redirect URIs**에 다음 URL을 추가합니다:
   `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`

### 이메일 템플릿

**Authentication > Email Templates**에서 "Confirm signup", "Reset password" 등의 이메일 템플릿을 필요에 맞게 수정할 수 있습니다.

## 4. Row Level Security (RLS) 정책

보안을 위해 각 테이블에 RLS 정책을 설정해야 합니다. `database_rls.sql` 파일의 쿼리를 **SQL Editor**에서 실행하여 모든 RLS 정책을 적용합니다.

## 5. API 키 확인

**Project Settings > API**에서 `Project URL`과 `anon` `public` 키를 확인합니다. 이 값들은 `.env` 파일에 사용됩니다.

## 6. Webhooks 설정 (선택사항)

사용자 가입 시 프로필 자동 생성 등을 위해 **Database > Webhooks**를 설정할 수 있습니다.

---

이제 Supabase 프로젝트가 CNEC 플랫폼과 연동될 준비가 완료되었습니다.

