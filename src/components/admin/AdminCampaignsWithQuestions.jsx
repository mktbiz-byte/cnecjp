import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { database, supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Loader2, Plus, Edit, Trash2, Eye, Download, Upload, 
  AlertCircle, CheckCircle, Clock, DollarSign, FileText, 
  ArrowRight, Copy, ExternalLink, Search, Filter, RefreshCw,
  Calendar, Users, Target, X, Save, Building, Link as LinkIcon,
  HelpCircle, Minus
} from 'lucide-react'

const AdminCampaignsWithQuestions = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  
  const [campaigns, setCampaigns] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [applicationsModal, setApplicationsModal] = useState(false)
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  })
  
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    brand: '',
    description: '',
    requirements: '',
    reward_amount: '',
    max_participants: '',
    start_date: '',
    end_date: '',
    application_deadline: '',
    status: 'draft',
    category: '',
    target_audience: '',
    campaign_materials: '',
    special_instructions: '',
    questions: [
      { text: '', required: false },
      { text: '', required: false },
      { text: '', required: false },
      { text: '', required: false }
    ]
  })

  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('관리자 캠페인 데이터 로딩 시작...')
      
      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      console.log('현재 사용자:', user?.email)
      
      // 캠페인 로드
      console.log('캠페인 데이터 로딩 중...')
      const campaignsData = await database.campaigns.getAll()
      console.log('로드된 캠페인:', campaignsData?.length || 0, '개')
      setCampaigns(campaignsData || [])
      
      // 신청 내역 로드
      console.log('신청서 데이터 로딩 중...')
      const applicationsData = await database.applications.getAll()
      console.log('로드된 신청서:', applicationsData?.length || 0, '개')
      setApplications(applicationsData || [])
      
      console.log('데이터 로딩 완료')
      
    } catch (error) {
      console.error('Load data error:', error)
      console.error('Error details:', error.message)
      console.error('Error code:', error.code)
      
      setError(`${language === 'ko' 
        ? '데이터를 불러올 수 없습니다'
        : 'データを読み込めません'}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCampaignForm({
      title: '',
      brand: '',
      description: '',
      requirements: '',
      reward_amount: '',
      max_participants: '',
      start_date: '',
      end_date: '',
      application_deadline: '',
      status: 'draft',
      category: '',
      target_audience: '',
      campaign_materials: '',
      special_instructions: '',
      questions: [
        { text: '', required: false },
        { text: '', required: false },
        { text: '', required: false },
        { text: '', required: false }
      ]
    })
  }

  const handleQuestionChange = (index, field, value) => {
    setCampaignForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const handleCreateCampaign = async () => {
    try {
      setProcessing(true)
      setError('')
      
      // 빈 질문 제거
      const filteredQuestions = campaignForm.questions.filter(q => q.text.trim() !== '')
      
      const campaignData = {
        ...campaignForm,
        questions: filteredQuestions,
        reward_amount: parseInt(campaignForm.reward_amount) || 0,
        max_participants: parseInt(campaignForm.max_participants) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await database.campaigns.create(campaignData)
      
      setSuccess(language === 'ko' 
        ? '캠페인이 성공적으로 생성되었습니다.'
        : 'キャンペーンが正常に作成されました。'
      )
      
      setCreateModal(false)
      resetForm()
      loadData()
      
    } catch (error) {
      console.error('Create campaign error:', error)
      setError(language === 'ko' 
        ? '캠페인 생성에 실패했습니다.'
        : 'キャンペーンの作成に失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateCampaign = async () => {
    try {
      setProcessing(true)
      setError('')
      
      // 빈 질문 제거
      const filteredQuestions = campaignForm.questions.filter(q => q.text.trim() !== '')
      
      const campaignData = {
        ...campaignForm,
        questions: filteredQuestions,
        reward_amount: parseInt(campaignForm.reward_amount) || 0,
        max_participants: parseInt(campaignForm.max_participants) || 0,
        updated_at: new Date().toISOString()
      }
      
      await database.campaigns.update(selectedCampaign.id, campaignData)
      
      setSuccess(language === 'ko' 
        ? '캠페인이 성공적으로 업데이트되었습니다.'
        : 'キャンペーンが正常に更新されました。'
      )
      
      setEditModal(false)
      resetForm()
      loadData()
      
    } catch (error) {
      console.error('Update campaign error:', error)
      setError(language === 'ko' 
        ? '캠페인 업데이트에 실패했습니다.'
        : 'キャンペーンの更新に失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelCampaign = async () => {
    try {
      setProcessing(true)
      setError('')
      
      await database.campaigns.update(selectedCampaign.id, {
        status: 'cancelled',
        cancel_reason: cancelReason,
        cancelled_at: new Date().toISOString()
      })
      
      setSuccess(language === 'ko' 
        ? '캠페인이 취소되었습니다.'
        : 'キャンペーンがキャンセルされました。'
      )
      
      setCancelModal(false)
      setCancelReason('')
      loadData()
      
    } catch (error) {
      console.error('Cancel campaign error:', error)
      setError(language === 'ko' 
        ? '캠페인 취소에 실패했습니다.'
        : 'キャンペーンのキャンセルに失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign)
    setCampaignForm({
      title: campaign.title || '',
      brand: campaign.brand || '',
      description: campaign.description || '',
      requirements: campaign.requirements || '',
      reward_amount: campaign.reward_amount?.toString() || '',
      max_participants: campaign.max_participants?.toString() || '',
      start_date: campaign.start_date?.split('T')[0] || '',
      end_date: campaign.end_date?.split('T')[0] || '',
      application_deadline: campaign.application_deadline?.split('T')[0] || '',
      status: campaign.status || 'draft',
      category: campaign.category || '',
      target_audience: campaign.target_audience || '',
      campaign_materials: campaign.campaign_materials || '',
      special_instructions: campaign.special_instructions || '',
      questions: campaign.questions && campaign.questions.length > 0 
        ? [
            ...campaign.questions,
            ...Array(4 - campaign.questions.length).fill({ text: '', required: false })
          ].slice(0, 4)
        : [
            { text: '', required: false },
            { text: '', required: false },
            { text: '', required: false },
            { text: '', required: false }
          ]
    })
    setEditModal(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', text: language === 'ko' ? '초안' : '下書き' },
      active: { color: 'bg-green-100 text-green-800', text: language === 'ko' ? '활성' : 'アクティブ' },
      paused: { color: 'bg-yellow-100 text-yellow-800', text: language === 'ko' ? '일시정지' : '一時停止' },
      completed: { color: 'bg-blue-100 text-blue-800', text: language === 'ko' ? '완료' : '完了' },
      cancelled: { color: 'bg-red-100 text-red-800', text: language === 'ko' ? '취소' : 'キャンセル' }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0)
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filters.status !== 'all' && campaign.status !== filters.status) return false
    if (filters.search && !campaign.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !campaign.brand.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'ko' ? '캠페인을 불러오는 중...' : 'キャンペーンを読み込み中...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {language === 'ko' ? '캠페인 관리' : 'キャンペーン管理'}
          </h2>
          <p className="text-gray-600">
            {language === 'ko' 
              ? '캠페인을 생성하고 관리하세요'
              : 'キャンペーンを作成・管理してください'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'ko' ? '새로고침' : '更新'}
          </Button>
          <Dialog open={createModal} onOpenChange={setCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ko' ? '새 캠페인' : '新規キャンペーン'}
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ko' ? '상태' : '状態'}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ko' ? '전체' : '全て'}</SelectItem>
                  <SelectItem value="draft">{language === 'ko' ? '초안' : '下書き'}</SelectItem>
                  <SelectItem value="active">{language === 'ko' ? '활성' : 'アクティブ'}</SelectItem>
                  <SelectItem value="paused">{language === 'ko' ? '일시정지' : '一時停止'}</SelectItem>
                  <SelectItem value="completed">{language === 'ko' ? '완료' : '完了'}</SelectItem>
                  <SelectItem value="cancelled">{language === 'ko' ? '취소' : 'キャンセル'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ko' ? '검색' : '検索'}</Label>
              <Input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder={language === 'ko' ? '캠페인명 또는 브랜드명' : 'キャンペーン名またはブランド名'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Campaigns List */}
      <div className="grid gap-6">
        {filteredCampaigns.map((campaign) => {
          const campaignApplications = applications.filter(app => app.campaign_id === campaign.id)
          
          return (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{campaign.title}</span>
                      {getStatusBadge(campaign.status)}
                    </CardTitle>
                    <CardDescription className="text-purple-600 font-medium">
                      {campaign.brand}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(campaign.reward_amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'ko' ? '보상' : '報酬'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{campaign.description}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {language === 'ko' ? '신청 마감: ' : '応募締切: '}
                        {new Date(campaign.application_deadline).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        {language === 'ko' ? '신청자: ' : '応募者: '}
                        {campaignApplications.length}/{campaign.max_participants}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span>
                        {language === 'ko' ? '카테고리: ' : 'カテゴリー: '}
                        {campaign.category || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* 캠페인 질문 표시 */}
                  {campaign.questions && campaign.questions.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          {language === 'ko' ? '캠페인 질문' : 'キャンペーン質問'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {campaign.questions.map((question, index) => (
                          <div key={index} className="text-sm text-blue-700">
                            {index + 1}. {question.text}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(campaign)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '편집' : '編集'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCampaign(campaign)
                        setApplicationsModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '응모자 관리' : '応募者管理'} ({campaignApplications.length})
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/campaigns/${campaign.id}/applications`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '응모자 상세' : '応募者詳細'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/campaigns/${campaign.id}/confirmed`)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '확정 크리에이터' : '確定クリエイター'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/campaigns/${campaign.id}/report`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {language === 'ko' ? '최종 보고서' : '最終報告書'}
                    </Button>
                    
                    {campaign.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign)
                          setCancelModal(true)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {language === 'ko' ? '캠페인 취소' : 'キャンペーンキャンセル'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {language === 'ko' ? '캠페인이 없습니다' : 'キャンペーンがありません'}
              </h3>
              <p className="text-gray-500">
                {language === 'ko' 
                  ? '새 캠페인을 생성하여 시작하세요'
                  : '新しいキャンペーンを作成して開始してください'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 캠페인 생성 모달 */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '새 캠페인 생성' : '新規キャンペーン作成'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko' 
                ? '새로운 캠페인을 생성하세요.'
                : '新しいキャンペーンを作成してください。'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">{language === 'ko' ? '캠페인 제목' : 'キャンペーンタイトル'} *</Label>
                <Input
                  id="title"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === 'ko' ? '캠페인 제목을 입력하세요' : 'キャンペーンタイトルを入力してください'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">{language === 'ko' ? '브랜드명' : 'ブランド名'} *</Label>
                <Input
                  id="brand"
                  value={campaignForm.brand}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder={language === 'ko' ? '브랜드명을 입력하세요' : 'ブランド名を入力してください'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{language === 'ko' ? '캠페인 설명' : 'キャンペーン説明'}</Label>
              <Textarea
                id="description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'ko' ? '캠페인에 대한 자세한 설명을 입력하세요' : 'キャンペーンの詳細説明を入力してください'}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">{language === 'ko' ? '참가 요건' : '参加要件'}</Label>
              <Textarea
                id="requirements"
                value={campaignForm.requirements}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder={language === 'ko' ? '참가자가 충족해야 할 요건을 입력하세요' : '参加者が満たすべき要件を入力してください'}
                rows={3}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward_amount">{language === 'ko' ? '보상 금액 (JPY)' : '報酬金額 (JPY)'}</Label>
                <Input
                  id="reward_amount"
                  type="number"
                  min="0"
                  value={campaignForm.reward_amount}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, reward_amount: e.target.value }))}
                  placeholder="10000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_participants">{language === 'ko' ? '최대 참가자 수' : '最大参加者数'}</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={campaignForm.max_participants}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, max_participants: e.target.value }))}
                  placeholder="50"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">{language === 'ko' ? '시작일' : '開始日'}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={campaignForm.start_date}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">{language === 'ko' ? '종료일' : '終了日'}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={campaignForm.end_date}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="application_deadline">{language === 'ko' ? '신청 마감일' : '応募締切日'}</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={campaignForm.application_deadline}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, application_deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{language === 'ko' ? '카테고리' : 'カテゴリー'}</Label>
                <Select 
                  value={campaignForm.category} 
                  onValueChange={(value) => setCampaignForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ko' ? '카테고리 선택' : 'カテゴリーを選択'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beauty">{language === 'ko' ? '뷰티' : '美容'}</SelectItem>
                    <SelectItem value="fashion">{language === 'ko' ? '패션' : 'ファッション'}</SelectItem>
                    <SelectItem value="food">{language === 'ko' ? '음식' : '食品'}</SelectItem>
                    <SelectItem value="lifestyle">{language === 'ko' ? '라이프스타일' : 'ライフスタイル'}</SelectItem>
                    <SelectItem value="tech">{language === 'ko' ? '기술' : 'テクノロジー'}</SelectItem>
                    <SelectItem value="other">{language === 'ko' ? '기타' : 'その他'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">{language === 'ko' ? '상태' : '状態'}</Label>
                <Select 
                  value={campaignForm.status} 
                  onValueChange={(value) => setCampaignForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{language === 'ko' ? '초안' : '下書き'}</SelectItem>
                    <SelectItem value="active">{language === 'ko' ? '활성' : 'アクティブ'}</SelectItem>
                    <SelectItem value="paused">{language === 'ko' ? '일시정지' : '一時停止'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 캠페인 질문 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <Label className="text-lg font-semibold">
                  {language === 'ko' ? '캠페인 질문 (최대 4개)' : 'キャンペーン質問 (最大4個)'}
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                {language === 'ko' 
                  ? '지원자에게 추가로 묻고 싶은 질문을 설정하세요. 빈 질문은 자동으로 제외됩니다.'
                  : '応募者に追加で聞きたい質問を設定してください。空の質問は自動的に除外されます。'
                }
              </p>
              
              {campaignForm.questions.map((question, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`question_${index}`}>
                      {language === 'ko' ? `질문 ${index + 1}` : `質問 ${index + 1}`}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required_${index}`}
                        checked={question.required}
                        onCheckedChange={(checked) => handleQuestionChange(index, 'required', checked)}
                      />
                      <Label htmlFor={`required_${index}`} className="text-sm">
                        {language === 'ko' ? '필수' : '必須'}
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id={`question_${index}`}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                    placeholder={language === 'ko' 
                      ? '지원자에게 묻고 싶은 질문을 입력하세요'
                      : '応募者に聞きたい質問を入力してください'
                    }
                    rows={2}
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">{language === 'ko' ? '타겟 오디언스' : 'ターゲットオーディエンス'}</Label>
              <Input
                id="target_audience"
                value={campaignForm.target_audience}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder={language === 'ko' ? '20-30대 여성, 뷰티에 관심 있는 사람 등' : '20-30代女性、美容に興味のある方など'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special_instructions">{language === 'ko' ? '특별 지시사항' : '特別指示事項'}</Label>
              <Textarea
                id="special_instructions"
                value={campaignForm.special_instructions}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder={language === 'ko' ? '크리에이터에게 전달할 특별한 지시사항이 있다면 입력하세요' : 'クリエイターに伝える特別な指示事項があれば入力してください'}
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleCreateCampaign}
                disabled={processing || !campaignForm.title || !campaignForm.brand}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {language === 'ko' ? '캠페인 생성' : 'キャンペーン作成'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateModal(false)
                  resetForm()
                }}
              >
                {language === 'ko' ? '취소' : 'キャンセル'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 캠페인 편집 모달 */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '캠페인 편집' : 'キャンペーン編集'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko' 
                ? '캠페인 정보를 수정하세요.'
                : 'キャンペーン情報を編集してください。'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* 편집 폼 내용은 생성 폼과 동일 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">{language === 'ko' ? '캠페인 제목' : 'キャンペーンタイトル'} *</Label>
                <Input
                  id="edit_title"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === 'ko' ? '캠페인 제목을 입력하세요' : 'キャンペーンタイトルを入力してください'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_brand">{language === 'ko' ? '브랜드명' : 'ブランド名'} *</Label>
                <Input
                  id="edit_brand"
                  value={campaignForm.brand}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder={language === 'ko' ? '브랜드명을 입력하세요' : 'ブランド名を入力してください'}
                />
              </div>
            </div>

            {/* 캠페인 질문 편집 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <Label className="text-lg font-semibold">
                  {language === 'ko' ? '캠페인 질문 (최대 4개)' : 'キャンペーン質問 (最大4個)'}
                </Label>
              </div>
              
              {campaignForm.questions.map((question, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`edit_question_${index}`}>
                      {language === 'ko' ? `질문 ${index + 1}` : `質問 ${index + 1}`}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit_required_${index}`}
                        checked={question.required}
                        onCheckedChange={(checked) => handleQuestionChange(index, 'required', checked)}
                      />
                      <Label htmlFor={`edit_required_${index}`} className="text-sm">
                        {language === 'ko' ? '필수' : '必須'}
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id={`edit_question_${index}`}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                    placeholder={language === 'ko' 
                      ? '지원자에게 묻고 싶은 질문을 입력하세요'
                      : '応募者に聞きたい質問を入力してください'
                    }
                    rows={2}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleUpdateCampaign}
                disabled={processing || !campaignForm.title || !campaignForm.brand}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {language === 'ko' ? '변경사항 저장' : '変更を保存'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditModal(false)
                  resetForm()
                }}
              >
                {language === 'ko' ? '취소' : 'キャンセル'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 캠페인 취소 모달 */}
      <Dialog open={cancelModal} onOpenChange={setCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '캠페인 취소' : 'キャンペーンキャンセル'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko' 
                ? '캠페인을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
                : 'キャンペーンをキャンセルしますか？この操作は元に戻せません。'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCampaign && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedCampaign.title}</p>
                <p className="text-sm text-gray-600">{selectedCampaign.brand}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cancelReason">
                {language === 'ko' ? '취소 사유' : 'キャンセル理由'}
              </Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={language === 'ko' ? '취소 사유를 입력하세요' : 'キャンセル理由を入力してください'}
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleCancelCampaign}
                disabled={processing || !cancelReason}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {language === 'ko' ? '캠페인 취소' : 'キャンペーンキャンセル'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCancelModal(false)
                  setCancelReason('')
                }}
              >
                {language === 'ko' ? '돌아가기' : '戻る'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminCampaignsWithQuestions
