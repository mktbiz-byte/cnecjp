# Gmail SMTP 설정 가이드

## 📧 Gmail SMTP 기능 수정 완료

### ✅ 수정된 내용

1. **nodemailer 함수명 오류 수정**
   - `nodemailer.createTransporter()` → `nodemailer.createTransport()` 
   - 이것이 "nodemailer.createTransporter is not a function" 오류의 원인이었습니다.

2. **종속성 설치 완료**
   - `netlify/functions/package.json`에 nodemailer 6.9.8 추가
   - `npm install` 실행으로 node_modules 생성

3. **함수 구조 검증 완료**
   - CORS 헤더 설정 ✅
   - 에러 처리 로직 ✅
   - 파라미터 검증 ✅
   - Gmail 특화 설정 ✅

### 🔧 Gmail 계정 설정 방법

#### 1단계: Gmail 2단계 인증 활성화
```
1. Gmail 계정 → 보안 설정
2. 2단계 인증 활성화
3. 앱 비밀번호 생성
```

#### 2단계: 앱 비밀번호 생성
```
1. Google 계정 관리 → 보안
2. "Google에 로그인" → "앱 비밀번호"
3. 앱 선택: "메일"
4. 기기 선택: "기타 (맞춤 이름)"
5. 이름 입력: "CNEC Japan SMTP"
6. 생성된 16자리 비밀번호 복사
```

#### 3단계: Netlify 환경 변수 설정
```
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
GMAIL_SMTP_USER=your-email@gmail.com
GMAIL_SMTP_PASS=your-16-digit-app-password
GMAIL_FROM_NAME=CNEC Japan
GMAIL_REPLY_TO=support@cnec.jp
```

### 📋 테스트 결과

#### ✅ 구조적 테스트 통과
- nodemailer 임포트: 정상
- createTransport 사용: 정상 (오타 수정됨)
- CORS 헤더: 정상
- 에러 처리: 정상
- 파라미터 검증: 정상

#### 🔄 실제 이메일 테스트 필요
테스트 계정으로 실행한 결과, 인증 오류가 발생했지만 이는 예상된 결과입니다:
```
Error: Gmail 인증 실패
Details: Gmail 사용자명 또는 앱 비밀번호가 잘못되었습니다.
```

### 🚀 배포 및 사용 방법

#### 1. Netlify 환경 변수 설정
```bash
# Netlify 대시보드에서 설정
Site settings → Environment variables → Add variable
```

#### 2. 시스템 설정에서 SMTP 구성
```javascript
// 관리자 페이지 → 시스템 설정
{
  smtpHost: "smtp.gmail.com",
  smtpPort: "587", 
  smtpUser: "your-email@gmail.com",
  smtpPass: "your-app-password",
  fromName: "CNEC Japan",
  fromEmail: "your-email@gmail.com",
  replyToEmail: "support@cnec.jp"
}
```

#### 3. 테스트 이메일 발송
- 관리자 페이지에서 "테스트 이메일 발송" 버튼 클릭
- 수신자 이메일 입력 후 발송
- 성공 시 Gmail을 통해 실제 이메일 발송됨

### 📊 Gmail 발송 제한

| 제한 유형 | 제한량 |
|----------|--------|
| 일일 발송 | 500통/일 |
| 시간당 발송 | 100통/시간 |
| 분당 발송 | 20통/분 |

### 🔒 보안 고려사항

1. **앱 비밀번호 보안**
   - 16자리 앱 비밀번호는 환경 변수로만 관리
   - 코드에 하드코딩 금지
   - 정기적으로 비밀번호 갱신

2. **이메일 발송 로그**
   - 모든 발송 시도가 Netlify Functions 로그에 기록됨
   - 실패 시 상세한 오류 정보 제공

3. **CORS 설정**
   - 모든 도메인에서 접근 가능하도록 설정됨
   - 필요시 특정 도메인으로 제한 가능

### 🎯 다음 단계

1. **실제 Gmail 계정으로 테스트**
   - 위 가이드에 따라 Gmail 앱 비밀번호 생성
   - Netlify 환경 변수 설정
   - 실제 이메일 발송 테스트

2. **시스템 통합**
   - 캠페인 승인 시 자동 이메일 발송
   - 마감일 알림 이메일 발송
   - 사용자 가입 환영 이메일 발송

3. **모니터링 설정**
   - 이메일 발송 성공/실패 통계
   - 일일 발송량 모니터링
   - 오류 알림 설정

---

**✅ Gmail SMTP 기능이 성공적으로 수정되었습니다!**

이제 실제 Gmail 계정 설정만 완료하면 정상적으로 이메일 발송이 가능합니다.
