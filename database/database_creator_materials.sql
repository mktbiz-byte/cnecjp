-- 크리에이터별 개별 자료 관리 테이블
CREATE TABLE IF NOT EXISTS creator_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES campaign_applications(id) ON DELETE CASCADE,
  
  -- 개별 Google Drive 업로드 폴더 (크리에이터가 영상/이미지 업로드)
  google_drive_url TEXT,
  
  -- 개별 맞춤 가이드라인 (크리에이터별 다른 가이드)
  google_slides_url TEXT,
  
  -- 크리에이터별 특별 지시사항
  additional_notes TEXT,
  
  -- 자료 제공 상태
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'provided', 'accessed')),
  
  -- 크리에이터가 자료에 접근한 시간
  accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- 생성 및 수정 시간
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 유니크 제약: 캠페인별 크리에이터별 하나의 자료만
  UNIQUE(campaign_id, creator_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_creator_materials_campaign_id ON creator_materials(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creator_materials_creator_id ON creator_materials(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_materials_application_id ON creator_materials(application_id);
CREATE INDEX IF NOT EXISTS idx_creator_materials_status ON creator_materials(status);

-- RLS (Row Level Security) 정책
ALTER TABLE creator_materials ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 자료에 접근 가능
CREATE POLICY "Admins can manage all creator materials" ON creator_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 크리에이터는 자신의 자료만 조회 가능
CREATE POLICY "Creators can view their own materials" ON creator_materials
  FOR SELECT USING (
    creator_id = auth.uid() AND status = 'provided'
  );

-- 자료 접근 로그 테이블
CREATE TABLE IF NOT EXISTS creator_material_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES creator_materials(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('drive_access', 'slides_access')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 접근 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_material_access_logs_material_id ON creator_material_access_logs(material_id);
CREATE INDEX IF NOT EXISTS idx_material_access_logs_creator_id ON creator_material_access_logs(creator_id);
CREATE INDEX IF NOT EXISTS idx_material_access_logs_accessed_at ON creator_material_access_logs(accessed_at);

-- 접근 로그 RLS
ALTER TABLE creator_material_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all access logs" ON creator_material_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 자료 접근 시 자동으로 accessed_at 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_material_accessed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- creator_materials 테이블의 accessed_at 업데이트
  UPDATE creator_materials 
  SET accessed_at = NOW(), status = 'accessed'
  WHERE id = NEW.material_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 접근 로그 삽입 시 트리거
CREATE TRIGGER trigger_update_material_accessed_at
  AFTER INSERT ON creator_material_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_material_accessed_at();

-- 자료 통계 뷰
CREATE OR REPLACE VIEW creator_materials_stats AS
SELECT 
  cm.campaign_id,
  c.title as campaign_title,
  COUNT(*) as total_materials,
  COUNT(CASE WHEN cm.status = 'provided' THEN 1 END) as provided_count,
  COUNT(CASE WHEN cm.status = 'accessed' THEN 1 END) as accessed_count,
  COUNT(CASE WHEN cm.google_drive_url IS NOT NULL THEN 1 END) as drive_provided_count,
  COUNT(CASE WHEN cm.google_slides_url IS NOT NULL THEN 1 END) as slides_provided_count,
  AVG(CASE WHEN cm.accessed_at IS NOT NULL THEN 
    EXTRACT(EPOCH FROM (cm.accessed_at - cm.created_at))/3600 
  END) as avg_access_time_hours
FROM creator_materials cm
JOIN campaigns c ON cm.campaign_id = c.id
GROUP BY cm.campaign_id, c.title;

-- 크리에이터별 자료 접근 통계 뷰
CREATE OR REPLACE VIEW creator_access_stats AS
SELECT 
  cm.creator_id,
  up.name as creator_name,
  up.email as creator_email,
  COUNT(DISTINCT cm.campaign_id) as campaigns_participated,
  COUNT(CASE WHEN cm.status = 'accessed' THEN 1 END) as materials_accessed,
  COUNT(DISTINCT cal.id) as total_accesses,
  MAX(cal.accessed_at) as last_access_time
FROM creator_materials cm
JOIN user_profiles up ON cm.creator_id = up.user_id
LEFT JOIN creator_material_access_logs cal ON cm.id = cal.material_id
GROUP BY cm.creator_id, up.name, up.email;
