import { useState, useEffect } from 'react'
import { database } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, Save, AlertCircle, CheckCircle, Mail, Send
} from 'lucide-react'
import { sendEmail } from '../../lib/emailHelper'

const EmailSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [emailSettings, setEmailSettings] = useState({
    email_user: '',
    email_from_name: 'CNEC',
    email_templates: {
      welcome: '',
      applicationConfirmation: '',
      applicationApproved: '',
      applicationRejected: ''
    }
  })
  
  const [testEmail, setTestEmail] = useState({
    to: '',
    subject: '테스트 이메일',
    text: '이것은 CNEC 시스템에서 보낸 테스트 이메일입니다.'
  })

  useEffect(() => {
    loadEmailSettings()
  }, [])

  const loadEmailSettings = async () => {
    try {
      setLoading(true)
      setError('')
      
      const settings = await database.system.getSettings()
      
      if (settings) {
        setEmailSettings({
          email_user: settings.email_user || '',
          email_from_name: settings.email_from_name || 'CNEC',
          email_templates: settings.email_templates || {
            welcome: '',
            applicationConfirmation: '',
            applicationApproved: '',
            applicationRejected: ''
          }
        })
      }
      
    } catch (error) {
      console.error('이메일 설정 로드 오류:', error)
      setError('이메일 설정을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      await database.system.updateSettings({
        email_user: emailSettings.email_user,
        email_from_name: emailSettings.email_from_name,
        email_templates: emailSettings.email_templates
      })
      
      setSuccess('이메일 설정이 성공적으로 저장되었습니다.')
      
    } catch (error) {
      console.error('이메일 설정 저장 오류:', error)
      setError('이메일 설정을 저장하는 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      setTesting(true)
      setError('')
      setSuccess('')
      
      if (!testEmail.to) {
        setError('테스트 이메일 주소를 입력해주세요.')
        return
      }
      
      await sendEmail({
        to: testEmail.to,
        subject: testEmail.subject,
        text: testEmail.text
      })
      
      setSuccess(`테스트 이메일이 ${testEmail.to}로 성공적으로 전송되었습니다.`)
      
    } catch (error) {
      console.error('테스트 이메일 전송 오류:', error)
      setError(`테스트 이메일 전송 실패: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">이메일 설정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Mail className="h-6 w-6 mr-2" />
            이메일 설정
          </CardTitle>
          <CardDescription>
            시스템 이메일 설정 및 테스트
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings">기본 설정</TabsTrigger>
              <TabsTrigger value="templates">이메일 템플릿</TabsTrigger>
              <TabsTrigger value="test">테스트 이메일</TabsTrigger>
            </TabsList>
            
            {/* 기본 설정 탭 */}
            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email_user">이메일 주소</Label>
                  <Input
                    id="email_user"
                    value={emailSettings.email_user}
                    onChange={(e) => setEmailSettings({...emailSettings, email_user: e.target.value})}
                    placeholder="example@gmail.com"
                  />
                  <p className="text-sm text-gray-500">
                    이메일 전송에 사용될 Gmail 주소입니다.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email_from_name">발신자 이름</Label>
                  <Input
                    id="email_from_name"
                    value={emailSettings.email_from_name}
                    onChange={(e) => setEmailSettings({...emailSettings, email_from_name: e.target.value})}
                    placeholder="CNEC"
                  />
                  <p className="text-sm text-gray-500">
                    이메일 발신자로 표시될 이름입니다.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Gmail을 사용하는 경우, 앱 비밀번호를 생성하여 Netlify 환경 변수에 설정해야 합니다.
                      <br />
                      환경 변수: EMAIL_USER, EMAIL_PASS
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </TabsContent>
            
            {/* 이메일 템플릿 탭 */}
            <TabsContent value="templates" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome_template">환영 이메일 템플릿</Label>
                  <Textarea
                    id="welcome_template"
                    value={emailSettings.email_templates.welcome}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings, 
                      email_templates: {
                        ...emailSettings.email_templates,
                        welcome: e.target.value
                      }
                    })}
                    placeholder="환영 이메일 HTML 템플릿"
                    rows={10}
                  />
                  <p className="text-sm text-gray-500">
                    사용 가능한 변수: {{name}}, {{loginUrl}}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="application_confirmation_template">신청 접수 확인 이메일 템플릿</Label>
                  <Textarea
                    id="application_confirmation_template"
                    value={emailSettings.email_templates.applicationConfirmation}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings, 
                      email_templates: {
                        ...emailSettings.email_templates,
                        applicationConfirmation: e.target.value
                      }
                    })}
                    placeholder="신청 접수 확인 이메일 HTML 템플릿"
                    rows={10}
                  />
                  <p className="text-sm text-gray-500">
                    사용 가능한 변수: {{name}}, {{campaignTitle}}, {{applicationDate}}, {{mypageUrl}}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="application_approved_template">신청 승인 이메일 템플릿</Label>
                  <Textarea
                    id="application_approved_template"
                    value={emailSettings.email_templates.applicationApproved}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings, 
                      email_templates: {
                        ...emailSettings.email_templates,
                        applicationApproved: e.target.value
                      }
                    })}
                    placeholder="신청 승인 이메일 HTML 템플릿"
                    rows={10}
                  />
                  <p className="text-sm text-gray-500">
                    사용 가능한 변수: {{name}}, {{campaignTitle}}, {{approvalDate}}, {{mypageUrl}}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="application_rejected_template">신청 거절 이메일 템플릿</Label>
                  <Textarea
                    id="application_rejected_template"
                    value={emailSettings.email_templates.applicationRejected}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings, 
                      email_templates: {
                        ...emailSettings.email_templates,
                        applicationRejected: e.target.value
                      }
                    })}
                    placeholder="신청 거절 이메일 HTML 템플릿"
                    rows={10}
                  />
                  <p className="text-sm text-gray-500">
                    사용 가능한 변수: {{name}}, {{campaignTitle}}, {{rejectionDate}}, {{rejectionReason}}, {{campaignsUrl}}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* 테스트 이메일 탭 */}
            <TabsContent value="test" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test_email">테스트 이메일 주소</Label>
                  <Input
                    id="test_email"
                    value={testEmail.to}
                    onChange={(e) => setTestEmail({...testEmail, to: e.target.value})}
                    placeholder="test@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test_subject">테스트 이메일 제목</Label>
                  <Input
                    id="test_subject"
                    value={testEmail.subject}
                    onChange={(e) => setTestEmail({...testEmail, subject: e.target.value})}
                    placeholder="테스트 이메일"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test_content">테스트 이메일 내용</Label>
                  <Textarea
                    id="test_content"
                    value={testEmail.text}
                    onChange={(e) => setTestEmail({...testEmail, text: e.target.value})}
                    placeholder="테스트 이메일 내용"
                    rows={5}
                  />
                </div>
                
                <Button 
                  onClick={handleTestEmail}
                  disabled={testing || !testEmail.to}
                >
                  {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Send className="h-4 w-4 mr-2" />
                  테스트 이메일 전송
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 성공/오류 메시지 */}
          {success && (
            <Alert className="mt-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* 저장 버튼 */}
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              설정 저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailSettings
