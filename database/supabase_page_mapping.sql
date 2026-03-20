-- ============================================================
-- 페이지별 Supabase 데이터 연결 맵
-- 각 페이지가 어떤 테이블의 어떤 컬럼을 쓰는지 정리
-- ============================================================

-- ====================================
-- PAGE 1: MyPageCampaignsTab.jsx (크리에이터 마이페이지 - 캠페인 탭)
-- 핵심 워크플로우: 영상업로드 → 수정확인 → SNS/클린본 → 포인트
-- ====================================
/*
[READ]
  campaigns:        SELECT * WHERE id IN (user의 application.campaign_id들)
  applications:     props로 전달받음 (부모 MyPage에서 getByUser로 조회)
  campaign_submissions: SELECT * WHERE application_id IN (user의 application.id들)

[WRITE - campaign_submissions]
  INSERT: application_id, user_id, campaign_id, step_number, workflow_status,
          video_file_url, video_file_path, video_file_name, video_file_size,
          video_uploaded_at, created_at, updated_at
  UPDATE: workflow_status, video_file_url, video_file_path, video_file_name,
          video_file_size, video_uploaded_at,
          sns_url, sns_uploaded_at,
          clean_video_file_url, clean_video_file_path, clean_video_file_name,
          clean_video_uploaded_at,
          ad_code, updated_at

[STORAGE]
  campaign-videos: UPLOAD video files (main + clean)
    path format: {userId}/{campaignId}/{submissionId}/{timestamp}_v{N}_main.{ext}
    path format: {userId}/{campaignId}/{submissionId}/{timestamp}_clean.{ext}

[CRITICAL DEPENDENCIES]
  1. campaign_submissions 테이블이 있어야 워크플로우 작동
  2. campaign-videos 스토리지 버킷이 있어야 영상 업로드 작동
  3. applications.personalized_guide에 AI 가이드 JSON이 있어야 ShootingGuideModal 표시
  4. campaigns.* 전체 컬럼 필요 (guide, deadline, product info 등)
*/

-- 페이지 1 검증 쿼리
SELECT '=== MyPageCampaignsTab 데이터 체크 ===' AS page;

-- 1-1: campaign_submissions 데이터가 있는지
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_submissions') THEN
    RAISE NOTICE '[OK] campaign_submissions 테이블 존재';
  ELSE
    RAISE NOTICE '[ERROR] campaign_submissions 테이블 없음 - 워크플로우 완전 불가';
  END IF;
END $$;

-- 1-2: 진행중인 applications에 submissions가 연결되어 있는지
SELECT
  a.id AS app_id,
  a.status,
  c.title,
  c.campaign_type,
  COALESCE((SELECT COUNT(*) FROM campaign_submissions cs WHERE cs.application_id = a.id), 0) AS submissions,
  CASE
    WHEN a.status IN ('selected','filming','approved','video_submitted','sns_submitted') AND
         COALESCE((SELECT COUNT(*) FROM campaign_submissions cs WHERE cs.application_id = a.id), 0) = 0
    THEN '[WARNING] 진행중이지만 submission 없음'
    ELSE '[OK]'
  END AS check_result
FROM applications a
LEFT JOIN campaigns c ON c.id = a.campaign_id
WHERE a.status IN ('selected', 'filming', 'approved', 'video_submitted', 'sns_submitted', 'completed')
ORDER BY a.created_at DESC
LIMIT 30;


-- ====================================
-- PAGE 2: MyPageWithWithdrawal.jsx (크리에이터 마이페이지 - 메인/출금)
-- ====================================
/*
[READ]
  applications:       SELECT * WHERE user_id = currentUser
  campaigns:          SELECT * WHERE id IN (application.campaign_id들)
  user_profiles:      SELECT * WHERE user_id = currentUser
  point_transactions: SELECT * WHERE user_id = currentUser (포인트 합계)
  withdrawal_requests: SELECT * WHERE user_id = currentUser

[WRITE - withdrawal_requests]
  INSERT: user_id, amount, withdrawal_method, paypal_email, paypal_name, reason, status

[WRITE - point_transactions]
  INSERT: user_id, amount(-), transaction_type='admin_add', description

[CRITICAL DEPENDENCIES]
  1. applications.personalized_guide → ShootingGuideModal 직접 전달
  2. applications.guide_sent, guide_sent_at → 가이드 발송 여부 표시
  3. applications.tracking_number → 배송 추적번호
*/

-- 페이지 2 검증 쿼리
SELECT '=== MyPageWithWithdrawal 데이터 체크 ===' AS page;

-- 2-1: 유저별 포인트 잔액 확인
SELECT
  up.name,
  up.user_id,
  COALESCE(SUM(pt.amount), 0) AS total_points,
  (SELECT COUNT(*) FROM withdrawal_requests wr WHERE wr.user_id = up.user_id AND wr.status = 'pending') AS pending_withdrawals
FROM user_profiles up
LEFT JOIN point_transactions pt ON pt.user_id = up.user_id
GROUP BY up.name, up.user_id
HAVING COALESCE(SUM(pt.amount), 0) > 0
ORDER BY total_points DESC
LIMIT 20;


