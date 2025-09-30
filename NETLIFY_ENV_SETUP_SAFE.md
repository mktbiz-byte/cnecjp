# Netlify 환경변수 설정 가이드 (안전 버전)

## 문제 상황
- 사이트가 빈 화면으로 표시됨
- Netlify 빌드는 성공하지만 React 앱이 Supabase에 연결할 수 없음

## 해결 방법

### 1. Netlify 환경변수 설정

다음 2개의 환경변수를 Netlify에 추가해야 합니다:

**변수 1:**
- 이름: `VITE_SUPABASE_URL`
- 값: `https://psfwmzlnaboattocyupu.supabase.co`

**변수 2:**
- 이름: `VITE_SUPABASE_ANON_KEY`
- 값: [Supabase 대시보드 → Project Settings → API Keys에서 anon public 키 복사]

### 2. Supabase에서 API 키 가져오는 방법

1. **Supabase 대시보드** 접속
2. **cnec-japan-platform** 프로젝트 선택
3. **Project Settings** → **API Keys** 메뉴
4. **anon public** 키의 **Copy** 버튼 클릭
5. 복사한 키를 Netlify 환경변수에 사용

### 3. Netlify에서 설정하는 방법

1. **Netlify 대시보드** 접속
2. **cnec-japan-platform** 사이트 선택
3. **Site settings** 클릭
4. 좌측 메뉴에서 **Environment variables** 클릭
5. **Add variable** 버튼 클릭
6. 위의 2개 변수를 각각 추가
7. **Deploy** 다시 실행

### 4. 확인 방법

환경변수 설정 후 재배포가 완료되면:
- https://cnec.jp 접속
- 정상적인 사이트 화면이 표시됨
- 회원가입/로그인 기능 정상 작동

## 보안 주의사항

⚠️ **중요:** API 키는 절대 GitHub이나 공개 저장소에 업로드하지 마세요!
- 환경변수는 Netlify에서만 설정
- 코드에는 환경변수 이름만 사용
- 실제 키 값은 안전한 곳에 보관
