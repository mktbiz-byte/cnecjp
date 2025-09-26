import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYxNTY3OCwiZXhwIjoyMDc0MTkxNjc4fQ.TKGhOOhZZZhKOJOLJJZhKOJOLJJZhKOJOLJJZhKOJOL' // 실제 service_role 키 필요

// Service Role 클라이언트 생성 (관리자 권한)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminAccount() {
  try {
    console.log('관리자 계정 생성 시작...')

    // 1. Auth에 사용자 생성
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@cnec.test',
      password: 'cnec2024!',
      email_confirm: true,
      user_metadata: {
        name: 'CNEC 관리자',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth 사용자 생성 오류:', authError)
      return
    }

    console.log('Auth 사용자 생성 성공:', authData.user.id)

    // 2. user_profiles 테이블에 프로필 생성
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([
        {
          user_id: authData.user.id,
          email: 'admin@cnec.test',
          name: 'CNEC 관리자',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

    if (profileError) {
      console.error('프로필 생성 오류:', profileError)
      return
    }

    console.log('프로필 생성 성공')

    // 3. 일반 사용자 계정도 생성
    const testUsers = [
      {
        email: 'test@cnec.test',
        password: 'test2024!',
        name: '테스트 사용자',
        role: 'user'
      },
      {
        email: 'creator@cnec.test',
        password: 'creator2024!',
        name: '테스트 크리에이터',
        role: 'user'
      }
    ]

    for (const testUser of testUsers) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          name: testUser.name,
          role: testUser.role
        }
      })

      if (userError) {
        console.error(`${testUser.email} 생성 오류:`, userError)
        continue
      }

      // 프로필 생성
      const { error: userProfileError } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            user_id: userData.user.id,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (userProfileError) {
        console.error(`${testUser.email} 프로필 생성 오류:`, userProfileError)
      } else {
        console.log(`${testUser.email} 계정 생성 성공`)
      }
    }

    console.log('모든 테스트 계정 생성 완료!')
    console.log('\n생성된 계정:')
    console.log('관리자: admin@cnec.test / cnec2024!')
    console.log('사용자: test@cnec.test / test2024!')
    console.log('크리에이터: creator@cnec.test / creator2024!')

  } catch (error) {
    console.error('계정 생성 중 오류:', error)
  }
}

// 스크립트 실행
createAdminAccount()
