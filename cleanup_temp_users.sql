-- 비정상 사용자 데이터 정리 스크립트

-- 1. 먼저 temp_ 사용자들의 신청서 확인
SELECT ca.id, ca.user_id, up.email, ca.campaign_id, ca.status, ca.created_at
FROM campaign_applications ca
LEFT JOIN user_profiles up ON ca.user_id = up.id
WHERE up.email LIKE 'temp_%'
ORDER BY ca.created_at DESC;

-- 2. temp_ 사용자들의 프로필 확인
SELECT id, user_id, name, email, created_at
FROM user_profiles
WHERE email LIKE 'temp_%'
ORDER BY created_at DESC;

-- 3. 실제 정리 작업 (주의: 실행 전 백업 필요)
-- 먼저 관련 신청서들 삭제
/*
DELETE FROM campaign_applications 
WHERE user_id IN (
    SELECT id FROM user_profiles WHERE email LIKE 'temp_%'
);

-- 그 다음 사용자 프로필 삭제
DELETE FROM user_profiles WHERE email LIKE 'temp_%';

-- 마지막으로 auth.users 테이블에서 삭제 (관리자 권한 필요)
-- DELETE FROM auth.users WHERE email LIKE 'temp_%';
*/

-- 4. 정리 후 확인
SELECT COUNT(*) as temp_users_count
FROM user_profiles
WHERE email LIKE 'temp_%';
