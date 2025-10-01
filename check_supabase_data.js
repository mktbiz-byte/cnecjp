const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '설정됨' : '없음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSNSUploads() {
  console.log('🔍 SNS 투고 신청 데이터 확인 중...\n')

  try {
    // 1. 최근 applications 테이블의 video_links 업데이트 확인
    console.log('📋 1. 최근 applications 테이블의 video_links 업데이트:')
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id, user_id, campaign_id, campaign_title, video_links, additional_info, status, created_at, updated_at')
      .not('video_links', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (appError) {
      console.error('Applications 조회 오류:', appError)
    } else {
      if (applications && applications.length > 0) {
        applications.forEach(app => {
          console.log(`  - ID: ${app.id}`)
          console.log(`    사용자: ${app.user_id}`)
          console.log(`    캠페인: ${app.campaign_title}`)
          console.log(`    비디오 링크: ${app.video_links}`)
          console.log(`    추가 정보: ${app.additional_info || '없음'}`)
          console.log(`    상태: ${app.status}`)
          console.log(`    업데이트: ${new Date(app.updated_at).toLocaleString('ko-KR')}`)
          console.log('    ---')
        })
      } else {
        console.log('  📭 video_links가 있는 applications가 없습니다.')
      }
    }

    console.log('\n📊 2. 최근 point_transactions에서 SNS 업로드 관련 기록:')
    const { data: transactions, error: transError } = await supabase
      .from('point_transactions')
      .select('id, user_id, campaign_id, application_id, transaction_type, amount, description, created_at')
      .or('description.ilike.%SNS%,description.ilike.%업로드%,description.ilike.%投稿%,transaction_type.eq.pending')
      .order('created_at', { ascending: false })
      .limit(10)

    if (transError) {
      console.error('Point transactions 조회 오류:', transError)
    } else {
      if (transactions && transactions.length > 0) {
        transactions.forEach(trans => {
          console.log(`  - ID: ${trans.id}`)
          console.log(`    사용자: ${trans.user_id}`)
          console.log(`    신청 ID: ${trans.application_id || '없음'}`)
          console.log(`    거래 유형: ${trans.transaction_type}`)
          console.log(`    금액: ${trans.amount}`)
          console.log(`    설명: ${trans.description}`)
          console.log(`    생성일: ${new Date(trans.created_at).toLocaleString('ko-KR')}`)
          console.log('    ---')
        })
      } else {
        console.log('  📭 SNS 관련 point_transactions가 없습니다.')
      }
    }

    console.log('\n📅 3. 오늘 날짜의 모든 업데이트:')
    const today = new Date().toISOString().split('T')[0]
    
    // 오늘 업데이트된 applications
    const { data: todayApps, error: todayAppError } = await supabase
      .from('applications')
      .select('id, user_id, campaign_title, video_links, additional_info, updated_at')
      .gte('updated_at', today)
      .not('video_links', 'is', null)
      .order('updated_at', { ascending: false })

    if (!todayAppError && todayApps && todayApps.length > 0) {
      console.log('  📋 오늘 업데이트된 applications:')
      todayApps.forEach(app => {
        console.log(`    - ${app.campaign_title} (${app.id})`)
        console.log(`      비디오: ${app.video_links}`)
        console.log(`      시간: ${new Date(app.updated_at).toLocaleString('ko-KR')}`)
      })
    }

    // 오늘 생성된 point_transactions
    const { data: todayTrans, error: todayTransError } = await supabase
      .from('point_transactions')
      .select('id, user_id, transaction_type, amount, description, created_at')
      .gte('created_at', today)
      .or('description.ilike.%SNS%,description.ilike.%업로드%,description.ilike.%投稿%')
      .order('created_at', { ascending: false })

    if (!todayTransError && todayTrans && todayTrans.length > 0) {
      console.log('  📊 오늘 생성된 SNS 관련 point_transactions:')
      todayTrans.forEach(trans => {
        console.log(`    - ${trans.description} (${trans.id})`)
        console.log(`      유형: ${trans.transaction_type}, 금액: ${trans.amount}`)
        console.log(`      시간: ${new Date(trans.created_at).toLocaleString('ko-KR')}`)
      })
    }

    if ((!todayApps || todayApps.length === 0) && (!todayTrans || todayTrans.length === 0)) {
      console.log('  📭 오늘 SNS 관련 활동이 없습니다.')
    }

    console.log('\n✅ 데이터 확인 완료!')

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류 발생:', error)
  }
}

// 스크립트 실행
checkSNSUploads()
