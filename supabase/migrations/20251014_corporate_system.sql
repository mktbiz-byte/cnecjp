-- 기업 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS corporate_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기업 주문 테이블 생성
CREATE TABLE IF NOT EXISTS corporate_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  corporate_user_id UUID NOT NULL REFERENCES corporate_users(id) ON DELETE CASCADE,
  order_name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('basic', 'review', 'tutorial', 'custom')),
  budget INTEGER NOT NULL,
  creator_count INTEGER NOT NULL,
  min_followers INTEGER,
  max_followers INTEGER,
  age_range TEXT,
  gender TEXT,
  categories TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문-캠페인 연결 테이블 생성
CREATE TABLE IF NOT EXISTS order_campaign_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES corporate_orders(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, campaign_id)
);

-- 기업 사용자 인증 함수
CREATE OR REPLACE FUNCTION corporate_user_login(p_email TEXT, p_password TEXT)
RETURNS JSON AS $$
DECLARE
  v_user corporate_users;
  v_password_match BOOLEAN;
  v_token TEXT;
BEGIN
  -- 사용자 조회
  SELECT * INTO v_user FROM corporate_users WHERE email = p_email AND status = 'active';
  
  IF v_user IS NULL THEN
    RETURN json_build_object('success', FALSE, 'message', '사용자를 찾을 수 없거나 계정이 활성화되지 않았습니다.');
  END IF;
  
  -- 비밀번호 확인 (실제로는 암호화된 비밀번호 비교 로직이 필요)
  v_password_match := (v_user.password_hash = crypt(p_password, v_user.password_hash));
  
  IF NOT v_password_match THEN
    RETURN json_build_object('success', FALSE, 'message', '비밀번호가 일치하지 않습니다.');
  END IF;
  
  -- JWT 토큰 생성 (실제로는 Supabase의 auth.sign_up 함수 사용)
  v_token := 'sample_token';
  
  RETURN json_build_object(
    'success', TRUE,
    'user', json_build_object(
      'id', v_user.id,
      'email', v_user.email,
      'company_name', v_user.company_name
    ),
    'token', v_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기업 사용자 등록 함수
CREATE OR REPLACE FUNCTION corporate_user_register(
  p_email TEXT,
  p_password TEXT,
  p_company_name TEXT,
  p_company_size TEXT DEFAULT NULL,
  p_industry TEXT DEFAULT NULL,
  p_contact_person TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 이메일 중복 확인
  IF EXISTS (SELECT 1 FROM corporate_users WHERE email = p_email) THEN
    RETURN json_build_object('success', FALSE, 'message', '이미 등록된 이메일입니다.');
  END IF;
  
  -- 사용자 등록
  INSERT INTO corporate_users (
    email,
    password_hash,
    company_name,
    company_size,
    industry,
    contact_person,
    contact_phone,
    address,
    website
  ) VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_company_name,
    p_company_size,
    p_industry,
    p_contact_person,
    p_contact_phone,
    p_address,
    p_website
  ) RETURNING id INTO v_user_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', '기업 사용자 등록이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
    'user_id', v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주문 생성 함수
CREATE OR REPLACE FUNCTION create_corporate_order(
  p_corporate_user_id UUID,
  p_order_name TEXT,
  p_description TEXT,
  p_template_type TEXT,
  p_budget INTEGER,
  p_creator_count INTEGER,
  p_min_followers INTEGER DEFAULT NULL,
  p_max_followers INTEGER DEFAULT NULL,
  p_age_range TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_categories TEXT[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- 사용자 존재 및 활성 상태 확인
  IF NOT EXISTS (SELECT 1 FROM corporate_users WHERE id = p_corporate_user_id AND status = 'active') THEN
    RETURN json_build_object('success', FALSE, 'message', '유효하지 않은 사용자이거나 계정이 활성화되지 않았습니다.');
  END IF;
  
  -- 주문 생성
  INSERT INTO corporate_orders (
    corporate_user_id,
    order_name,
    description,
    template_type,
    budget,
    creator_count,
    min_followers,
    max_followers,
    age_range,
    gender,
    categories
  ) VALUES (
    p_corporate_user_id,
    p_order_name,
    p_description,
    p_template_type,
    p_budget,
    p_creator_count,
    p_min_followers,
    p_max_followers,
    p_age_range,
    p_gender,
    p_categories
  ) RETURNING id INTO v_order_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', '주문이 성공적으로 생성되었습니다.',
    'order_id', v_order_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주문을 캠페인으로 변환하는 함수 (관리자용)
CREATE OR REPLACE FUNCTION convert_order_to_campaign(
  p_order_id UUID,
  p_admin_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_order corporate_orders;
  v_campaign_id UUID;
BEGIN
  -- 주문 정보 조회
  SELECT * INTO v_order FROM corporate_orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RETURN json_build_object('success', FALSE, 'message', '주문을 찾을 수 없습니다.');
  END IF;
  
  -- 주문 상태 확인
  IF v_order.status != 'pending' THEN
    RETURN json_build_object('success', FALSE, 'message', '이미 처리된 주문입니다.');
  END IF;
  
  -- 캠페인 생성 (실제 campaigns 테이블 구조에 맞게 수정 필요)
  INSERT INTO campaigns (
    name,
    description,
    budget,
    creator_count,
    status,
    created_by
  ) VALUES (
    v_order.order_name,
    v_order.description,
    v_order.budget,
    v_order.creator_count,
    'draft',
    p_admin_id
  ) RETURNING id INTO v_campaign_id;
  
  -- 주문-캠페인 매핑
  INSERT INTO order_campaign_mapping (order_id, campaign_id)
  VALUES (p_order_id, v_campaign_id);
  
  -- 주문 상태 업데이트
  UPDATE corporate_orders
  SET status = 'approved', updated_at = NOW()
  WHERE id = p_order_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', '주문이 캠페인으로 성공적으로 변환되었습니다.',
    'campaign_id', v_campaign_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 정책 설정
ALTER TABLE corporate_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_campaign_mapping ENABLE ROW LEVEL SECURITY;

-- 기업 사용자는 자신의 정보만 볼 수 있음
CREATE POLICY corporate_users_policy ON corporate_users
  FOR ALL
  USING (auth.uid() = id);

-- 기업 사용자는 자신의 주문만 볼 수 있음
CREATE POLICY corporate_orders_policy ON corporate_orders
  FOR ALL
  USING (corporate_user_id = auth.uid());

-- 관리자는 모든 기업 사용자와 주문을 볼 수 있음
CREATE POLICY admin_corporate_users_policy ON corporate_users
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_corporate_orders_policy ON corporate_orders
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- 인덱스 생성
CREATE INDEX idx_corporate_orders_user_id ON corporate_orders(corporate_user_id);
CREATE INDEX idx_order_campaign_mapping_order_id ON order_campaign_mapping(order_id);
CREATE INDEX idx_order_campaign_mapping_campaign_id ON order_campaign_mapping(campaign_id);
