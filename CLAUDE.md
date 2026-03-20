# CLAUDE.md - cnecjp (일본 크리에이터 사이트)

## 프로젝트 개요
- **도메인**: https://cnec.jp
- **레포**: mktbiz-byte/cnecjp
- **용도**: 일본 크리에이터 플랫폼

## 기술 스택
React 19 + Vite 6 + Tailwind CSS 4 + shadcn/ui + Supabase + Netlify

## 데이터베이스
- **자체 DB**: Japan Supabase (psfwmzlnaboattocyupu)
- ⚠️ **personalized_guide 컬럼이 JSONB** (KR/US는 TEXT) — 파싱 시 주의
- ⚠️ **AI 가이드 키: `scenes`** (KR은 `shooting_scenes`) — 양쪽 키 모두 저장 필수

## 환경변수 표준명
| DB | URL | KEY |
|----|-----|-----|
| 자체 (Japan) | `VITE_SUPABASE_URL` | `SUPABASE_SERVICE_ROLE_KEY` |

## Supabase 클라이언트
- **프론트엔드**: `src/lib/supabase.js` (이것만 사용)
- 변형 파일 사용 금지 (삭제됨)

## 파일 네이밍 금지 패턴
`*_backup.jsx`, `*_old.jsx`, `*_fixed.jsx` 만들지 말 것

## 삭제 금지 컴포넌트
- CampaignReportEnhanced.jsx → /campaign-report
- UserApprovalManagerEnhanced.jsx → /user-approval

## 삭제된 파일 (Phase 0에서 정리 완료)

2026-03-20 코드베이스 정리로 아래 파일들이 삭제되었습니다:
- src/ 내 백업/변형 파일 32개 (backup, fixed, old, complete 등)
- src/lib/ supabase 변형 파일 6개
- 루트 test/check 스크립트 6개
- 루트 SQL 30개 → database/ 폴더로 이동
- 루트 MD 17개 → docs/ 폴더로 이동

새로운 백업 파일을 만들지 마세요. git으로 버전 관리하세요.
