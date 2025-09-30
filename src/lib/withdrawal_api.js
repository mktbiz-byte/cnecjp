// PayPal 출금 시스템 API
import { database } from './supabase'

// withdrawals 테이블 API 추가
const withdrawalAPI = {
  // 모든 출금 요청 조회
  async getAll() {
    return database.safeQuery(async () => {
      const { data, error } = await database.supabase
        .from('withdrawals')
        .select(`
          *,
          user_profiles!withdrawals_user_id_fkey(name, email)
        `)
        .order('requested_at', { ascending: false })
      if (error) throw error
      return data
    })
  },

  // 사용자별 출금 내역 조회
  async getByUser(userId) {
    return database.safeQuery(async () => {
      const { data, error } = await database.supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
      if (error) throw error
      return data
    })
  },

  // 출금 요청 생성
  async create(withdrawalData) {
    return database.safeQuery(async () => {
      const { data, error } = await database.supabase
        .from('withdrawals')
        .insert([{
          user_id: withdrawalData.user_id,
          amount: withdrawalData.amount,
          bank_info: {
            paypal_email: withdrawalData.paypal_email,
            paypal_name: withdrawalData.paypal_name
          },
          status: 'pending',
          requested_at: new Date().toISOString()
        }])
        .select()
        .single()
      if (error) throw error
      return data
    })
  },

  // 출금 상태 업데이트
  async updateStatus(id, status, processedBy = null, notes = null) {
    return database.safeQuery(async () => {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'completed' || status === 'rejected') {
        updateData.processed_at = new Date().toISOString()
        if (processedBy) updateData.processed_by = processedBy
      }
      
      if (notes) updateData.notes = notes

      const { data, error } = await database.supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    })
  },

  // 출금 요청 삭제
  async delete(id) {
    return database.safeQuery(async () => {
      const { error } = await database.supabase
        .from('withdrawals')
        .delete()
        .eq('id', id)
      if (error) throw error
    })
  }
}

// user_points 테이블 API 추가
const userPointsAPI = {
  // 사용자 총 포인트 조회
  async getUserTotalPoints(userId) {
    return database.safeQuery(async () => {
      const { data, error } = await database.supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .eq('status', 'approved')
      
      if (error) throw error
      
      const totalPoints = data.reduce((sum, record) => sum + record.points, 0)
      return totalPoints
    })
  },

  // 사용자 포인트 내역 조회
  async getUserPoints(userId) {
    return database.safeQuery(async () => {
      const { data, error } = await database.supabase
        .from('user_points')
        .select(`
          *,
          campaigns!user_points_campaign_id_fkey(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    })
  },

  // 포인트 차감 (출금 시)
  async deductPoints(userId, amount, reason = '출금 신청') {
    return database.safeQuery(async () => {
      const { data, error } = await database.supabase
        .from('user_points')
        .insert([{
          user_id: userId,
          points: -amount,
          reason: reason,
          status: 'approved',
          approved_at: new Date().toISOString()
        }])
        .select()
        .single()
      if (error) throw error
      return data
    })
  }
}

export { withdrawalAPI, userPointsAPI }
