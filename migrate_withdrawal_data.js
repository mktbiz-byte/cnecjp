import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

const supabase = createClient(supabaseUrl, supabaseKey)

// PayPal 정보 추출 함수
function extractPayPalFromDescription(description) {
  if (!description) return ''
  
  // "PayPal: email@example.com" 형식에서 이메일 추출
  const paypalMatch = description.match(/PayPal:\s*([^)]+)/)
  if (paypalMatch) {
    return paypalMatch[1].trim()
  }
  
  // 이메일 패턴 직접 추출
  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  if (emailMatch) {
    return emailMatch[1]
  }
  
  return ''
}

async function migrateWithdrawalData() {
  console.log('=== point_transactions → withdrawal_requests 마이그레이션 ===\n')
  
  try {
    // 1. point_transactions에서 출금 관련 데이터 가져오기
    console.log('1. point_transactions에서 출금 관련 데이터 조회...')
    const { data: pointTransactions, error: pointError } = await supabase
      .from('point_transactions')
      .select('*')
      .lt('amount', 0) // 음수 금액 (출금)
      .order('created_at', { ascending: false })
    
    if (pointError) {
      console.log('❌ point_transactions 조회 오류:', pointError.message)
      return
    }
    
    console.log(`✅ ${pointTransactions?.length || 0}개의 출금 관련 거래 발견`)
    
    if (!pointTransactions || pointTransactions.length === 0) {
      console.log('마이그레이션할 데이터가 없습니다.')
      return
    }
    
    // 2. 중복 제거 및 데이터 변환
    console.log('\n2. 데이터 변환 및 중복 제거...')
    const withdrawalMap = new Map()
    
    pointTransactions.forEach(item => {
      const paypalEmail = extractPayPalFromDescription(item.description)
      const amount = Math.abs(item.amount)
      const dateKey = item.created_at.split('T')[0] // 날짜만 추출
      const userKey = `${item.user_id}_${amount}_${dateKey}` // 사용자+금액+날짜로 중복 체크
      
      if (!withdrawalMap.has(userKey)) {
        // 첫 번째 레코드 (보통 pending)를 기준으로 생성
        withdrawalMap.set(userKey, {
          user_id: item.user_id,
          amount: amount,
          withdrawal_method: 'paypal',
          paypal_email: paypalEmail || 'unknown@example.com',
          paypal_name: paypalEmail || 'Unknown',
          reason: item.description || '포인트 출금 신청',
          status: 'pending', // 기본값
          created_at: item.created_at,
          updated_at: item.updated_at || item.created_at
        })
      } else {
        // 중복 레코드인 경우 상태 업데이트
        const existing = withdrawalMap.get(userKey)
        if (item.transaction_type === 'spent') {
          existing.status = 'completed'
          existing.updated_at = item.created_at
        }
      }
    })
    
    const withdrawalRequests = Array.from(withdrawalMap.values())
    console.log(`✅ ${withdrawalRequests.length}개의 고유한 출금 요청으로 변환`)
    
    // 3. withdrawal_requests 테이블에 삽입
    console.log('\n3. withdrawal_requests 테이블에 데이터 삽입...')
    
    for (const withdrawal of withdrawalRequests) {
      console.log(`삽입 중: 사용자 ${withdrawal.user_id}, 금액 ${withdrawal.amount}, 상태 ${withdrawal.status}`)
      
      const { error: insertError } = await supabase
        .from('withdrawal_requests')
        .insert([withdrawal])
      
      if (insertError) {
        console.log(`❌ 삽입 실패:`, insertError.message)
      } else {
        console.log(`✅ 삽입 성공`)
      }
    }
    
    console.log('\n=== 마이그레이션 완료 ===')
    
    // 4. 결과 확인
    const { data: finalCheck, error: checkError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (checkError) {
      console.log('❌ 결과 확인 오류:', checkError.message)
    } else {
      console.log(`✅ withdrawal_requests 테이블에 총 ${finalCheck?.length || 0}개 레코드 존재`)
    }
    
  } catch (error) {
    console.error('마이그레이션 오류:', error)
  }
}

migrateWithdrawalData()
