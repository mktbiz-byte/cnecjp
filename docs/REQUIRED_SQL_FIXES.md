# 필요한 SQL 수정사항

## 1. 사용자 프로필 데이터 확인 및 수정

현재 `user_profiles` 테이블에 데이터가 제대로 들어있는지 확인이 필요합니다.

```sql
-- 사용자 프로필 데이터 확인
SELECT 
    id,
    name,
    email,
    created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;
```

## 2. Applications 테이블과 User_profiles 테이블 연결 확인

```sql
-- 신청서와 사용자 프로필 연결 상태 확인
SELECT 
    a.id as application_id,
    a.user_id,
    a.user_name as app_user_name,
    a.user_email as app_user_email,
    up.name as profile_name,
    up.email as profile_email
FROM applications a
LEFT JOIN user_profiles up ON a.user_id = up.id
ORDER BY a.created_at DESC;
```

## 3. 누락된 사용자 프로필 생성

만약 신청서는 있지만 사용자 프로필이 없는 경우, 다음 쿼리로 생성:

```sql
-- 신청서 데이터를 기반으로 누락된 사용자 프로필 생성
INSERT INTO user_profiles (id, name, email, created_at, updated_at)
SELECT DISTINCT 
    user_id,
    user_name,
    user_email,
    NOW(),
    NOW()
FROM applications a
WHERE a.user_id IS NOT NULL 
  AND a.user_name IS NOT NULL 
  AND a.user_email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = a.user_id
  );
```

## 4. Campaign_applications 테이블 데이터 확인

```sql
-- campaign_applications 테이블에 데이터가 있는지 확인
SELECT COUNT(*) as total_count FROM campaign_applications;

-- 만약 데이터가 있다면 구조 확인
SELECT 
    id,
    campaign_id,
    user_id,
    user_name,
    user_email,
    status,
    created_at
FROM campaign_applications
ORDER BY created_at DESC
LIMIT 5;
```

## 5. 데이터 마이그레이션 (필요시)

만약 `applications` 테이블의 데이터를 `campaign_applications` 테이블로 이동해야 한다면:

```sql
-- applications 데이터를 campaign_applications로 복사
INSERT INTO campaign_applications (
    campaign_id, user_id, user_name, user_email, 
    status, created_at, updated_at
)
SELECT 
    campaign_id, user_id, user_name, user_email,
    status, created_at, updated_at
FROM applications
WHERE NOT EXISTS (
    SELECT 1 FROM campaign_applications ca 
    WHERE ca.user_id = applications.user_id 
    AND ca.campaign_id = applications.campaign_id
);
```

## 실행 순서

1. 먼저 1번과 2번 쿼리로 현재 상태 확인
2. 사용자 프로필이 누락된 경우 3번 쿼리 실행
3. campaign_applications 테이블 상태 확인 (4번)
4. 필요시 데이터 마이그레이션 (5번)

## 확인 후 알려주실 내용

- 각 쿼리의 실행 결과
- user_profiles 테이블에 데이터가 얼마나 있는지
- campaign_applications 테이블 사용 여부
- 어떤 테이블을 메인으로 사용할지 결정
