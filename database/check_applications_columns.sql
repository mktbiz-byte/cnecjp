-- applications 테이블의 모든 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- 해당 캠페인의 신청서 데이터 확인 (기본 컬럼만)
SELECT 
    a.id,
    a.applicant_name,
    a.age,
    a.additional_info,
    up.name,
    up.age as profile_age
FROM applications a
LEFT JOIN user_profiles up ON a.user_id = up.user_id
WHERE a.campaign_id = '4bea33a5-e70b-450c-bf64-ccd02941e7f1'
ORDER BY a.created_at DESC;

-- 질문 답변 관련 컬럼 찾기
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'applications'
  AND (column_name LIKE '%question%' OR column_name LIKE '%answer%')
ORDER BY column_name;
