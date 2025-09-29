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

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: `${getCurrentSiteUrl()}/auth/callback`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// 인증 관련 함수들
export const auth = {
  // 현재 사용자 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // 세션 가져오기
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // 구글 로그인
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getCurrentSiteUrl()}/auth/callback`
      }
    })
    if (error) throw error
    return data
  },

  // 이메일 로그인
  async signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // 이메일 회원가입
  async signUpWithEmail(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    if (error) throw error
    return data
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 인증 상태 변경 리스너
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 데이터베이스 관련 함수들
export const database = {
  // 캠페인 관련
  campaigns: {
    // 모든 캠페인 가져오기
    async getAll() {
      try {
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
      } catch (error) {
        console.error('Campaigns getAll 함수 오류:', error)
        throw error
      }
    },

    // 활성 캠페인만 가져오기
    async getActive() {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    // 특정 캠페인 가져오기
    async getById(id) {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    // 캠페인 생성
    async create(campaignData) {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single()
      if (error) throw error
      return data
    },

    // 캠페인 업데이트
    async update(id, updates) {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    // 캠페인 삭제
    async delete(id) {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // 신청 관련
  applications: {
    // 모든 신청 가져오기
    async getAll() {
      try {
        console.log('Applications getAll() 호출')
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            campaigns (
              title,
              brand,
              reward_amount,
              google_drive_url,
              google_slides_url
            )
          `)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Applications getAll error:', error)
          throw error
        }
        
        console.log('Applications 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      } catch (error) {
        console.error('Applications getAll 함수 오류:', error)
        throw error
      }
    },

    // 사용자별 신청 가져오기
    async getByUser(userId) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns!inner (
            id,
            title,
            brand,
            reward_amount,
            status,
            google_drive_url,
            google_slides_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    // 캠페인별 신청 가져오기
    async getByCampaign(campaignId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    // 특정 사용자의 특정 캠페인 신청 확인
    async getByUserAndCampaign(userId, campaignId) {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // 신청 생성
    async create(applicationData) {
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single()
      if (error) throw error
      return data
    },

    // 신청 상태 업데이트
    async updateStatus(id, status) {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    // SNS URL 업데이트
    async updateSnsUrls(id, snsUrls) {
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
    },

    // 신청 업데이트
    async update(id, updateData) {
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
    },

    // 포인트 요청
    async requestPoints(id) {
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
    }
  },

  // 사용자 프로필 관련
  userProfiles: {
    // 프로필 가져오기 (user_id로 검색)
    async get(userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // 프로필 가져오기 (id로 검색)
    async getById(id) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // 모든 프로필 가져오기 (관리자용)
    async getAll() {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    // 프로필 생성 또는 업데이트
    async upsert(profileData) {
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
    },

    // 프로필 업데이트
    async update(userId, updateData) {
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
    }
  },

  // 포인트 관련
  points: {
    // 사용자 포인트 잔액 가져오기
    async getBalance(userId) {
      const { data, error } = await supabase
        .from('user_points')
        .select('balance')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code === 'PGRST116') {
        // 포인트 레코드가 없으면 0 반환
        return 0
      }
      if (error) throw error
      return data?.balance || 0
    },

    // 포인트 추가
    async add(userId, amount, description = '') {
      // 현재 잔액 가져오기
      const currentBalance = await this.getBalance(userId)
      const newBalance = currentBalance + amount

      // 포인트 잔액 업데이트
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_points')
        .upsert([{
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (balanceError) throw balanceError

      // 포인트 히스토리 추가
      const { data: historyData, error: historyError } = await supabase
        .from('point_history')
        .insert([{
          user_id: userId,
          amount: amount,
          type: 'earned',
          description: description,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (historyError) throw historyError

      return { balance: balanceData, history: historyData }
    },

    // 포인트 차감
    async subtract(userId, amount, description = '') {
      const currentBalance = await this.getBalance(userId)
      
      if (currentBalance < amount) {
        throw new Error('Insufficient points')
      }

      const newBalance = currentBalance - amount

      // 포인트 잔액 업데이트
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_points')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (balanceError) throw balanceError

      // 포인트 히스토리 추가
      const { data: historyData, error: historyError } = await supabase
        .from('point_history')
        .insert([{
          user_id: userId,
          amount: -amount,
          type: 'spent',
          description: description,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (historyError) throw historyError

      return { balance: balanceData, history: historyData }
    },

    // 포인트 히스토리 가져오기
    async getHistory(userId) {
      const { data, error } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  },

  // 출금 관련
  withdrawals: {
    // 사용자별 출금 내역 가져오기
    async getByUser(userId) {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    // 모든 출금 내역 가져오기 (관리자용)
    async getAll() {
      try {
        console.log('Withdrawals getAll() 호출')
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Withdrawals getAll error:', error)
          throw error
        }
        
        console.log('Withdrawals 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      } catch (error) {
        console.error('Withdrawals getAll 함수 오류:', error)
        throw error
      }
    },

    // 출금 요청 생성
    async create(withdrawalData) {
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          ...withdrawalData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // 출금 상태 업데이트
    async updateStatus(id, status, notes = '') {
      const { data, error } = await supabase
        .from('withdrawals')
        .update({
          status,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // 출금 승인 처리
    async approve(id, adminNotes = '') {
      // 출금 정보 가져오기
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single()
      
      if (withdrawalError) throw withdrawalError

      // 사용자 포인트에서 차감
      await database.points.subtract(
        withdrawal.user_id, 
        withdrawal.amount, 
        `출금 승인 - ${id}`
      )

      // 출금 상태를 승인으로 변경
      return await this.updateStatus(id, 'approved', adminNotes)
    }
  },

  // 포인트 요청 관련
  pointRequests: {
    // 포인트 요청 생성
    async create(requestData) {
      const { data, error } = await supabase
        .from('point_requests')
        .insert([{
          ...requestData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // 사용자별 포인트 요청 가져오기
    async getByUser(userId) {
      const { data, error } = await supabase
        .from('point_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    // 모든 포인트 요청 가져오기 (관리자용)
    async getAll() {
      try {
        console.log('PointRequests getAll() 호출')
        const { data, error } = await supabase
          .from('point_requests')
          .select(`
            *,
            applications (
              campaign_id,
              campaigns (
                title,
                brand
              )
            )
          `)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('PointRequests getAll error:', error)
          throw error
        }
        
        console.log('PointRequests 데이터 로드 성공:', data?.length || 0, '개')
        return data || []
      } catch (error) {
        console.error('PointRequests getAll 함수 오류:', error)
        throw error
      }
    },

    // 포인트 요청 상태 업데이트
    async updateStatus(id, status, adminNotes = '') {
      const { data, error } = await supabase
        .from('point_requests')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // 이메일 템플릿 관련
  emailTemplates: {
    // 모든 템플릿 가져오기
    async getAll() {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('type')
      
      if (error) throw error
      return data
    },

    // 템플릿 생성 또는 업데이트
    async upsert(templateData) {
      const { data, error } = await supabase
        .from('email_templates')
        .upsert([templateData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // 특정 타입의 템플릿 가져오기
    async getByType(type) {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', type)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  },

  // 통계 관련
  stats: {
    // 전체 통계 가져오기
    async getOverall() {
      try {
        const [campaigns, applications, userProfiles] = await Promise.all([
          supabase.from('campaigns').select('id, reward_amount, status'),
          supabase.from('applications').select('id, status'),
          supabase.from('user_profiles').select('id')
        ])

        const totalCampaigns = campaigns.data?.length || 0
        const totalApplications = applications.data?.length || 0
        const totalUsers = userProfiles.data?.length || 0
        const totalRewards = campaigns.data?.reduce((sum, campaign) => sum + (campaign.reward_amount || 0), 0) || 0

        return {
          totalCampaigns,
          totalApplications,
          totalUsers,
          totalRewards
        }
      } catch (error) {
        console.error('Stats loading error:', error)
        // 오류 발생 시 기본값 반환
        return {
          totalCampaigns: 0,
          totalApplications: 0,
          totalUsers: 0,
          totalRewards: 0
        }
      }
    }
  }
}

export default supabase



  // 사용자 관련 (userProfiles 별칭)
  users: {
    async getAll() {
      console.log('Supabase users.getAll() 호출 (user_profiles 별칭)');
      // 실제로는 userProfiles.getAll()을 호출합니다.
      return database.userProfiles.getAll();
    }
  }
};
