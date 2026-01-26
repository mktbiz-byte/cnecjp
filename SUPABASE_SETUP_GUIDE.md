# Supabase 설정 가이드

## 1. SQL 스크립트 실행

Supabase Dashboard > SQL Editor에서 `campaign_workflow_schema.sql` 파일의 내용을 실행하세요.

이 스크립트는 다음을 설정합니다:
- `campaigns` 테이블에 캠페인 유형 관련 컬럼 추가
- `campaign_submissions` 테이블 생성
- RLS 정책 설정
- 자동 스텝 생성 트리거

## 2. Storage 버킷 설정

### Supabase Dashboard > Storage에서 설정:

1. **새 버킷 생성**
   - 버킷 이름: `campaign-videos`
   - Public bucket: **체크 해제** (비공개)
   - File size limit: `524288000` (500MB)
   - Allowed MIME types: `video/mp4, video/quicktime, video/x-msvideo, video/webm, video/mpeg`

2. **Policies 설정** (버킷 생성 후 Policies 탭에서)

   **INSERT Policy (파일 업로드)**
   ```sql
   -- Policy name: Allow users to upload videos
   CREATE POLICY "Allow users to upload videos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'campaign-videos' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **SELECT Policy (파일 조회)**
   ```sql
   -- Policy name: Allow users to view own videos
   CREATE POLICY "Allow users to view own videos"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'campaign-videos' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **관리자용 SELECT Policy**
   ```sql
   -- Policy name: Allow admins to view all videos
   CREATE POLICY "Allow admins to view all videos"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'campaign-videos' AND
     EXISTS (
       SELECT 1 FROM user_profiles
       WHERE user_profiles.user_id = auth.uid()
       AND user_profiles.role = 'admin'
     )
   );
   ```

   **UPDATE Policy (파일 수정)**
   ```sql
   -- Policy name: Allow users to update own videos
   CREATE POLICY "Allow users to update own videos"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (
     bucket_id = 'campaign-videos' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **DELETE Policy (파일 삭제)**
   ```sql
   -- Policy name: Allow users to delete own videos
   CREATE POLICY "Allow users to delete own videos"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'campaign-videos' AND
     (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

## 3. 캠페인 유형 설명

| 타입 | 아이콘 | 한국어 | 일본어 | 스텝 수 | 설명 |
|------|--------|--------|--------|---------|------|
| `regular` | 📹 | 기획형 | 企画型 | 1 | 1개 영상 제작 |
| `megawari` | 🎯 | 메가와리 | メガ割 | 2 | 2개 영상 (스텝 1/2) |
| `4week_challenge` | 🗓️ | 4주 챌린지 | 4週チャレンジ | 4 | 매주 1개씩 총 4개 |
| `oliveyoung` | 🛍️ | 올영세일 | オリーブヤング | 1 | 올리브영 세일 캠페인 |

## 4. 워크플로우 상태

| 상태 | 설명 |
|------|------|
| `guide_pending` | 가이드 확인 대기 |
| `guide_confirmed` | 가이드 확인 완료 |
| `video_uploading` | 영상 업로드 중 |
| `video_uploaded` | 영상 업로드 완료 |
| `sns_pending` | SNS URL 입력 대기 |
| `sns_submitted` | SNS URL 제출 완료 |
| `review_pending` | 관리자 검토 대기 |
| `revision_required` | 수정 필요 |
| `completed` | 완료 |
| `points_paid` | 포인트 지급 완료 |

## 5. 관리자 페이지에서 캠페인 생성 시

캠페인 생성/수정 시 다음 필드를 설정하세요:
- `campaign_type`: 캠페인 유형 선택
- `total_steps`: 총 스텝 수 (유형에 따라 자동 설정되지만 수동으로 변경 가능)
- `shooting_guide_url`: 촬영 가이드 URL
- `ad_code_required`: 광고코드 필수 여부 (기본값: true)
- `clean_video_required`: 클린본 필수 여부 (기본값: true)

## 6. 파일 구조

```
/user_id/
  /campaign_id/
    /submission_id/
      /timestamp_main_filename.mp4     (메인 영상)
      /timestamp_clean_filename.mp4    (클린본)
```
