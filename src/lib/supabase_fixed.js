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
  // 네트워크 재시도 설정
  db: {
    schema: 'public',
  },
  // 타임아웃 설정
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000), // 30초 타임아웃
    })
  }
})

// 인증 관련 함수들
export const auth = {
  // 현재 사용자 가져오기
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

  // 세션 가져오기
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

  // 구글 로그인
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

  // 이메일 로그인
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

  // 이메일 회원가입
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

  // 로그아웃
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  },

  // 인증 상태 변경 리스너
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
      
      // 권한 오류인 경우 즉시 빈 결과 반환
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.warn('권한 오류로 인해 빈 결과 반환')
        return []
      }
      
      if (i === retries - 1) {
        throw error
      }
      
      // 재시도 전 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// 데이터베이스 관련 함수들
export const database = {
  // 캠페인 관련
  campaigns: {
    // 모든 캠페인 가져오기
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

    // 활성 캠페인만 가져오기
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

    // 특정 캠페인 가져오기
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

    // 캠페인 생성
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

    // 캠페인 업데이트
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

    // 캠페인 삭제
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

  // 신청 관련 - 권한 문제 해결을 위한 수정
  applications: {
    // 모든 신청 가져오기 - 권한 문제 해결
    async getAll() {
      return safeQuery(async () => {
        console.log('Applications getAll() 호출')
        try {
          // 먼저 기본 applications 데이터만 가져오기
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('Applications getAll error:', error)
            // 권한 오류인 경우 빈 배열 반환
            if (error.message.includes('permission denied') || error.message.includes('users')) {
              console.warn('Applications 테이블 권한 부족으로 빈 배열 반환')
              return []
            }
            throw error
          }
          
          console.log('Applications 데이터 로드 성공:', data?.length || 0, '개')
          
          // 캠페인 정보를 별도로 가져와서 매핑
          if (data && data.length > 0) {
            try {
              const campaignIds = [...new Set(data.map(app => app.campaign_id).filter(Boolean))]
              if (campaignIds.length > 0) {
                const { data: campaigns } = await supabase
                  .from('campaigns')
                  .select('id, title, brand, reward_amount, google_drive_url, google_slides_url')
                  .in('id', campaignIds)
                
                // 캠페인 정보를 applications에 매핑
                const applicationsWithCampaigns = data.map(app => ({
                  ...app,
                  campaigns: campaigns?.find(c => c.id === app.campaign_id) || null
                }))
                
                return applicationsWithCampaigns
              }
            } catch (campaignError) {
              console.warn('캠페인 정보 로드 실패, 기본 데이터만 반환:', campaignError)
            }
          }
          
          return data || []
        } catch (error) {
          console.error('Applications getAll 함수 오류:', error)
          return []
        }
      })
    },

    // 사용자별 신청 가져오기
    async getByUser(userId) {
      return safeQuery(async () => {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          
          if (error) {
            if (error.message.includes('permission denied')) {
              return []
            }
            throw error
          }
          
          // 캠페인 정보를 별도로 가져와서 매핑
          if (data && data.length > 0) {
            try {
              const campaignIds = [...new Set(data.map(app => app.campaign_id).filter(Boolean))]
              if (campaignIds.length > 0) {
                const { data: campaigns } = await supabase
                  .from('campaigns')
                  .select('id, title, brand, reward_amount, status, google_drive_url, google_slides_url')
                  .in('id', campaignIds)
                
                const applicationsWithCampaigns = data.map(app => ({
                  ...app,
                  campaigns: campaigns?.find(c => c.id === app.campaign_id) || null
                }))
                
                return applicationsWithCampaigns
              }
            } catch (campaignError) {
              console.warn('캠페인 정보 로드 실패:', campaignError)
            }
          }
          
          return data || []
        } catch (error) {
          console.error('getByUser 오류:', error)
          return []
        }
      })
    },

    // 캠페인별 신청 가져오기
    async getByCampaign(campaignId) {
      return safeQuery(async () => {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
          
          if (error) {
            if (error.message.includes('permission denied')) {
              return []
            }
            throw error
          }
          
          return data || []
        } catch (error) {
          console.error('getByCampaign 오류:', error)
          return []
        }
      })
    },

    // 특정 사용자의 특정 캠페인 신청 확인
    async getByUserAndCampaign(userId, campaignId) {
      return safeQuery(async () => {
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .eq('campaign_id', campaignId)
            .single()
          
          if (error && error.code !== 'PGRST116') {
            if (error.message.includes('permission denied')) {
              return null
            }
            throw error
          }
          
          return data
        } catch (error) {
          console.error('getByUserAndCampaign 오류:', error)
          return null
        }
      })
    },

    // 신청 생성
    async create(applicationData) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('applications')
          .insert([applicationData])
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    // 신청 상태 업데이트
    async updateStatus(id, status) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('applications')
          .update({ status })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      })
    },

    // SNS URL 업데이트
    async updateSnsUrls(id, snsUrls) {
      return safeQuery(async () => {
        const { data, error } = await supabase
          .from('applications')
          .update({ 
            sns_urls: snsUrls,
            status: 'sns_uploaded',
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
          .from('applications')
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
          .from('applications')
          .update({ 
            status: 'points_requested',
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
    // 프로필 가져오기 (user_id로 검색)
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

    // 프로필 가져오기 (id로 검색)
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

    // 모든 프로필 가져오기 (관리자용) - 권한 문제 해결을 위한 수정
    async getAll() {
      return safeQuery(async () => {
        console.log('UserProfiles getAll() 호출')
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('UserProfiles getAll error:', error)
            // 권한 오류인 경우 빈 배열 반환
            if (error.message.includes('permission denied') || error.message.includes('RLS')) {
              console.warn('권한 부족으로 인해 빈 배열 반환')
              return []
            }
            throw error
          }
          
          console.log('UserProfiles 데이터 로드 성공:', data?.length || 0, '개')
          return data || []
        } catch (error) {
          console.error('UserProfiles getAll 함수 오류:', error)
          // 네트워크 오류나 권한 오류인 경우 빈 배열 반환
          return []
        }
      })
    },

    // 프로필 생성 또는 업데이트
    async upsert(profileData) {
      return safeQuery(async () => {
        try {
          console.log('Upsert 시작:', profileData)
          
          // 먼저 기존 프로필이 있는지 확인
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', profileData.user_id)
            .single()
          
          if (existingProfile) {
            // 기존 프로필이 있으면 업데이트
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
            // 새 프로필 생성
            console.log('새 프로필 생성')
            const { data, error } = await supabase
              .from('user_profiles')
              .insert([{
                ...profileData,
                email: profileData.email || 'unknown@example.com' // 이메일이 필수인 경우
              }])
              .select()
              .single()
            
            if (error) throw error
            return data
          }
        } catch (error) {
          console.error('Upsert error:', error)
          throw error
        }
      })
    },

    // 프로필 업데이트
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
      // 실제로는 userProfiles.getAll()을 호출합니다.
      return database.userProfiles.getAll()
    }
  }
}

export default supabase
