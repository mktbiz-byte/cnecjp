-- applications 테이블 구조 확인

-- 1. applications 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- 2. 완료된 신청서 확인 (기본 정보만)
SELECT 
    a.id,
    a.user_id,
    a.status,
    a.created_at,
    a.updated_at
FROM applications a
WHERE a.status = 'completed'
ORDER BY a.updated_at DESC
LIMIT 5;

-- 3. 모든 신청서 상태 확인
SELECT status, COUNT(*) as count
FROM applications
GROUP BY status;

-- 4. SNS 관련 컬럼이 있는지 확인 (video_links 등)
SELECT 
    a.id,
    a.user_id,
    a.status,
    a.video_links,
    a.additional_info
FROM applications a
WHERE a.video_links IS NOT NULL
ORDER BY a.updated_at DESC
LIMIT 5;
