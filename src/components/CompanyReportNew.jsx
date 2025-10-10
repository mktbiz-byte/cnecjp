import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { database, supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, Download, Eye, BarChart3, PieChart, TrendingUp, 
  Users, Target, Calendar, DollarSign, FileText, 
  ExternalLink, Share2, Instagram, Youtube, Hash,
  CheckCircle, Clock, AlertCircle, Building, UserCheck, UserX
} from 'lucide-react'

// 다국어 지원
const translations = {
  ko: {
    title: '기업 보고서',
    subtitle: '캠페인 성과와 분석 데이터를 확인할 수 있습니다',
    applicantList: '신청자 목록',
    name: '이름',
    snsAddress: 'SNS 주소',
    skinType: '피부 타입',
    questions: '질문과 답변',
    virtualSelect: '가상 선택',
    cancel: '취소',
    selected: '선택됨',
    adminApprovalRequired: '빨간색 선택 버튼을 눌러도 관리자가 최종 승인 후 확정됩니다',
    loading: '데이터를 불러오는 중...',
    error: '오류가 발생했습니다',
    noApplications: '신청자가 없습니다',
    instagram: '인스타그램',
    tiktok: '틱톡',
    youtube: '유튜브',
    twitter: '트위터',
    pending: '대기중',
    approved: '승인됨',
    rejected: '거부됨',
    completed: '완료됨',
    virtualSelected: '가상 선택됨'
  },
  ja: {
    title: '企業レポート',
    subtitle: 'キャンペーンの成果と分析データを確認できます',
    applicantList: '申請者リスト',
    name: '名前',
    snsAddress: 'SNSアドレス',
    skinType: '肌タイプ',
    questions: '質問と回答',
    virtualSelect: '仮想選択',
    cancel: 'キャンセル',
    selected: '選択済み',
    adminApprovalRequired: '赤い選択ボタンを押しても管理者が最終承認後に確定されます',
    loading: 'データを読み込み中...',
    error: 'エラーが発生しました',
    noApplications: '申請者がいません',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter',
    pending: '待機中',
    approved: '承認済み',
    rejected: '拒否済み',
    completed: '完了済み',
    virtualSelected: '仮想選択済み'
  },
  en: {
    title: 'Company Report',
    subtitle: 'View campaign performance and analytics data',
    applicantList: 'Applicant List',
    name: 'Name',
    snsAddress: 'SNS Address',
    skinType: 'Skin Type',
    questions: 'Questions & Answers',
    virtualSelect: 'Virtual Select',
    cancel: 'Cancel',
    selected: 'Selected',
    adminApprovalRequired: 'Even if you press the red select button, it will be confirmed after final approval by the administrator',
    loading: 'Loading data...',
    error: 'An error occurred',
    noApplications: 'No applicants',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    virtualSelected: 'Virtual Selected'
  }
}

