'''
# CNEC K-Beauty 인플루언서 마케팅 플랫폼

이 프로젝트는 일본 시장을 타겟으로 하는 K-Beauty 인플루언서 마케팅 플랫폼입니다. React, Supabase, Tailwind CSS를 사용하여 제작되었으며, 사용자 등록부터 캠페인 지원, 포인트 관리, 최종 보고서 생성까지 완전한 워크플로우를 제공합니다.

## ✨ 주요 기능

- **캠페인 관리**: 캠페인 생성, 수정, 질문 설정, 상태 관리
- **사용자 시스템**: 이메일/Google 로그인, 프로필 관리, 관리자 승인
- **신청 및 선정**: 맞춤 질문, 2단계 선정 프로세스 (가상 → 최종)
- **포인트 시스템**: SNS 업로드 완료 시 포인트 지급 및 일본 은행 송금
- **자동 이메일**: 7가지 주요 단계별 자동 이메일 발송
- **관리자 대시보드**: 통계, 보고서, 이메일 템플릿 편집 등
- **개인정보 보호**: 역할 기반 정보 접근 제어

## 🛠️ 기술 스택

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend & DB**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Netlify

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/cnec-campaign-platform.git
cd cnec-campaign-platform
```

### 2. 종속성 설치

```bash
npm install
```

### 3. Supabase 설정

자세한 내용은 `SUPABASE_SETUP.md` 파일을 참고하여 Supabase 프로젝트를 설정하세요.

### 4. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, Supabase에서 발급받은 키를 입력하세요.

```bash
cp .env.example .env
```

```.env
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 5. 로컬 개발 서버 실행

```bash
npm run dev
```

이제 `http://localhost:5173`에서 개발 서버에 접속할 수 있습니다.

## 🌐 Netlify 배포

자세한 내용은 `NETLIFY_DEPLOYMENT.md` 파일을 참고하여 GitHub와 연동된 자동 배포를 설정하세요.
'''
# Trigger Netlify deployment
