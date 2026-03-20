-- 관리자 권한 시스템 수정
-- user_profiles 테이블에 role 컬럼 추가 (이미 존재하면 무시)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE user_profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    EXCEPTION
        WHEN duplicate_column THEN 
            RAISE NOTICE 'role 컬럼이 이미 존재합니다.';
    END;
END $$;

-- 기존 관리자 사용자들에게 admin 역할 부여
UPDATE user_profiles SET role = 'admin' 
WHERE email IN ('syy030602y@gmail.com', 'acrossx@howlab.co.kr', 'howlabmkt@gmail.com', 'mkt_biz@cnec.co.kr');

-- 나머지 사용자들은 기본적으로 user 역할
UPDATE user_profiles SET role = 'user' WHERE role IS NULL OR role = '';

-- 확인 쿼리
SELECT email, name, role FROM user_profiles ORDER BY role DESC, email;
