import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: window.location.origin,
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
        redirectTo: `${window.location.origin}/auth/callback`
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
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
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
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns (
            title,
            brand,
            reward_amount
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },

    // 사용자별 신청 가져오기
    async getByUser(userId) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns (
            title,
            brand,
            reward_amount,
            status
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
    }
  },

  // 사용자 프로필 관련
  userProfiles: {
    // 프로필 가져오기
    async get(userId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // 프로필 생성 또는 업데이트
    async upsert(profileData) {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([profileData])
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // 통계 관련
  stats: {
    // 전체 통계 가져오기
    async getOverall() {
      const [campaigns, applications, users] = await Promise.all([
        supabase.from('campaigns').select('id, reward_amount'),
        supabase.from('applications').select('id'),
        supabase.from('users').select('id')
      ])

      const totalCampaigns = campaigns.data?.length || 0
      const totalApplications = applications.data?.length || 0
      const totalUsers = users.data?.length || 0
      const totalRewards = campaigns.data?.reduce((sum, campaign) => sum + (campaign.reward_amount || 0), 0) || 0

      return {
        totalCampaigns,
        totalApplications,
        totalUsers,
        totalRewards
      }
    }
  }
}

export default supabase
