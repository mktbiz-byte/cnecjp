import { createClient } from '@supabase/supabase-js'

// Supabase 설정 - 환경변수 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

// 현재 사이트 URL 감지
const getCurrentSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:5173'
}

// Supabase 클라이언트 생성 - 네트워크 안정성 개선
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

// 인증 관련 함수들
export const auth = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('getCurrentUser 오류:', error)
      throw error
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('getSession 오류:', error)
      throw error
    }
  },

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getCurrentSiteUrl()}/auth/callback`
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Google 로그인 오류:', error)
      throw error
    }
  },

  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('이메일 로그인 오류:', error)
      throw error
    }
  },

  async signUpWithEmail(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('이메일 회원가입 오류:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

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

// 데이터베이스 관련 함수들
export const database = {
  // 캠페인 관련
  campaigns: {
    async getAll() {
      return safeQuery(async () => {
        console.log('Supabase campaigns.getAll() 호출')
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Campaigns getAll error:', error)
          throw error
        }
        
        console.log('Campaigns 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      })
    },

    async getActive() {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        if (error) throw error
        return data
      })
    },

    async getById(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return data
      })
    },

    async create(campaignData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .insert([campaignData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async update(id, updates) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async delete(id) {
      return safeQuery(async () => {
        const { error } = await supabase
          .from('campaigns')
          .delete()
          .eq('id', id)
        if (error) throw error
      })
    }
  },

  // 신청 관련 - campaign_applications 테이블 사용
  applications: {
    async getAll() {
      return safeQuery(async () => {
        console.log('Campaign Applications getAll() 호출')
        const { data, error } = await supabase
          .from('campaign_applications')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Campaign Applications getAll error:', error)
          if (error.message.includes('permission denied')) {
            console.warn('Campaign Applications 테이블 권한 부족으로 빈 배열 반환')
            return []
          }
          throw error
        }
        
        console.log('Campaign Applications 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      })
    },

    async getByUser(userId) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('campaign_applications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('getByUser 오류:', error)
          if (error.message.includes('permission denied')) {
            return []
          }
          throw error
        }
        
        return data || []
      })
    },

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
          if (error.message.includes('permission denied')) {
            return null
          }
          throw error
        }
        
        return data
      })
    },

    async create(applicationData) {
      return safeQuery(async () => {
        console.log('Campaign Application 생성 시작:', applicationData)
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
    }
  },

  // 사용자 프로필 관련
  userProfiles: {
    async get(userId) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        return data
      })
    },

    async getById(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', id)
          .single()
        if (error && error.code !== 'PGRST116') throw error
        return data
      })
    },

    async getAll() {
      return safeQuery(async () => {
        console.log('UserProfiles getAll() 호출')
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('UserProfiles getAll error:', error)
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            console.warn('권한 부족으로 인해 빈 배열 반환')
            return []
          }
          throw error
        }
        
        console.log('UserProfiles 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      })
    },

    async upsert(profileData) {
      return safeQuery(async () => {
        console.log('Upsert 시작:', profileData)
        
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', profileData.user_id)
          .single()
        
        if (existingProfile) {
          console.log('기존 프로필 업데이트:', existingProfile.id)
          const { data, error } = await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', profileData.user_id)
            .select()
            .single()
          
          if (error) throw error
          return data
        } else {
          console.log('새 프로필 생성')
          const { data, error } = await supabase
            .from('user_profiles')
            .insert([{
              ...profileData,
              email: profileData.email || 'unknown@example.com'
            }])
            .select()
            .single()
          
          if (error) throw error
          return data
        }
      })
    },

    async update(userId, updateData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single()
        if (error) throw error
        return data
      })
    }
  },

  // 사용자 관련 (userProfiles 별칭)
  users: {
    async getAll() {
      console.log('Supabase users.getAll() 호출 (user_profiles 별칭)')
      return database.userProfiles.getAll()
    }
  },

  // 이메일 템플릿 관련
  emailTemplates: {
    async getAll() {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('template_type', { ascending: true })
        if (error) throw error
        return data || []
      })
    },

    async getById(id) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        return data
      })
    },

    async create(templateData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .insert([templateData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async upsert(templateData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .upsert([templateData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async update(id, updates) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    async delete(id) {
      return safeQuery(async () => {
        const { error } = await supabase
          .from('email_templates')
          .delete()
          .eq('id', id)
        if (error) throw error
      })
    },

    async getByCategory(category) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('template_type', category)
        if (error) throw error
        return data || []
      })
    }
  }
}

export default supabase
