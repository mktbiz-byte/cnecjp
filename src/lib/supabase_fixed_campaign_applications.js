// campaign_applications 테이블을 위한 새로운 API 함수들
import { createClient } from '@supabase/supabase-js'

// 기존 supabase 클라이언트 설정 재사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

const getCurrentSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:5173'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: `${getCurrentSiteUrl()}/auth/callback`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-my-custom-header': 'cnec-platform',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    })
  }
})

// 재시도 로직이 포함된 안전한 쿼리 함수
const safeQuery = async (queryFn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await queryFn()
      return result
    } catch (error) {
      console.warn(`쿼리 시도 ${i + 1}/${retries} 실패:`, error.message)
      
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.warn('권한 오류로 인해 빈 결과 반환')
        return []
      }
      
      if (i === retries - 1) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// campaign_applications 테이블을 위한 API
export const campaignApplications = {
  // 모든 신청 가져오기
  async getAll() {
    return safeQuery(async () => {
      console.log('Campaign Applications getAll() 호출')
      const { data, error } = await supabase
        .from('campaign_applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Campaign Applications getAll error:', error)
        throw error
      }
      
      console.log('Campaign Applications 데이터 로드 성공:', data?.length || 0, '개')
      return data || []
    })
  },

  // 사용자별 신청 가져오기
  async getByUser(userId) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('getByUser 오류:', error)
        throw error
      }
      
      return data || []
    })
  },

  // 캠페인별 신청 가져오기
  async getByCampaign(campaignId) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('getByCampaign 오류:', error)
        throw error
      }
      
      return data || []
    })
  },

  // 특정 사용자의 특정 캠페인 신청 확인
  async getByUserAndCampaign(userId, campaignId) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('getByUserAndCampaign 오류:', error)
        throw error
      }
      
      return data
    })
  },

  // 신청 생성
  async create(applicationData) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .insert([applicationData])
        .select()
        .single()
      
      if (error) {
        console.error('Campaign Application 생성 오류:', error)
        throw error
      }
      
      console.log('Campaign Application 생성 성공:', data)
      return data
    })
  },

  // 신청 상태 업데이트
  async updateStatus(id, status) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  },

  // 비디오 업로드 링크 업데이트
  async updateVideoLinks(id, videoLinks) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .update({ 
          video_upload_links: videoLinks,
          video_uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  },

  // 신청 업데이트
  async update(id, updateData) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  },

  // 포인트 요청
  async requestPoints(id) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .update({ 
          points_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  },

  // 임시 선발 상태 업데이트
  async updateTempSelected(id, tempSelected) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .update({ 
          temp_selected: tempSelected,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  },

  // 최종 확정 상태 업데이트
  async updateFinalConfirmed(id, finalConfirmed) {
    return safeQuery(async () => {
      const { data, error } = await supabase
        .from('campaign_applications')
        .update({ 
          final_confirmed: finalConfirmed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }
}

export default { supabase, campaignApplications }
