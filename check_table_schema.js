import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableSchema() {
  console.log('=== withdrawal_requests 테이블 스키마 확인 ===\n')
  
  try {
    // 빈 레코드로 테스트 삽입하여 스키마 확인
    const { error } = await supabase
      .from('withdrawal_requests')
      .insert([{}])
    
    if (error) {
      console.log('테이블 스키마 정보 (오류 메시지에서 추출):')
      console.log(error.message)
      
      // 필수 컬럼 추출 시도
      if (error.message.includes('null value in column')) {
        const match = error.message.match(/null value in column "([^"]+)"/g)
        if (match) {
          console.log('\n필수 컬럼들:')
          match.forEach(m => {
            const column = m.match(/"([^"]+)"/)[1]
            console.log(`- ${column}`)
          })
        }
      }
    }
    
    // 간단한 테스트 데이터로 스키마 파악
    console.log('\n=== 테스트 삽입으로 스키마 파악 ===')
    const testData = {
      user_id: 'test-user-id',
      amount: 1000,
      status: 'pending'
    }
    
    const { error: testError } = await supabase
      .from('withdrawal_requests')
      .insert([testData])
    
    if (testError) {
      console.log('테스트 삽입 오류:', testError.message)
    } else {
      console.log('✅ 기본 스키마로 삽입 성공')
      
      // 삽입된 테스트 데이터 삭제
      await supabase
        .from('withdrawal_requests')
        .delete()
        .eq('user_id', 'test-user-id')
    }
    
  } catch (error) {
    console.error('스키마 확인 오류:', error)
  }
}

checkTableSchema()
