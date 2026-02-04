-- ============================================================
-- cnec.jp ↔ Supabase 스키마 체크 SQL
-- 각 페이지에서 사용하는 테이블/컬럼이 실제 DB에 있는지 확인
-- ============================================================
-- 실행 방법: Supabase SQL Editor에서 섹션별로 실행
-- ============================================================

-- ============================
-- 1. 전체 테이블 존재 여부 체크
-- ============================
SELECT '=== 테이블 존재 여부 ===' AS check_type;

SELECT
  required_table,
  CASE WHEN t.table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  CASE WHEN t.table_name IS NOT NULL THEN ''
    ELSE '사이트 코드에서 사용하지만 DB에 없음' END AS note
FROM (VALUES
  ('campaigns'),
  ('applications'),
  ('campaign_applications'),
  ('user_profiles'),
  ('withdrawal_requests'),
  ('point_transactions'),
  ('email_templates'),
  ('email_logs'),
  ('email_schedules'),
  ('companies'),
  ('company_access_tokens'),
  ('creator_materials'),
  ('campaign_submissions'),
  ('bank_transfers'),
  ('system_settings')
) AS required(required_table)
LEFT JOIN information_schema.tables t
  ON t.table_name = required.required_table
  AND t.table_schema = 'public'
ORDER BY status DESC, required_table;


-- ============================
-- 2. campaigns 테이블 컬럼 체크
-- (MyPageCampaignsTab.jsx, GuideModal에서 사용)
-- ============================
SELECT '=== campaigns 컬럼 체크 ===' AS check_type;

SELECT
  required_col,
  CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  c.data_type,
  used_in
FROM (VALUES
  -- 기본 정보
  ('id', 'all pages'),
  ('title', 'all pages'),
  ('brand', 'CampaignCard, GuideModal'),
  ('brand_name_ja', 'GuideModal'),
  ('status', 'campaign list'),
  ('campaign_type', 'MyPageCampaignsTab - regular/megawari/4week_challenge'),
  ('total_steps', 'MyPageCampaignsTab - workflow steps'),
  ('reward_amount', 'MyPageWithWithdrawal'),
  ('created_at', 'all pages'),

  -- 가이드 관련 (중요!)
  ('guide_type', 'MyPageCampaignsTab - PDF/AI guide 판별'),
  ('guide_pdf_url', 'MyPageCampaignsTab - PDF 가이드 URL'),
  ('shooting_guide_url', 'GuideModal - 외부 가이드 링크'),
  ('shooting_guide_content', 'GuideModal - AI 가이드 JSON/텍스트'),

  -- 4주 챌린지 주차별 가이드
  ('week1_guide', 'GuideModal - 4week 1주차'),
  ('week1_guide_ja', 'GuideModal - 4week 1주차 일본어'),
  ('week2_guide', 'GuideModal - 4week 2주차'),
  ('week2_guide_ja', 'GuideModal - 4week 2주차 일본어'),
  ('week3_guide', 'GuideModal - 4week 3주차'),
  ('week3_guide_ja', 'GuideModal - 4week 3주차 일본어'),
  ('week4_guide', 'GuideModal - 4week 4주차'),
  ('week4_guide_ja', 'GuideModal - 4week 4주차 일본어'),

  -- 마감일
  ('video_deadline', 'DeadlineDisplay'),
  ('sns_deadline', 'DeadlineDisplay'),
  ('week1_deadline', 'AllDeadlinesOverview - 4week'),
  ('week1_sns_deadline', 'AllDeadlinesOverview - 4week'),
  ('week2_deadline', 'AllDeadlinesOverview - 4week'),
  ('week2_sns_deadline', 'AllDeadlinesOverview - 4week'),
  ('week3_deadline', 'AllDeadlinesOverview - 4week'),
  ('week3_sns_deadline', 'AllDeadlinesOverview - 4week'),
  ('week4_deadline', 'AllDeadlinesOverview - 4week'),
  ('week4_sns_deadline', 'AllDeadlinesOverview - 4week'),
  ('step_deadlines', 'AllDeadlinesOverview - JSONB array'),

  -- 제품 정보 (GuideModal)
  ('product_name_ja', 'GuideModal - 제품명'),
  ('product_description_ja', 'GuideModal - 제품 설명'),
  ('product_features_ja', 'GuideModal - 제품 특징 array'),

  -- 필수 콘텐츠 (GuideModal)
  ('required_dialogues_ja', 'GuideModal - 필수 대사 array'),
  ('required_scenes_ja', 'GuideModal - 필수 장면 array'),
  ('required_hashtags_ja', 'GuideModal - 필수 해시태그 array'),

  -- 영상 사양 (GuideModal)
  ('video_duration_ja', 'GuideModal - 영상 길이'),
  ('video_tempo_ja', 'GuideModal - 영상 템포'),
  ('video_tone_ja', 'GuideModal - 영상 톤'),

  -- 촬영 장면 체크리스트 (GuideModal)
  ('shooting_scenes_ba_photo', 'GuideModal - B&A 촬영'),
  ('shooting_scenes_no_makeup', 'GuideModal - 노메이크업'),
  ('shooting_scenes_closeup', 'GuideModal - 클로즈업'),
  ('shooting_scenes_product_closeup', 'GuideModal - 제품 클로즈업'),
  ('shooting_scenes_product_texture', 'GuideModal - 제품 제형'),
  ('shooting_scenes_outdoor', 'GuideModal - 외부 촬영'),
  ('shooting_scenes_couple', 'GuideModal - 커플 출연'),
  ('shooting_scenes_child', 'GuideModal - 아이 출연'),
  ('shooting_scenes_troubled_skin', 'GuideModal - 트러블 피부'),
  ('shooting_scenes_wrinkles', 'GuideModal - 주름'),
  ('shooting_scenes_ja', 'GuideModal - 추가 촬영 장면 array'),

  -- 추가 요청 (GuideModal)
  ('additional_details_ja', 'GuideModal - 추가 상세'),
  ('additional_shooting_requests_ja', 'GuideModal - 추가 촬영 요청'),

  -- 워크플로우 플래그
  ('meta_ad_code_requested', 'MyPageCampaignsTab - 메타 광고코드 필요 boolean'),
  ('requires_clean_video', 'MyPageCampaignsTab - 클린 영상 필요 boolean'),

  -- 공유 링크
  ('google_drive_url', 'GuideModal/Admin'),
  ('google_slides_url', 'GuideModal/Admin'),
  ('google_drive_link', 'MyPageCampaignsTab')
) AS required(required_col, used_in)
LEFT JOIN information_schema.columns c
  ON c.table_name = 'campaigns'
  AND c.column_name = required.required_col
  AND c.table_schema = 'public'
ORDER BY status DESC, required_col;


-- ============================
-- 3. applications 테이블 컬럼 체크
-- (MyPageCampaignsTab, MyPageWithWithdrawal에서 사용)
-- ============================
SELECT '=== applications 컬럼 체크 ===' AS check_type;

SELECT
  required_col,
  CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  c.data_type,
  used_in
FROM (VALUES
  ('id', 'all pages'),
  ('user_id', 'all pages'),
  ('campaign_id', 'all pages'),
  ('status', 'all pages - pending/approved/selected/filming/video_submitted/sns_submitted/completed/rejected'),
  ('applicant_name', 'admin applications'),
  ('age', 'admin applications'),
  ('skin_type', 'admin applications'),
  ('instagram_url', 'admin applications'),
  ('tiktok_url', 'admin applications'),
  ('youtube_url', 'admin applications'),
  ('other_sns_url', 'admin applications'),
  ('bio', 'admin applications'),
  ('created_at', 'all pages'),
  ('updated_at', 'all pages'),
  ('approved_at', 'status tracking'),
  ('rejected_at', 'status tracking'),
  ('virtual_selected_at', 'status tracking'),
  -- 가이드 관련 (중요!)
  ('personalized_guide', 'MyPageCampaignsTab - AI/PDF 가이드 JSON'),
  ('guide_sent', 'MyPageWithWithdrawal - boolean'),
  ('guide_sent_at', 'MyPageWithWithdrawal'),
  ('guide_url', 'MyPageWithWithdrawal'),
  -- 배송 관련
  ('tracking_number', 'MyPageWithWithdrawal'),
  ('shipping_date', 'MyPageWithWithdrawal'),
  -- 영상/SNS
  ('video_submitted', 'MyPageWithWithdrawal - boolean'),
  ('video_links', 'MyPageWithWithdrawal'),
  ('submission_status', 'MyPageWithWithdrawal'),
  -- 수정 요청
  ('revision_requests', 'MyPageCampaignsTab - JSONB array'),
  -- 드라이브 링크
  ('drive_links', 'admin'),
  ('google_drive_url', 'GuideModal'),
  ('google_slides_url', 'GuideModal'),
  ('additional_info', 'MyPageWithWithdrawal')
) AS required(required_col, used_in)
LEFT JOIN information_schema.columns c
  ON c.table_name = 'applications'
  AND c.column_name = required.required_col
  AND c.table_schema = 'public'
ORDER BY status DESC, required_col;


-- ============================
-- 4. campaign_submissions 테이블 컬럼 체크
-- (MyPageCampaignsTab - 워크플로우 핵심 테이블)
-- ============================
SELECT '=== campaign_submissions 컬럼 체크 ===' AS check_type;

SELECT
  required_col,
  CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  c.data_type,
  used_in
FROM (VALUES
  ('id', 'all - primary key'),
  ('application_id', 'all - FK to applications'),
  ('user_id', 'MyPageCampaignsTab - user filter'),
  ('campaign_id', 'MyPageCampaignsTab - campaign filter'),
  ('step_number', 'MyPageCampaignsTab - multi-step workflow'),
  ('workflow_status', 'MyPageCampaignsTab - guide_pending/video_uploaded/sns_submitted/completed/points_paid/revision_required'),
  -- 영상 파일 (Step 1)
  ('video_file_path', 'MyPageCampaignsTab - Supabase Storage path'),
  ('video_file_url', 'MyPageCampaignsTab - 영상 공개 URL'),
  ('video_file_name', 'MyPageCampaignsTab - 파일명 표시'),
  ('video_file_size', 'MyPageCampaignsTab - 파일 크기'),
  ('video_uploaded_at', 'MyPageCampaignsTab - 업로드 시간'),
  -- 클린 영상 (Step 3)
  ('clean_video_file_path', 'MyPageCampaignsTab - 클린본 경로'),
  ('clean_video_file_url', 'MyPageCampaignsTab - 클린본 URL'),
  ('clean_video_file_name', 'MyPageCampaignsTab - 클린본 파일명'),
  ('clean_video_uploaded_at', 'MyPageCampaignsTab - 클린본 업로드 시간'),
  -- SNS 제출 (Step 3)
  ('sns_platform', 'MyPageCampaignsTab - instagram/tiktok/youtube'),
  ('sns_url', 'MyPageCampaignsTab - SNS 게시물 URL'),
  ('sns_uploaded_at', 'MyPageCampaignsTab - SNS 제출 시간'),
  -- 광고 코드 (Step 3)
  ('ad_code', 'MyPageCampaignsTab - 메타 파트너십 코드'),
  -- 수정 요청 (Step 2)
  ('revision_notes', 'MyPageCampaignsTab - 수정 사항 텍스트'),
  ('revision_requests', 'MyPageCampaignsTab - 수정 요청 JSONB array'),
  -- 포인트 (Step 4)
  ('points_amount', 'MyPageCampaignsTab - 지급 포인트'),
  ('points_paid_at', 'MyPageCampaignsTab - 포인트 지급 시간'),
  -- 마감일
  ('video_deadline', 'StepCard - 영상 마감일'),
  ('sns_deadline', 'StepCard - SNS 마감일'),
  -- 타임스탬프
  ('created_at', 'all'),
  ('updated_at', 'all')
) AS required(required_col, used_in)
LEFT JOIN information_schema.columns c
  ON c.table_name = 'campaign_submissions'
  AND c.column_name = required.required_col
  AND c.table_schema = 'public'
ORDER BY status DESC, required_col;


-- ============================
-- 5. user_profiles 테이블 컬럼 체크
-- ============================
SELECT '=== user_profiles 컬럼 체크 ===' AS check_type;

SELECT
  required_col,
  CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  c.data_type,
  used_in
FROM (VALUES
  ('id', 'all'),
  ('user_id', 'all - FK to auth.users'),
  ('email', 'all'),
  ('name', 'profile display'),
  ('age', 'admin view'),
  ('skin_type', 'admin view'),
  ('instagram_url', 'SNS links'),
  ('tiktok_url', 'SNS links'),
  ('youtube_url', 'SNS links'),
  ('other_sns_url', 'SNS links'),
  ('bio', 'profile'),
  ('role', 'SecretAdminLogin - admin role check'),
  ('created_at', 'all'),
  ('updated_at', 'all')
) AS required(required_col, used_in)
LEFT JOIN information_schema.columns c
  ON c.table_name = 'user_profiles'
  AND c.column_name = required.required_col
  AND c.table_schema = 'public'
ORDER BY status DESC, required_col;


-- ============================
-- 6. point_transactions 테이블 컬럼 체크
-- ============================
SELECT '=== point_transactions 컬럼 체크 ===' AS check_type;

SELECT
  required_col,
  CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  c.data_type,
  used_in
FROM (VALUES
  ('id', 'all'),
  ('user_id', 'MyPageWithWithdrawal - user filter'),
  ('amount', 'MyPageWithWithdrawal - 포인트 합계 계산'),
  ('transaction_type', 'supabase.js - admin_add/campaign_reward/withdrawal'),
  ('description', 'supabase.js - 트랜잭션 설명'),
  ('reason', 'withdrawal_api.js'),
  ('status', 'withdrawal_api.js - approved/pending'),
  ('approved_at', 'withdrawal_api.js'),
  ('created_at', 'all')
) AS required(required_col, used_in)
LEFT JOIN information_schema.columns c
  ON c.table_name = 'point_transactions'
  AND c.column_name = required.required_col
  AND c.table_schema = 'public'
ORDER BY status DESC, required_col;


-- ============================
-- 7. withdrawal_requests 테이블 컬럼 체크
-- ============================
SELECT '=== withdrawal_requests 컬럼 체크 ===' AS check_type;

SELECT
  required_col,
  CASE WHEN c.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  c.data_type,
  used_in
FROM (VALUES
  ('id', 'all'),
  ('user_id', 'MyPageWithWithdrawal'),
  ('amount', 'withdrawal amount'),
  ('withdrawal_method', 'supabase.js - paypal/bank_transfer'),
  ('paypal_email', 'supabase.js'),
  ('paypal_name', 'supabase.js'),
  ('reason', 'supabase.js'),
  ('status', 'all - pending/completed/rejected'),
  ('created_at', 'all'),
  ('updated_at', 'all'),
  ('processed_at', 'admin'),
  ('processed_by', 'admin'),
  ('notes', 'admin')
) AS required(required_col, used_in)
LEFT JOIN information_schema.columns c
  ON c.table_name = 'withdrawal_requests'
  AND c.column_name = required.required_col
  AND c.table_schema = 'public'
ORDER BY status DESC, required_col;


-- ============================
-- 8. Storage 버킷 체크
-- ============================
SELECT '=== Storage 버킷 체크 ===' AS check_type;

SELECT
  required_bucket,
  CASE WHEN b.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status,
  b.public,
  used_in
FROM (VALUES
  ('campaign-images', 'supabase.js - 캠페인 이미지 업로드'),
  ('campaign-videos', 'MyPageCampaignsTab - 영상 업로드 (main + clean)')
) AS required(required_bucket, used_in)
LEFT JOIN storage.buckets b ON b.id = required.required_bucket
ORDER BY status DESC;


-- ============================
-- 9. RLS (Row Level Security) 체크
-- ============================
SELECT '=== RLS 정책 체크 ===' AS check_type;

SELECT
  t.tablename,
  CASE WHEN t.rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END AS rls_status,
  COALESCE(
    (SELECT string_agg(polname, ', ') FROM pg_policies WHERE tablename = t.tablename),
    'NO POLICIES'
  ) AS policies
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.tablename IN (
  'campaigns', 'applications', 'campaign_applications', 'user_profiles',
  'withdrawal_requests', 'point_transactions', 'email_templates',
  'email_logs', 'email_schedules', 'campaign_submissions',
  'creator_materials', 'companies', 'company_access_tokens',
  'bank_transfers', 'system_settings'
)
ORDER BY t.tablename;


-- ============================
-- 10. 실제 데이터 현황 체크
-- ============================
SELECT '=== 데이터 현황 ===' AS check_type;

-- 각 테이블 row count
SELECT 'campaigns' AS table_name, COUNT(*) AS row_count FROM campaigns
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'point_transactions', COUNT(*) FROM point_transactions
UNION ALL
SELECT 'withdrawal_requests', COUNT(*) FROM withdrawal_requests;

-- campaign_submissions 존재 여부 및 row count
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_submissions' AND table_schema = 'public') THEN
    RAISE NOTICE 'campaign_submissions: EXISTS';
  ELSE
    RAISE NOTICE 'campaign_submissions: TABLE MISSING - 워크플로우가 작동하지 않음!';
  END IF;
END $$;


-- ============================
-- 11. applications 상태값 분포 체크
-- (selected / filming 이 실제 사용되고 있는지)
-- ============================
SELECT '=== applications 상태 분포 ===' AS check_type;

SELECT
  status,
  COUNT(*) AS count,
  CASE
    WHEN status IN ('approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed')
    THEN '진행중 (approvedStatuses)'
    WHEN status = 'pending' THEN '대기'
    WHEN status = 'rejected' THEN '거절'
    WHEN status = 'virtual_selected' THEN '가선정'
    ELSE '기타/unknown'
  END AS category
FROM applications
GROUP BY status
ORDER BY count DESC;


-- ============================
-- 12. campaign_submissions 워크플로우 상태 분포
-- ============================
SELECT '=== campaign_submissions 워크플로우 상태 ===' AS check_type;

-- 테이블 존재하는 경우에만 실행
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_submissions' AND table_schema = 'public') THEN
    RAISE NOTICE 'campaign_submissions 상태 분포:';
  ELSE
    RAISE NOTICE 'campaign_submissions 테이블이 없습니다. 아래 SQL로 생성하세요.';
  END IF;
END $$;

-- 아래 쿼리는 campaign_submissions 테이블이 있을 때만 실행
-- SELECT workflow_status, COUNT(*) FROM campaign_submissions GROUP BY workflow_status ORDER BY count DESC;


-- ============================
-- 13. personalized_guide 데이터 확인
-- (JSON / 텍스트 / NULL 분포)
-- ============================
SELECT '=== personalized_guide 분포 ===' AS check_type;

SELECT
  CASE
    WHEN personalized_guide IS NULL THEN 'NULL (가이드 없음)'
    WHEN personalized_guide::text LIKE '%"type":"external_pdf"%' THEN 'PDF 가이드 JSON'
    WHEN personalized_guide::text LIKE '%"scenes"%' THEN 'AI 가이드 JSON (scenes)'
    WHEN personalized_guide::text LIKE '{%' THEN '기타 JSON'
    ELSE 'TEXT 가이드'
  END AS guide_type,
  COUNT(*) AS count
FROM applications
GROUP BY 1
ORDER BY count DESC;


-- ============================
-- 14. campaigns 가이드 설정 확인
-- ============================
SELECT '=== 캠페인별 가이드 설정 ===' AS check_type;

SELECT
  id,
  title,
  campaign_type,
  guide_type,
  CASE WHEN guide_pdf_url IS NOT NULL THEN 'SET' ELSE 'NULL' END AS guide_pdf_url,
  CASE WHEN shooting_guide_content IS NOT NULL THEN 'SET (' || LENGTH(shooting_guide_content::text) || ' chars)' ELSE 'NULL' END AS shooting_guide_content,
  CASE WHEN shooting_guide_url IS NOT NULL THEN 'SET' ELSE 'NULL' END AS shooting_guide_url,
  CASE WHEN week1_guide IS NOT NULL THEN 'SET' ELSE 'NULL' END AS week1_guide,
  CASE WHEN week2_guide IS NOT NULL THEN 'SET' ELSE 'NULL' END AS week2_guide,
  CASE WHEN week3_guide IS NOT NULL THEN 'SET' ELSE 'NULL' END AS week3_guide,
  CASE WHEN week4_guide IS NOT NULL THEN 'SET' ELSE 'NULL' END AS week4_guide,
  meta_ad_code_requested,
  requires_clean_video
FROM campaigns
ORDER BY created_at DESC;


-- ============================
-- 15. 진행중인 캠페인의 submission 데이터 연결 체크
-- ============================
SELECT '=== 진행중 캠페인 submission 연결 ===' AS check_type;

SELECT
  a.id AS application_id,
  a.campaign_id,
  c.title AS campaign_title,
  a.status AS application_status,
  a.personalized_guide IS NOT NULL AS has_guide,
  CASE
    WHEN a.personalized_guide::text LIKE '%"scenes"%' THEN 'AI guide'
    WHEN a.personalized_guide::text LIKE '%"type":"external_pdf"%' THEN 'PDF guide'
    WHEN a.personalized_guide IS NOT NULL THEN 'Text guide'
    ELSE 'No guide'
  END AS guide_type,
  (SELECT COUNT(*) FROM campaign_submissions cs WHERE cs.application_id = a.id) AS submission_count
FROM applications a
LEFT JOIN campaigns c ON c.id = a.campaign_id
WHERE a.status IN ('approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed')
ORDER BY a.created_at DESC
LIMIT 50;


-- ============================
-- 16. campaign_submissions 테이블 생성 SQL (없는 경우)
-- ============================
SELECT '=== campaign_submissions 생성 SQL (테이블 없으면 실행) ===' AS info;

/*
-- campaign_submissions 테이블이 MISSING인 경우 아래를 실행하세요:

CREATE TABLE IF NOT EXISTS campaign_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  step_number INTEGER DEFAULT 1,
  workflow_status TEXT DEFAULT 'guide_pending',

  -- 영상 파일
  video_file_path TEXT,
  video_file_url TEXT,
  video_file_name TEXT,
  video_file_size BIGINT,
  video_uploaded_at TIMESTAMPTZ,

  -- 클린 영상
  clean_video_file_path TEXT,
  clean_video_file_url TEXT,
  clean_video_file_name TEXT,
  clean_video_uploaded_at TIMESTAMPTZ,

  -- SNS
  sns_platform TEXT,
  sns_url TEXT,
  sns_uploaded_at TIMESTAMPTZ,

  -- 광고 코드
  ad_code TEXT,

  -- 수정 요청
  revision_notes TEXT,
  revision_requests JSONB DEFAULT '[]'::JSONB,

  -- 포인트
  points_amount INTEGER DEFAULT 0,
  points_paid_at TIMESTAMPTZ,

  -- 마감일
  video_deadline TIMESTAMPTZ,
  sns_deadline TIMESTAMPTZ,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;

-- 유저가 자기 submission 조회 가능
CREATE POLICY "Users can view own submissions" ON campaign_submissions
  FOR SELECT USING (auth.uid() = user_id);

-- 유저가 자기 submission 생성 가능
CREATE POLICY "Users can insert own submissions" ON campaign_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 유저가 자기 submission 수정 가능
CREATE POLICY "Users can update own submissions" ON campaign_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_submissions_application ON campaign_submissions(application_id);
CREATE INDEX idx_submissions_user ON campaign_submissions(user_id);
CREATE INDEX idx_submissions_campaign ON campaign_submissions(campaign_id);
*/


-- ============================
-- 17. Storage 버킷 생성 SQL (없는 경우)
-- ============================
SELECT '=== Storage 버킷 생성 SQL (없으면 실행) ===' AS info;

/*
-- campaign-videos 버킷이 MISSING인 경우:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-videos',
  'campaign-videos',
  true,
  2147483648,  -- 2GB
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg', 'video/3gpp']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Users can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'campaign-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-videos');

CREATE POLICY "Users can update own videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'campaign-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/


-- ============================
-- 18. applications에 없는 컬럼 추가 SQL
-- ============================
SELECT '=== applications 컬럼 추가 SQL (MISSING 컬럼만 실행) ===' AS info;

/*
-- personalized_guide 컬럼이 MISSING인 경우:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS personalized_guide JSONB;

-- revision_requests 컬럼이 MISSING인 경우:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS revision_requests JSONB DEFAULT '[]'::JSONB;

-- guide_sent 컬럼이 MISSING인 경우:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS guide_sent BOOLEAN DEFAULT false;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS guide_sent_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS guide_url TEXT;

-- google_drive_url 컬럼이 MISSING인 경우:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS google_slides_url TEXT;

-- tracking_number 컬럼이 MISSING인 경우:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS shipping_date TIMESTAMPTZ;
*/
