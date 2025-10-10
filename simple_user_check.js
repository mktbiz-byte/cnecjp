// 간단한 사용자 확인 스크립트
const { createClient } = require('@supabase/supabase-js')

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = 'https://ybpjnpzwzqkqzjqzqzqz.supabase.co' // 실제 URL로 교체 필요
const supabaseAnonKey = 'your-anon-key' // 실제 키로 교체 필요

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsers() {
  try {
    console.log('=== CNEC.jp 사용자 및 관리자 확인 ===\n')

    // user_profiles 테이블에서 모든 사용자 정보 가져오기
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('사용자 데이터 조회 오류:', error)
      return
    }

    if (!users || users.length === 0) {
      console.log('등록된 사용자가 없습니다.')
      return
    }

    console.log(`총 ${users.length}명의 사용자가 등록되어 있습니다.\n`)

    // 관리자 사용자들
    const admins = users.filter(user => user.is_admin === true)
    console.log('🔑 관리자 권한을 가진 사용자들:')
    if (admins.length === 0) {
      console.log('   관리자가 없습니다.')
    } else {
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name || '이름없음'} (${admin.email})`)
        console.log(`      - 승인 상태: ${admin.is_approved ? '승인됨' : '미승인'}`)
        console.log(`      - 가입일: ${new Date(admin.created_at).toLocaleDateString('ko-KR')}`)
      })
    }

    // 승인된 일반 사용자들
    const approvedUsers = users.filter(user => user.is_approved === true && user.is_admin !== true)
    console.log('\n✅ 승인된 일반 사용자들:')
    if (approvedUsers.length === 0) {
      console.log('   승인된 일반 사용자가 없습니다.')
    } else {
      approvedUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || '이름없음'} (${user.email})`)
        console.log(`      - 가입일: ${new Date(user.created_at).toLocaleDateString('ko-KR')}`)
      })
    }

    // 미승인 사용자들
    const pendingUsers = users.filter(user => user.is_approved !== true)
    console.log('\n⏳ 승인 대기 중인 사용자들:')
    if (pendingUsers.length === 0) {
      console.log('   승인 대기 중인 사용자가 없습니다.')
    } else {
      pendingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || '이름없음'} (${user.email})`)
        console.log(`      - 관리자 여부: ${user.is_admin ? '예' : '아니오'}`)
        console.log(`      - 가입일: ${new Date(user.created_at).toLocaleDateString('ko-KR')}`)
      })
    }

    // 통계
    console.log('\n📊 통계:')
    console.log(`   총 사용자: ${users.length}명`)
    console.log(`   관리자: ${admins.length}명`)
    console.log(`   승인된 사용자: ${users.filter(u => u.is_approved === true).length}명`)
    console.log(`   미승인 사용자: ${users.filter(u => u.is_approved !== true).length}명`)

  } catch (error) {
    console.error('사용자 확인 중 오류:', error)
  }
}

// 실행
checkUsers()
