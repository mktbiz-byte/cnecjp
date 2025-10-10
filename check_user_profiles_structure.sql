-- user_profiles 테이블 구조 확인

-- 1. 테이블 구조 확인
\d user_profiles;

-- 2. 실제 컬럼 목록 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. 샘플 데이터 확인 (처음 5개 행)
SELECT * FROM user_profiles LIMIT 5;

-- 4. 완료된 신청서와 사용자 정보 조인 (실제 컬럼명 사용)
SELECT 
    a.id,
    a.user_id,
    a.applicant_name,
    a.status,
    a.sns_upload_url,
    up.name,
    up.email,
    up.phone,
    c.title as campaign_title
FROM applications a
LEFT JOIN user_profiles up ON a.user_id = up.user_id
LEFT JOIN campaigns c ON a.campaign_id = c.id
WHERE a.status = 'completed'
ORDER BY a.updated_at DESC
LIMIT 10;
