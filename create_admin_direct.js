const { createClient } = require('@supabase/supabase-js')

// Supabase 설정
const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyNzE4NzIsImV4cCI6MjA0Mjg0Nzg3Mn0.Ow_Qs8qjNOdJfJNLJQQKJGJJGJJGJJGJJGJJGJJGJJG'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminAccount() {
  try {
    console.log('관리자 계정 생성 시작...')
    
    // 1. 관리자 계정 생성 (Supabase Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@cnec.test',
      password: 'cnec2024!',
      options: {
        data: {
          name: 'CNEC Admin',
          role: 'admin'
        }
      }
    })
    
    if (authError) {
      console.error('Auth 계정 생성 오류:', authError)
    } else {
      console.log('Auth 계정 생성 성공:', authData.user?.email)
    }
    
    // 2. 사용자 프로필 생성
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: authData.user?.id,
          email: 'admin@cnec.test',
          name: 'CNEC Admin',
          role: 'admin',
          is_admin: true,
          created_at: new Date().toISOString()
        }
      ])
    
    if (profileError) {
      console.error('프로필 생성 오류:', profileError)
    } else {
      console.log('프로필 생성 성공')
    }
    
    // 3. 테스트 사용자 계정도 생성
    const { data: userAuthData, error: userAuthError } = await supabase.auth.signUp({
      email: 'test@cnec.test',
      password: 'test2024!',
      options: {
        data: {
          name: 'Test User',
          role: 'user'
        }
      }
    })
    
    if (userAuthError) {
      console.error('사용자 계정 생성 오류:', userAuthError)
    } else {
      console.log('사용자 계정 생성 성공:', userAuthData.user?.email)
    }
    
    // 4. 사용자 프로필 생성
    const { data: userProfileData, error: userProfileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userAuthData.user?.id,
          email: 'test@cnec.test',
          name: 'Test User',
          role: 'user',
          is_admin: false,
          created_at: new Date().toISOString()
        }
      ])
    
    if (userProfileError) {
      console.error('사용자 프로필 생성 오류:', userProfileError)
    } else {
      console.log('사용자 프로필 생성 성공')
    }
    
    console.log('모든 계정 생성 완료!')
    
  } catch (error) {
    console.error('전체 오류:', error)
  }
}

// 실행
createAdminAccount()
