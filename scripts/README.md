# 컴포넌트 백업 시스템

이 디렉토리에는 CNEC 캠페인 플랫폼의 컴포넌트를 안전하게 관리하기 위한 백업 및 복원 스크립트가 포함되어 있습니다.

## 📁 파일 구조

```
scripts/
├── backup-component.sh    # 컴포넌트 백업 스크립트
├── restore-component.sh   # 컴포넌트 복원 스크립트
└── README.md             # 이 파일

backups/
└── components/
    ├── backup_log.txt    # 백업 기록
    ├── restore_log.txt   # 복원 기록
    └── [백업 파일들]
```

## 🔧 사용법

### 1. 컴포넌트 백업

컴포넌트를 수정하기 전에 백업을 생성합니다:

```bash
# 특정 컴포넌트 백업
./scripts/backup-component.sh src/components/admin/AdminCampaigns.jsx

# 여러 컴포넌트 백업
./scripts/backup-component.sh src/components/admin/AdminCampaignsWithQuestions.jsx
./scripts/backup-component.sh src/components/admin/ApplicationsReportSimple.jsx
```

### 2. 컴포넌트 복원

문제가 발생했을 때 이전 버전으로 복원합니다:

```bash
# 복원할 컴포넌트 선택
./scripts/restore-component.sh AdminCampaigns

# 대화형 메뉴에서 복원할 백업 버전 선택
```

## 🛡️ 안전 기능

### 자동 백업 관리
- **최대 5개 백업**: 같은 컴포넌트의 백업은 최대 5개까지만 유지
- **타임스탬프**: 모든 백업 파일에 생성 시간 포함
- **로그 기록**: 모든 백업/복원 작업이 로그에 기록됨

### 복원 시 안전장치
- **현재 파일 백업**: 복원 전에 현재 파일을 자동으로 백업
- **확인 프롬프트**: 복원 전에 사용자 확인 요청
- **상세 정보**: 백업 파일의 생성 날짜와 시간 표시

## 📋 백업 파일 명명 규칙

```
[컴포넌트명]_backup_[YYYYMMDD_HHMMSS].jsx
```

예시:
- `AdminCampaigns_backup_20250930_143022.jsx`
- `ApplicationsReportSimple_backup_20250930_143045.jsx`

## 🔍 백업 상태 확인

```bash
# 백업 로그 확인
cat backups/components/backup_log.txt

# 복원 로그 확인
cat backups/components/restore_log.txt

# 특정 컴포넌트의 백업 파일들 확인
ls -la backups/components/AdminCampaigns_backup_*.jsx
```

## ⚠️ 주의사항

1. **수정 전 백업**: 중요한 컴포넌트를 수정하기 전에는 반드시 백업을 생성하세요
2. **정기적인 정리**: 백업 디렉토리가 너무 커지지 않도록 주기적으로 오래된 백업을 정리하세요
3. **Git과 병행**: 이 백업 시스템은 Git과 함께 사용하여 이중 보안을 제공합니다

## 🚀 권장 워크플로우

1. **수정 전**: `./scripts/backup-component.sh [파일경로]`
2. **수정 작업**: 컴포넌트 수정
3. **테스트**: 수정된 기능 테스트
4. **문제 발생 시**: `./scripts/restore-component.sh [컴포넌트명]`
5. **성공 시**: Git 커밋 및 푸시

이 시스템을 통해 안전하게 컴포넌트를 관리하고 실수로 인한 파일 손실을 방지할 수 있습니다.
