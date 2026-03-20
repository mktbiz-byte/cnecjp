-- 사용자 및 관리자 권한 확인 쿼리

-- 1. 모든 사용자 목록 (auth.users 테이블)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. user_profiles 테이블의 사용자 정보
SELECT 
    user_id,
    name,
    email,
    phone,
    is_admin,
    is_approved,
    created_at,
    updated_at
FROM user_profiles
ORDER BY created_at DESC;

-- 3. 관리자 권한을 가진 사용자들
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.is_admin,
    up.is_approved,
    au.email as auth_email,
    au.created_at as auth_created_at,
    au.last_sign_in_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.is_admin = true
ORDER BY up.created_at DESC;

-- 4. 승인된 사용자들
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.is_admin,
    up.is_approved,
    au.email as auth_email,
    au.last_sign_in_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.is_approved = true
ORDER BY up.created_at DESC;

-- 5. 승인되지 않은 사용자들
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.is_admin,
    up.is_approved,
    au.email as auth_email,
    au.created_at as auth_created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.is_approved = false OR up.is_approved IS NULL
ORDER BY up.created_at DESC;

-- 6. auth.users에는 있지만 user_profiles에 없는 사용자들
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL
ORDER BY au.created_at DESC;

-- 7. 사용자 통계
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN last_sign_in_at IS NOT NULL THEN 1 END) as users_who_signed_in
FROM auth.users;

SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_users,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_users
FROM user_profiles;
