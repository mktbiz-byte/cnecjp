import { useState, useEffect } from 'react'
import { database, supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  User, Shield, CheckCircle, AlertCircle, 
  Copy, Eye, EyeOff, RefreshCw, UserPlus
} from 'lucide-react'

const AdminTestSetup = () => {
  const [testAccounts, setTestAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const [newAccount, setNewAccount] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin'
  })

  // 기본 테스트 계정들
  const defaultTestAccounts = [
    {
      email: 'admin@cnec.test',
      password: 'cnec2024!',
      name: 'CNEC 관리자',
      role: 'admin'
    },
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

  useEffect(() => {
    loadTestAccounts()
  }, [])

  const loadTestAccounts = async () => {
    try {
      setLoading(true)
      
      // 테스트 계정들 확인
      const accounts = []
      for (const account of defaultTestAccounts) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', account.email)
            .single()
          
          if (profile) {
            accounts.push({
              ...account,
              exists: true,
              profile: profile
            })
          } else {
            accounts.push({
              ...account,
              exists: false
            })
          }
        } catch (error) {
          accounts.push({
            ...account,
            exists: false
          })
        }
      }
      
      setTestAccounts(accounts)
    } catch (error) {
      console.error('Load test accounts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestAccount = async (accountData) => {
    try {
      setCreating(true)
      
      // 1. Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: accountData.email,
        password: accountData.password,
        options: {
          data: {
            name: accountData.name,
            role: accountData.role
          }
        }
      })

      if (authError) {
        throw authError
      }

      // 2. 사용자 프로필 생성
      if (authData.user) {
        const profileData = {
          user_id: authData.user.id,
          email: accountData.email,
          name: accountData.name,
          role: accountData.role,
          created_at: new Date().toISOString()
        }

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // 3. 관리자인 경우 추가 권한 설정
        if (accountData.role === 'admin') {
          // 관리자 권한 관련 추가 설정이 필요하면 여기에 추가
        }
      }

      return { success: true, data: authData }
    } catch (error) {
      console.error('Create test account error:', error)
      return { success: false, error: error.message }
    } finally {
      setCreating(false)
    }
  }

  const createAllTestAccounts = async () => {
    try {
      setCreating(true)
      
      const results = []
      for (const account of defaultTestAccounts) {
        if (!testAccounts.find(t => t.email === account.email && t.exists)) {
          const result = await createTestAccount(account)
          results.push({ account, result })
        }
      }
      
      // 계정 목록 새로고침
      await loadTestAccounts()
      
      alert(`테스트 계정 생성 완료!\n성공: ${results.filter(r => r.result.success).length}개\n실패: ${results.filter(r => !r.result.success).length}개`)
      
    } catch (error) {
      console.error('Create all test accounts error:', error)
      alert('테스트 계정 생성 중 오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다!')
  }

  const togglePasswordVisibility = (email) => {
    setShowPasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }))
  }

  const getAdminUrls = () => {
    const baseUrl = 'https://cnec-cmp-9ur4ub.manus.space'
    return {
      dashboard: `${baseUrl}/admin`,
      campaigns: `${baseUrl}/admin/campaigns`,
      applications: `${baseUrl}/admin/applications`,
      withdrawals: `${baseUrl}/admin/withdrawals`,
      emails: `${baseUrl}/admin/emails`,
      companies: `${baseUrl}/admin/company-access`
    }
  }

  const adminUrls = getAdminUrls()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            CNEC 플랫폼 테스트 설정
          </h1>
          <p className="text-gray-600">
            테스트 계정 생성 및 관리자 페이지 접근 링크
          </p>
        </div>

        {/* 관리자 페이지 링크들 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span>관리자 페이지 링크</span>
            </CardTitle>
            <CardDescription>
              관리자 계정으로 로그인 후 아래 링크들을 사용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(adminUrls).map(([key, url]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{key}</div>
                    <div className="text-sm text-gray-600">{url}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      열기
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(url)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 테스트 계정 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>테스트 계정</span>
                </CardTitle>
                <CardDescription>
                  플랫폼 테스트를 위한 계정들
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={loadTestAccounts} variant="outline" disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
                <Button onClick={createAllTestAccounts} disabled={creating}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {creating ? '생성 중...' : '계정 생성'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testAccounts.map((account) => (
                <div key={account.email} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{account.name}</h4>
                      <Badge variant={account.role === 'admin' ? 'default' : 'secondary'}>
                        {account.role}
                      </Badge>
                      {account.exists ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          생성됨
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          미생성
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">이메일:</span>
                        <span>{account.email}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(account.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">비밀번호:</span>
                        <span className="font-mono">
                          {showPasswords[account.email] ? account.password : '••••••••'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePasswordVisibility(account.email)}
                        >
                          {showPasswords[account.email] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(account.password)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {!account.exists && (
                    <Button
                      onClick={() => createTestAccount(account)}
                      disabled={creating}
                      size="sm"
                    >
                      계정 생성
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 테스트 가이드 */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 가이드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>테스트 순서:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>위의 "계정 생성" 버튼을 클릭하여 테스트 계정들을 생성</li>
                    <li>관리자 계정(admin@cnec.test)으로 로그인</li>
                    <li>관리자 페이지 링크들을 통해 각 기능 테스트</li>
                    <li>일반 사용자 계정으로 캠페인 신청 및 워크플로우 테스트</li>
                    <li>이메일 발송 기능 테스트</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>주의사항:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>테스트 계정들은 실제 이메일 주소가 아니므로 이메일 수신은 불가능합니다</li>
                    <li>관리자 기능 테스트 시 실제 데이터에 영향을 주지 않도록 주의하세요</li>
                    <li>테스트 완료 후 불필요한 데이터는 정리해주세요</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminTestSetup
