-- SNS 투고 신청 데이터 확인 스크립트

-- 1. 최근 applications 테이블의 video_links 업데이트 확인
SELECT 
    id,
    user_id,
    campaign_id,
    campaign_title,
    video_links,
    additional_info,
    status,
    created_at,
    updated_at
FROM applications 
WHERE video_links IS NOT NULL 
   OR additional_info IS NOT NULL
ORDER BY updated_at DESC 
LIMIT 10;

-- 2. 최근 point_transactions에서 SNS 업로드 관련 기록 확인
SELECT 
    id,
    user_id,
    campaign_id,
    application_id,
    transaction_type,
    amount,
    description,
    created_at
FROM point_transactions 
WHERE description LIKE '%SNS%' 
   OR description LIKE '%업로드%'
   OR description LIKE '%投稿%'
   OR transaction_type = 'pending'
ORDER BY created_at DESC 
LIMIT 10;

-- 3. 특정 사용자의 최근 활동 확인 (사용자 ID를 알고 있다면)
-- SELECT 
--     a.id as application_id,
--     a.campaign_title,
--     a.video_links,
--     a.additional_info,
--     a.updated_at as app_updated,
--     pt.id as transaction_id,
--     pt.transaction_type,
--     pt.amount,
--     pt.description,
--     pt.created_at as transaction_created
-- FROM applications a
-- LEFT JOIN point_transactions pt ON a.id = pt.application_id
-- WHERE a.user_id = 'USER_ID_HERE'
-- ORDER BY a.updated_at DESC, pt.created_at DESC
-- LIMIT 20;

-- 4. 오늘 날짜의 모든 SNS 관련 활동 확인
SELECT 
    'applications' as table_name,
    id,
    user_id,
    campaign_title,
    video_links,
    additional_info,
    updated_at
FROM applications 
WHERE DATE(updated_at) = CURRENT_DATE
  AND (video_links IS NOT NULL OR additional_info IS NOT NULL)

UNION ALL

SELECT 
    'point_transactions' as table_name,
    id,
    user_id,
    description as campaign_title,
    NULL as video_links,
    NULL as additional_info,
    created_at as updated_at
FROM point_transactions 
WHERE DATE(created_at) = CURRENT_DATE
  AND (description LIKE '%SNS%' OR description LIKE '%업로드%' OR description LIKE '%投稿%')

ORDER BY updated_at DESC;

-- 5. 데이터베이스 테이블 구조 확인
\d applications;
\d point_transactions;
