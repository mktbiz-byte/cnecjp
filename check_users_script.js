// 사용자 및 관리자 권한 확인 스크립트
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // 서비스 키 필요

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUsersAndAdmins() {
  console.log('=== 사용자 및 관리자 권한 확인 ===\n')

  try {
    // 1. user_profiles 테이블의 모든 사용자 확인
    console.log('1. user_profiles 테이블의 모든 사용자:')
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('user_profiles 조회 오류:', profilesError)
    } else {
      console.table(profiles.map(p => ({
        이름: p.name || '없음',
        이메일: p.email,
        관리자: p.is_admin ? '예' : '아니오',
        승인됨: p.is_approved ? '예' : '아니오',
        생성일: new Date(p.created_at).toLocaleString('ko-KR')
      })))
    }

    // 2. 관리자 권한을 가진 사용자들
    console.log('\n2. 관리자 권한을 가진 사용자들:')
    const { data: admins, error: adminsError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_admin', true)
      .order('created_at', { ascending: false })

    if (adminsError) {
      console.error('관리자 조회 오류:', adminsError)
    } else {
      if (admins.length === 0) {
        console.log('관리자 권한을 가진 사용자가 없습니다.')
      } else {
        console.table(admins.map(a => ({
          이름: a.name || '없음',
          이메일: a.email,
          승인됨: a.is_approved ? '예' : '아니오',
          생성일: new Date(a.created_at).toLocaleString('ko-KR')
        })))
      }
    }

    // 3. 승인된 사용자들
    console.log('\n3. 승인된 사용자들:')
    const { data: approved, error: approvedError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (approvedError) {
      console.error('승인된 사용자 조회 오류:', approvedError)
    } else {
      console.table(approved.map(a => ({
        이름: a.name || '없음',
        이메일: a.email,
        관리자: a.is_admin ? '예' : '아니오',
        생성일: new Date(a.created_at).toLocaleString('ko-KR')
      })))
    }

    // 4. 승인되지 않은 사용자들
    console.log('\n4. 승인되지 않은 사용자들:')
    const { data: notApproved, error: notApprovedError } = await supabase
      .from('user_profiles')
      .select('*')
      .or('is_approved.eq.false,is_approved.is.null')
      .order('created_at', { ascending: false })

    if (notApprovedError) {
      console.error('미승인 사용자 조회 오류:', notApprovedError)
    } else {
      if (notApproved.length === 0) {
        console.log('승인되지 않은 사용자가 없습니다.')
      } else {
        console.table(notApproved.map(n => ({
          이름: n.name || '없음',
          이메일: n.email,
          관리자: n.is_admin ? '예' : '아니오',
          생성일: new Date(n.created_at).toLocaleString('ko-KR')
        })))
      }
    }

    // 5. 통계 정보
    console.log('\n5. 사용자 통계:')
    const totalUsers = profiles?.length || 0
    const adminUsers = profiles?.filter(p => p.is_admin).length || 0
    const approvedUsers = profiles?.filter(p => p.is_approved).length || 0
    const notApprovedUsers = profiles?.filter(p => !p.is_approved).length || 0

    console.log(`총 사용자 수: ${totalUsers}`)
    console.log(`관리자 수: ${adminUsers}`)
    console.log(`승인된 사용자 수: ${approvedUsers}`)
    console.log(`미승인 사용자 수: ${notApprovedUsers}`)

  } catch (error) {
    console.error('사용자 확인 중 오류 발생:', error)
  }
}

// 스크립트 실행
checkUsersAndAdmins()
