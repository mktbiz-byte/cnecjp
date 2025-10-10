# 🔐 CNEC Japan - 보안 가이드

## ⚠️ 중요한 보안 규칙

### 🚫 절대 하지 말아야 할 것들

1. **API 키를 코드에 직접 입력하지 마세요**
   ```javascript
   // ❌ 절대 이렇게 하지 마세요
   const apiKey = "sk-proj-abc123..."
   
   // ✅ 올바른 방법
   const apiKey = import.meta.env.VITE_OPENAI_API_KEY
   ```

2. **환경변수 파일을 Git에 커밋하지 마세요**
   - `.env` 파일들은 `.gitignore`에 포함되어 있습니다
   - 실수로 커밋하지 않도록 주의하세요

3. **API 키를 GitHub Issues, PR, 댓글에 노출하지 마세요**

### ✅ 안전한 환경변수 관리

#### Netlify 환경변수 설정
1. [Netlify 대시보드](https://app.netlify.com/) 접속
2. 사이트 선택 → **Site settings**
3. **Environment variables** 클릭
4. **Add a variable** 버튼 클릭
5. 변수 추가:
   - Key: `VITE_OPENAI_API_KEY`
   - Value: OpenAI API 키
   - Scopes: All scopes

#### 로컬 개발 환경
1. 프로젝트 루트에 `.env.local` 파일 생성
2. 환경변수 추가:
   ```
   VITE_OPENAI_API_KEY=your-api-key-here
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-key
   ```
3. 이 파일은 절대 Git에 커밋하지 마세요!

### 🔑 API 키 관리

#### OpenAI API 키
- [OpenAI API Keys](https://platform.openai.com/account/api-keys)에서 관리
- 키가 노출되면 즉시 삭제하고 새로 생성
- 키 이름을 명확하게 설정 (예: `cnec-translate-prod`)

#### Supabase 키
- [Supabase Dashboard](https://supabase.com/dashboard)에서 관리
- `anon` 키만 프론트엔드에서 사용
- `service_role` 키는 절대 프론트엔드에 노출하지 마세요

### 🚨 보안 사고 대응

#### API 키가 노출된 경우
1. **즉시 해당 키 삭제**
2. **새로운 키 생성**
3. **Netlify 환경변수 업데이트**
4. **사이트 재배포**
5. **Git 히스토리에서 키 제거** (필요시)

#### Git 히스토리 정리
```bash
# 특정 파일에서 민감한 정보 제거
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch path/to/sensitive/file' \
--prune-empty --tag-name-filter cat -- --all

# 강제 푸시 (주의: 협업 시 팀원과 상의 필요)
git push origin --force --all
```

### 📋 체크리스트

#### 배포 전 확인사항
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] 코드에 하드코딩된 API 키가 없는가?
- [ ] 모든 환경변수가 Netlify에 설정되어 있는가?
- [ ] 테스트 환경에서 API 호출이 정상 작동하는가?

#### 정기 보안 점검
- [ ] 사용하지 않는 API 키 삭제
- [ ] API 키 사용량 모니터링
- [ ] 환경변수 설정 재확인
- [ ] 보안 업데이트 적용

### 📞 문의사항

보안 관련 문의나 사고 발생 시:
- 이메일: security@cnec.jp
- 긴급 상황: 즉시 API 키 비활성화 후 연락

---

**⚠️ 이 문서의 내용을 모든 개발자가 숙지해야 합니다.**
