const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPointTransactionsSchema() {
  try {
    console.log('point_transactions 테이블 스키마 확인 중...')
    
    // 테이블의 첫 번째 레코드를 가져와서 컬럼 구조 확인
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('테이블 조회 오류:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('point_transactions 테이블 컬럼들:')
      console.log(Object.keys(data[0]))
      console.log('\n첫 번째 레코드 예시:')
      console.log(data[0])
    } else {
      console.log('point_transactions 테이블이 비어있습니다.')
    }
    
  } catch (error) {
    console.error('스키마 확인 오류:', error)
  }
}

checkPointTransactionsSchema()
