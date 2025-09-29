
# Netlify 배포 가이드

이 가이드는 CNEC 캠페인 플랫폼을 Netlify에 배포하는 방법을 안내합니다.

## 1. GitHub 저장소 생성 및 푸시

1. GitHub에 새로운 비공개(Private) 저장소를 생성합니다.
2. 로컬 프로젝트를 GitHub 저장소에 푸시합니다.

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

## 2. Netlify 사이트 생성

1. [Netlify](https://www.netlify.com/)에 로그인하여 "Add new site" > "Import an existing project"를 선택합니다.
2. GitHub를 선택하고, 방금 생성한 저장소를 연결합니다.

## 3. 빌드 설정

Netlify는 프로젝트의 `netlify.toml` 파일을 자동으로 인식하여 빌드 설정을 적용합니다. 특별한 변경 없이 기본 설정을 사용하면 됩니다.

- **Build command**: `npm run build`
- **Publish directory**: `dist`

## 4. 환경변수 설정

Netlify 대시보드의 **Site settings > Build & deploy > Environment**에서 다음 환경변수를 설정합니다.

- `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 프로젝트 anon 키

**중요**: Netlify는 배포 시 `VITE_SITE_URL`을 자동으로 설정하므로, 이 변수는 직접 추가할 필요가 없습니다.

## 5. 배포

"Deploy site" 버튼을 클릭하여 첫 배포를 시작합니다. 이후 GitHub 저장소의 `main` 브랜치에 푸시할 때마다 자동으로 사이트가 업데이트됩니다.

## 6. 도메인 설정 (선택사항)

**Domain management**에서 Netlify가 제공하는 기본 도메인을 변경하거나, 보유하고 있는 커스텀 도메인을 연결할 수 있습니다.

---

이제 CNEC 플랫폼이 Netlify를 통해 전 세계에 서비스될 준비가 완료되었습니다.

