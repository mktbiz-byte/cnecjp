// 출금 내역 로딩 부분만 수정된 버전
const loadWithdrawalHistory = async (userId) => {
  try {
    console.log('출금 내역 로딩 시작 - 사용자 ID:', userId)
    
    const { data: pointWithdrawals, error: pointError } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .lt('amount', 0) // 음수 금액 (출금)
      .order('created_at', { ascending: false })
    
    if (pointError) {
      console.warn('point_transactions에서 출금 데이터 로드 실패:', pointError)
      return []
    } else {
      // point_transactions 데이터를 withdrawal_requests 형식으로 변환
      const formattedWithdrawals = (pointWithdrawals || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        amount: Math.abs(item.amount),
        status: item.transaction_type === 'spent' ? 'completed' : 'pending',
        withdrawal_method: 'paypal',
        paypal_email: extractPayPalFromDescription(item.description),
        paypal_name: extractPayPalFromDescription(item.description),
        reason: item.description,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
      console.log('출금 내역 로딩 성공:', formattedWithdrawals.length)
      return formattedWithdrawals
    }
  } catch (withdrawErr) {
    console.warn('출금 내역 로딩 실패:', withdrawErr)
    return []
  }
}

// 사용법:
// const withdrawalHistory = await loadWithdrawalHistory(user.id)
// setWithdrawals(withdrawalHistory)
