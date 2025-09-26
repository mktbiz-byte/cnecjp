import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = 'https://psfwmzlnaboattocyupu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg'

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
    
    // 2. 테스트 사용자 계정도 생성
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
    
    console.log('모든 계정 생성 완료!')
    console.log('관리자 로그인 정보:')
    console.log('이메일: admin@cnec.test')
    console.log('비밀번호: cnec2024!')
    
  } catch (error) {
    console.error('전체 오류:', error)
  }
}

// 실행
createAdminAccount()