-- ====================================
-- PAGE 3: Admin - AdminApplications.jsx (관리자 - 신청 관리)
-- ====================================
/*
[READ]
  applications:  SELECT * + user_profiles JOIN
  campaigns:     SELECT id, title
  user_profiles: SELECT * WHERE user_id IN (applicant user_ids)

[WRITE - applications]
  UPDATE: status (pending → approved/rejected/virtual_selected/selected/filming)
          approved_at, rejected_at, virtual_selected_at, updated_at

[CRITICAL DEPENDENCIES]
  1. applications.status 값이 'selected', 'filming' 등 cnecbiz에서 설정한 값 포함
*/


-- ====================================
-- PAGE 4: CampaignWorkflowCard.jsx (캠페인 워크플로우 카드)
-- ====================================
/*
[READ]
  campaign_submissions: SELECT * WHERE application_id

[WRITE - campaign_submissions]
  INSERT: application_id, user_id, campaign_id, step_number, workflow_status='guide_pending'
  UPDATE: workflow_status, video_file_path, video_file_url, video_file_name

[STORAGE]
  campaign-videos: UPLOAD video files

[CRITICAL DEPENDENCIES]
  1. campaign_submissions 테이블 필수
  2. campaign-videos 버킷 필수
*/


-- ====================================
-- PAGE 5: Admin - AdminWithdrawals.jsx (관리자 - 출금 관리)
-- ====================================
/*
[READ]
  withdrawal_requests: SELECT * (관리자 전체 조회)
  point_transactions:  SELECT * WHERE user_id (유저별 포인트 확인)

[WRITE]
  withdrawal_requests: UPDATE status (pending → completed/rejected), processed_at, processed_by
  point_transactions:  INSERT (포인트 차감 기록)
*/


-- ====================================
-- PAGE 6: VideoUploadModal.jsx (영상 업로드 모달)
-- ====================================
/*
[WRITE - applications]
  UPDATE: video_submitted=true, video_links, submission_status, updated_at

[STORAGE]
  campaign-videos: UPLOAD video files
*/


-- ====================================
-- 종합 체크: 페이지별 필수 의존성 요약
-- ====================================
SELECT '=== 종합 필수 의존성 ===' AS summary;

SELECT
  page_name,
  dependency,
  CASE
    WHEN dep_type = 'table' AND EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = dep_name AND table_schema = 'public'
    ) THEN 'OK'
    WHEN dep_type = 'bucket' AND EXISTS (
      SELECT 1 FROM storage.buckets WHERE id = dep_name
    ) THEN 'OK'
    WHEN dep_type = 'column' AND EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_name = split_part(dep_name, '.', 1) AND column_name = split_part(dep_name, '.', 2) AND table_schema = 'public'
    ) THEN 'OK'
    ELSE 'MISSING'
  END AS status
FROM (VALUES
  -- MyPageCampaignsTab
  ('MyPageCampaignsTab', 'campaign_submissions 테이블', 'table', 'campaign_submissions'),
  ('MyPageCampaignsTab', 'campaign-videos 버킷', 'bucket', 'campaign-videos'),
  ('MyPageCampaignsTab', 'applications.personalized_guide 컬럼', 'column', 'applications.personalized_guide'),
  ('MyPageCampaignsTab', 'applications.revision_requests 컬럼', 'column', 'applications.revision_requests'),

  -- MyPageWithWithdrawal
  ('MyPageWithWithdrawal', 'withdrawal_requests 테이블', 'table', 'withdrawal_requests'),
  ('MyPageWithWithdrawal', 'point_transactions 테이블', 'table', 'point_transactions'),
  ('MyPageWithWithdrawal', 'applications.personalized_guide 컬럼', 'column', 'applications.personalized_guide'),
  ('MyPageWithWithdrawal', 'applications.guide_sent 컬럼', 'column', 'applications.guide_sent'),
  ('MyPageWithWithdrawal', 'applications.tracking_number 컬럼', 'column', 'applications.tracking_number'),

  -- CampaignWorkflowCard
  ('CampaignWorkflowCard', 'campaign_submissions 테이블', 'table', 'campaign_submissions'),
  ('CampaignWorkflowCard', 'campaign-videos 버킷', 'bucket', 'campaign-videos'),

  -- VideoUploadModal
  ('VideoUploadModal', 'campaign-videos 버킷', 'bucket', 'campaign-videos'),
  ('VideoUploadModal', 'applications.video_submitted 컬럼', 'column', 'applications.video_submitted'),
  ('VideoUploadModal', 'applications.video_links 컬럼', 'column', 'applications.video_links'),

  -- Admin
  ('AdminApplications', 'applications 테이블', 'table', 'applications'),
  ('AdminWithdrawals', 'withdrawal_requests 테이블', 'table', 'withdrawal_requests'),
  ('AdminWithdrawals', 'point_transactions 테이블', 'table', 'point_transactions')
) AS deps(page_name, dependency, dep_type, dep_name)
ORDER BY status DESC, page_name;
