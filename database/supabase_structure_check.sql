-- Supabase 데이터베이스 구조 확인을 위한 SQL 쿼리
-- 이 쿼리들을 Supabase SQL Editor에서 실행하여 현재 데이터베이스 구조를 확인하세요

-- 1. 모든 테이블 목록 조회
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. 각 테이블의 컬럼 정보 조회
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. 기본키 및 제약조건 조회
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 4. 외래키 관계 조회
SELECT 
    tc.table_name AS source_table,
    kcu.column_name AS source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. 인덱스 정보 조회
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. RLS (Row Level Security) 정책 조회
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. 각 테이블의 데이터 개수 확인 (선택적으로 실행)
-- 주의: 데이터가 많은 경우 시간이 오래 걸릴 수 있습니다
/*
SELECT 
    'campaigns' as table_name, 
    COUNT(*) as row_count 
FROM campaigns
UNION ALL
SELECT 
    'applications' as table_name, 
    COUNT(*) as row_count 
FROM applications
UNION ALL
SELECT 
    'user_profiles' as table_name, 
    COUNT(*) as row_count 
FROM user_profiles
UNION ALL
SELECT 
    'email_templates' as table_name, 
    COUNT(*) as row_count 
FROM email_templates;
*/

-- 8. 함수 및 트리거 조회
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'
ORDER BY p.proname;

-- 9. 트리거 정보 조회
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. 뷰 정보 조회
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
