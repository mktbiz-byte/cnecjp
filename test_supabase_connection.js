// Supabase 연결 및 SNS 업로드 데이터 확인 스크립트
import { createClient } from '@supabase/supabase-js'

// 환경변수 대신 직접 설정 (테스트용)
const supabaseUrl = 'https://kcjhxqwqhxjxvqwqhxjx.supabase.co' // 실제 URL로 교체 필요
const supabaseKey = 'your-anon-key' // 실제 키로 교체 필요

// 실제 환경변수가 있다면 사용
const actualUrl = process.env.VITE_SUPABASE_URL
const actualKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase 연결 정보 확인:')
console.log('URL 환경변수:', actualUrl ? '설정됨' : '없음')
console.log('KEY 환경변수:', actualKey ? '설정됨' : '없음')

if (!actualUrl || !actualKey) {
  console.log('❌ 환경변수가 설정되지 않았습니다.')
  console.log('📝 .env 파일을 생성하거나 환경변수를 설정해주세요.')
  process.exit(1)
}

const supabase = createClient(actualUrl, actualKey)

async function checkRecentData() {
  console.log('\n🔍 최근 SNS 업로드 데이터 확인 중...\n')

  try {
    // 1. 최근 applications 테이블 확인
    console.log('📋 1. 최근 applications 업데이트:')
    const { data: apps, error: appError } = await supabase
      .from('applications')
      .select('id, user_id, campaign_title, video_links, additional_info, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (appError) {
      console.error('❌ Applications 조회 오류:', appError.message)
    } else {
      if (apps && apps.length > 0) {
        apps.forEach((app, index) => {
          console.log(`  ${index + 1}. ID: ${app.id}`)
          console.log(`     캠페인: ${app.campaign_title}`)
          console.log(`     비디오 링크: ${app.video_links || '없음'}`)
          console.log(`     추가 정보: ${app.additional_info || '없음'}`)
          console.log(`     상태: ${app.status}`)
          console.log(`     업데이트: ${new Date(app.updated_at).toLocaleString('ko-KR')}`)
          console.log('     ---')
        })
      } else {
        console.log('  📭 applications 데이터가 없습니다.')
      }
    }

    // 2. 최근 point_transactions 확인
    console.log('\n📊 2. 최근 point_transactions:')
    const { data: transactions, error: transError } = await supabase
      .from('point_transactions')
      .select('id, user_id, transaction_type, amount, description, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (transError) {
      console.error('❌ Point transactions 조회 오류:', transError.message)
    } else {
      if (transactions && transactions.length > 0) {
        transactions.forEach((trans, index) => {
          console.log(`  ${index + 1}. ID: ${trans.id}`)
          console.log(`     유형: ${trans.transaction_type}`)
          console.log(`     금액: ${trans.amount}`)
          console.log(`     설명: ${trans.description}`)
          console.log(`     생성일: ${new Date(trans.created_at).toLocaleString('ko-KR')}`)
          console.log('     ---')
        })
      } else {
        console.log('  📭 point_transactions 데이터가 없습니다.')
      }
    }

    // 3. 오늘 날짜 데이터 확인
    console.log('\n📅 3. 오늘 업데이트된 데이터:')
    const today = new Date().toISOString().split('T')[0]
    
    const { data: todayApps, error: todayError } = await supabase
      .from('applications')
      .select('id, campaign_title, video_links, updated_at')
      .gte('updated_at', today)
      .order('updated_at', { ascending: false })

    if (!todayError && todayApps && todayApps.length > 0) {
      console.log('  📋 오늘 업데이트된 applications:')
      todayApps.forEach(app => {
        console.log(`    - ${app.campaign_title} (ID: ${app.id})`)
        console.log(`      비디오: ${app.video_links || '없음'}`)
        console.log(`      시간: ${new Date(app.updated_at).toLocaleString('ko-KR')}`)
      })
    } else {
      console.log('  📭 오늘 업데이트된 applications가 없습니다.')
    }

    console.log('\n✅ 데이터 확인 완료!')

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
  }
}

// 스크립트 실행
checkRecentData()