const CompanyReportNew = () => {
  const { campaignId } = useParams()
  const [searchParams] = useSearchParams()
  const accessToken = searchParams.get('token')
  
  const [campaign, setCampaign] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('ko') // 기본 한국어
  const [processing, setProcessing] = useState(false)

  const t = translations[language]

  useEffect(() => {
    if (campaignId) {
      loadCampaignData()
    } else {
      setError('캠페인 ID가 유효하지 않습니다.')
      setLoading(false)
    }
  }, [campaignId])

  const loadCampaignData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('캠페인 데이터 로딩 시작:', campaignId)
      
      // 캠페인 정보 로드
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()
      
      if (campaignError) {
        throw new Error(`캠페인 정보 조회 실패: ${campaignError.message}`)
      }
      
      setCampaign(campaignData)
      console.log('캠페인 데이터:', campaignData)
      
      // 신청서 데이터 로드 (실제 데이터베이스 구조에 맞게)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
      
      if (applicationsError) {
        console.error('신청서 데이터 조회 오류:', applicationsError)
        setApplications([])
      } else {
        setApplications(applicationsData || [])
        console.log('신청서 데이터:', applicationsData?.length || 0, '건')
      }
      
    } catch (error) {
      console.error('데이터 로딩 오류:', error)
      setError(error.message || '데이터 로딩에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVirtualSelect = async (applicationId, isSelected) => {
    try {
      setProcessing(true)
      
      const newStatus = isSelected ? 'pending' : 'virtual_selected'
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          virtual_selected_at: isSelected ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
      
      if (error) {
        throw new Error(`상태 업데이트 실패: ${error.message}`)
      }
      
      // 로컬 상태 업데이트
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, virtual_selected_at: isSelected ? null : new Date().toISOString() }
          : app
      ))
      
    } catch (error) {
      console.error('가상 선택 처리 오류:', error)
      setError(error.message || '가상 선택 처리에 실패했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t.pending },
      virtual_selected: { bg: 'bg-red-100', text: 'text-red-800', label: t.virtualSelected },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: t.approved },
      rejected: { bg: 'bg-gray-100', text: 'text-gray-800', label: t.rejected },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: t.completed }
    }
    
    const style = statusStyles[status] || statusStyles.pending
    
    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    )
  }

  const getSkinTypeLabel = (skinType) => {
    const skinTypes = {
      oily: '지성',
      dry: '건성', 
      combination: '복합성',
      sensitive: '민감성',
      normal: '보통'
    }
    return skinTypes[skinType] || skinType
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t.error}
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                재시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Building className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {t.title}
              </h1>
              <p className="text-gray-600">
                {campaign?.title || '캠페인'} - {t.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 캠페인 정보 */}
        {campaign && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>{campaign.title}</span>
              </CardTitle>
              <CardDescription>
                브랜드: {campaign.brand} | 마감일: {new Date(campaign.deadline).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* 관리자 승인 안내 */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {t.adminApprovalRequired}
          </AlertDescription>
        </Alert>

        {/* 신청자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>{t.applicantList}</span>
              <Badge variant="secondary">{applications.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t.noApplications}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-6 bg-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {application.applicant_name || '이름 없음'}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        
                        {/* SNS 주소 */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">{t.snsAddress}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {application.instagram_url && (
                              <a 
                                href={application.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-pink-600 hover:text-pink-800"
                              >
                                <Instagram className="h-4 w-4" />
                                <span className="text-sm">Instagram</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {application.tiktok_url && (
                              <a 
                                href={application.tiktok_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-black hover:text-gray-700"
                              >
                                <Hash className="h-4 w-4" />
                                <span className="text-sm">TikTok</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {application.youtube_url && (
                              <a 
                                href={application.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                              >
                                <Youtube className="h-4 w-4" />
                                <span className="text-sm">YouTube</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* 피부 타입 */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">{t.skinType}</h4>
                          <Badge variant="outline">
                            {application.skin_type || '정보 없음'}
                          </Badge>
                        </div>

                        {/* 나이 정보 */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">나이</h4>
                          <Badge variant="outline">
                            {application.age || '정보 없음'}
                          </Badge>
                        </div>

                        {/* 질문과 답변 */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">{t.questions}</h4>
                          <div className="space-y-3">
                            {/* 동적으로 모든 질문과 답변 표시 */}
                            {(() => {
                              const questionsAndAnswers = []
                              
                              // 최대 10개의 질문까지 확인 (확장 가능)
                              for (let i = 1; i <= 10; i++) {
                                // 다양한 질문 컬럼명 패턴 확인
                                const questionSources = [
                                  campaign?.[`question_${i}`],
                                  campaign?.[`question${i}`],
                                  application[`question_${i}`],
                                  application[`question${i}`]
                                ]
                                
                                // 다양한 답변 컬럼명 패턴 확인
                                const answerSources = [
                                  application[`answer_${i}`],
                                  application[`answer${i}`],
                                  application[`question${i}_answer`],
                                  application[`question_${i}_answer`]
                                ]
                                
                                // 질문과 답변 찾기
                                const question = questionSources.find(q => q && q.trim())
                                const answer = answerSources.find(a => a && a.trim())
                                
                                // 질문이나 답변이 있으면 표시
                                if (question || answer) {
                                  questionsAndAnswers.push(
                                    <div key={i} className="bg-gray-50 p-3 rounded">
                                      <p className="text-sm font-medium text-gray-600 mb-1">
                                        {question || `질문 ${i}`}
                                      </p>
                                      <p className="text-sm text-gray-800">
                                        {answer || '답변 없음'}
                                      </p>
                                    </div>
                                  )
                                }
                              }
                              
                              // 질문과 답변이 없으면 메시지 표시
                              if (questionsAndAnswers.length === 0) {
                                questionsAndAnswers.push(
                                  <div key="no-qa" className="bg-gray-50 p-3 rounded text-center">
                                    <p className="text-sm text-gray-500">질문과 답변이 없습니다.</p>
                                  </div>
                                )
                              }
                              
                              return questionsAndAnswers
                            })()}
                            
                            {/* 디버깅용 - 개발 환경에서만 표시 */}
                            {process.env.NODE_ENV === 'development' && (
                              <div className="bg-yellow-50 p-3 rounded text-xs">
                                <p><strong>디버깅 정보:</strong></p>
                                <p><strong>캠페인 질문:</strong></p>
                                {[1,2,3,4,5].map(i => (
                                  <p key={`q${i}`}>question_{i}: {campaign?.[`question_${i}`] || 'null'}</p>
                                ))}
                                <p><strong>신청서 답변:</strong></p>
                                {[1,2,3,4,5].map(i => (
                                  <p key={`a${i}`}>answer_{i}: {application[`answer_${i}`] || 'null'}</p>
                                ))}
                                <p><strong>모든 application 키:</strong></p>
                                <p className="text-xs break-all">{Object.keys(application).join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 가상 선택 버튼 */}
                      <div className="ml-4">
                        {application.status === 'virtual_selected' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVirtualSelect(application.id, true)}
                            disabled={processing}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            {t.cancel}
                          </Button>
                        ) : application.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleVirtualSelect(application.id, false)}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            {t.virtualSelect}
                          </Button>
                        ) : (
                          <Badge variant="secondary">
                            {t.selected}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 신청 일시 */}
                    <div className="text-xs text-gray-500 border-t pt-2">
                      신청일: {new Date(application.created_at).toLocaleString()}
                      {application.virtual_selected_at && (
                        <span className="ml-4">
                          가상선택일: {new Date(application.virtual_selected_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CompanyReportNew
