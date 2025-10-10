import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWithdrawalData() {
  console.log('=== Supabase 출금 데이터 확인 ===\n')
  
  try {
    // 1. withdrawal_requests 테이블 확인
    console.log('1. withdrawal_requests 테이블 확인...')
    const { data: withdrawalRequests, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (withdrawalError) {
      console.log('❌ withdrawal_requests 테이블 오류:', withdrawalError.message)
    } else {
      console.log(`✅ withdrawal_requests 테이블: ${withdrawalRequests?.length || 0}개 레코드`)
      if (withdrawalRequests && withdrawalRequests.length > 0) {
        console.log('최근 출금 요청:')
        withdrawalRequests.forEach((item, index) => {
          console.log(`  ${index + 1}. ID: ${item.id}, 사용자: ${item.user_id}, 금액: ${item.amount}, 상태: ${item.status}, 생성일: ${item.created_at}`)
        })
      }
    }
    
    console.log('\n2. point_transactions 테이블에서 출금 관련 데이터 확인...')
    const { data: pointTransactions, error: pointError } = await supabase
      .from('point_transactions')
      .select('*')
      .lt('amount', 0) // 음수 금액 (출금)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (pointError) {
      console.log('❌ point_transactions 테이블 오류:', pointError.message)
    } else {
      console.log(`✅ point_transactions 테이블 (음수 금액): ${pointTransactions?.length || 0}개 레코드`)
      if (pointTransactions && pointTransactions.length > 0) {
        console.log('최근 음수 거래 (출금 관련):')
        pointTransactions.forEach((item, index) => {
          console.log(`  ${index + 1}. ID: ${item.id}, 사용자: ${item.user_id}, 금액: ${item.amount}, 타입: ${item.transaction_type}, 설명: ${item.description}, 생성일: ${item.created_at}`)
        })
      }
    }
    
    console.log('\n3. 특정 사용자의 출금 데이터 확인...')
    // 이지훈 사용자 ID로 확인 (mkt_biz@cnec.co.kr)
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id, name, email')
      .eq('email', 'mkt_biz@cnec.co.kr')
      .single()
    
    if (userError) {
      console.log('❌ 사용자 프로필 조회 오류:', userError.message)
    } else if (userProfile) {
      console.log(`✅ 사용자 정보: ${userProfile.name} (${userProfile.email}), ID: ${userProfile.user_id}`)
      
      // 해당 사용자의 출금 데이터 확인
      const { data: userWithdrawals, error: userWithdrawalError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .lt('amount', 0)
        .order('created_at', { ascending: false })
      
      if (userWithdrawalError) {
        console.log('❌ 사용자 출금 데이터 조회 오류:', userWithdrawalError.message)
      } else {
        console.log(`✅ 해당 사용자의 출금 관련 거래: ${userWithdrawals?.length || 0}개`)
        if (userWithdrawals && userWithdrawals.length > 0) {
          userWithdrawals.forEach((item, index) => {
            console.log(`  ${index + 1}. 금액: ${item.amount}, 타입: ${item.transaction_type}, 설명: ${item.description}, 생성일: ${item.created_at}`)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('전체 오류:', error)
  }
}

checkWithdrawalData()
