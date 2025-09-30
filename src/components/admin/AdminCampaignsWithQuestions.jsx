import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { database } from '../../lib/supabase'
import AdminNavigation from './AdminNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Loader2, Plus, Edit, Trash2, Eye, Calendar, DollarSign, 
  Users, AlertCircle, CheckCircle, Clock, Target, FileText,
  Settings, Save, X, RefreshCw
} from 'lucide-react'
import TranslationHelper from '../TranslationHelper'

const AdminCampaignsWithQuestions = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const [campaignForm, setCampaignForm] = useState({
    title: '',
    brand: '',
    description: '',
    requirements: '',
    category: 'beauty',
    reward_amount: '',
    max_participants: '',
    application_deadline: '',
    start_date: '',
    end_date: '',
    status: 'active',
    // SNS 플랫폼 선택
    target_platforms: {
      instagram: false,
      youtube: false,
      tiktok: false
    },
    question_1: '',
    question_1_required: false,
    question_2: '',
    question_2_required: false,
    question_3: '',
    question_3_required: false,
    question_4: '',
    question_4_required: false
  })

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '캠페인 관리',
      subtitle: '모든 캠페인을 관리합니다',
      createCampaign: '새로운 캠페인 작성',
      editCampaign: '캠페인 수정',
      deleteCampaign: '캠페인 삭제',
      viewApplications: '신청자 보기',
      campaignTitle: '캠페인 제목',
      brand: '브랜드',
      description: '설명',
      requirements: '참여 조건',
      category: '카테고리',
      rewardAmount: '보상금',
      maxParticipants: '최대 참여자',
      applicationDeadline: '신청 마감일',
      startDate: '시작일',
      endDate: '종료일',
      status: '상태',
      active: '활성',
      inactive: '비활성',
      completed: '완료',
      questions: '질문',
      question: '질문',
      required: '필수',
      optional: '선택',
      save: '저장',
      cancel: '취소',
      edit: '수정',
      delete: '삭제',
      loading: '로딩 중...',
      error: '오류가 발생했습니다.',
      success: '성공적으로 처리되었습니다.',
      campaignCreated: '캠페인이 생성되었습니다.',
      campaignUpdated: '캠페인이 수정되었습니다.',
      campaignDeleted: '캠페인이 삭제되었습니다.',
      confirmDelete: '정말로 이 캠페인을 삭제하시겠습니까?',
      beauty: '뷰티',
      fashion: '패션',
      food: '음식',
      lifestyle: '라이프스타일',
      tech: '기술',
      other: '기타',
      targetPlatforms: '대상 SNS 플랫폼',
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      translator: '한국어 → 일본어 번역기'
    },
    ja: {
      title: 'キャンペーン管理',
      subtitle: 'すべてのキャンペーンを管理します',
      createCampaign: '新しいキャンペーン作成',
      editCampaign: 'キャンペーン編集',
      deleteCampaign: 'キャンペーン削除',
      viewApplications: '応募者を見る',
      campaignTitle: 'キャンペーンタイトル',
      brand: 'ブランド',
      description: '説明',
      requirements: '参加条件',
      category: 'カテゴリー',
      rewardAmount: '報酬金額',
      maxParticipants: '最大参加者数',
      applicationDeadline: '応募締切日',
      startDate: '開始日',
      endDate: '終了日',
      status: 'ステータス',
      active: 'アクティブ',
      inactive: '非アクティブ',
      completed: '完了',
      questions: '質問',
      question: '質問',
      required: '必須',
      optional: '任意',
      save: '保存',
      cancel: 'キャンセル',
      edit: '編集',
      delete: '削除',
      loading: '読み込み中...',
      error: 'エラーが発生しました。',
      success: '正常に処理されました。',
      campaignCreated: 'キャンペーンが作成されました。',
      campaignUpdated: 'キャンペーンが更新されました。',
      campaignDeleted: 'キャンペーンが削除されました。',
      confirmDelete: '本当にこのキャンペーンを削除しますか？',
      beauty: 'ビューティー',
      fashion: 'ファッション',
      food: 'フード',
      lifestyle: 'ライフスタイル',
      tech: 'テクノロジー',
      other: 'その他',
      targetPlatforms: '対象SNSプラットフォーム',
      instagram: 'Instagram',
      youtube: 'YouTube',
      tiktok: 'TikTok',
      translator: '韓国語 → 日本語翻訳機'
    }
  }

  const t = texts[language] || texts.ko

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('캠페인 데이터 로드 시작')
      
      // 타임아웃 설정
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('데이터 로드 타임아웃')), 15000)
      )

      // 캠페인 데이터 로드
      const loadPromise = database.campaigns.getAll()
      const data = await Promise.race([loadPromise, timeout])
      
      console.log('로드된 캠페인 데이터:', data)
      setCampaigns(data || [])
      
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      setError(`데이터 로드에 실패했습니다: ${error.message}`)
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
      category: 'beauty',
      reward_amount: '',
      max_participants: '',
      application_deadline: '',
      start_date: '',
      end_date: '',
      status: 'active',
      target_platforms: {
        instagram: false,
        youtube: false,
        tiktok: false
      },
      question_1: '',
      question_1_required: false,
      question_2: '',
      question_2_required: false,
      question_3: '',
      question_3_required: false,
      question_4: '',
      question_4_required: false
    })
  }

  const handleCreateCampaign = async () => {
    try {
      setProcessing(true)
      setError('')
      setSuccess('')
      
      console.log('캠페인 생성 시작:', campaignForm)

      // 필수 필드 검증
      if (!campaignForm.title || !campaignForm.brand || !campaignForm.requirements) {
        throw new Error('제목, 브랜드, 참여 조건은 필수 입력 항목입니다.')
      }

      // 타임아웃 설정
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('캠페인 생성 타임아웃')), 15000)
      )

      // 캠페인 생성
      const createPromise = database.campaigns.create(campaignForm)
      await Promise.race([createPromise, timeout])
      
      console.log('캠페인 생성 완료')
      
      setSuccess(t.campaignCreated)
      setCreateModal(false)
      resetForm()
      
      // 데이터 다시 로드
      setTimeout(() => {
        loadData()
      }, 1000)
      
    } catch (error) {
      console.error('캠페인 생성 오류:', error)
      setError(`캠페인 생성에 실패했습니다: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return

    try {
      setProcessing(true)
      setError('')
      setSuccess('')
      
      console.log('캠페인 수정 시작:', campaignForm)

      // 필수 필드 검증
      if (!campaignForm.title || !campaignForm.brand || !campaignForm.requirements) {
        throw new Error('제목, 브랜드, 참여 조건은 필수 입력 항목입니다.')
      }

      // 타임아웃 설정
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('캠페인 수정 타임아웃')), 15000)
      )

      // 캠페인 수정
      const updatePromise = database.campaigns.update(selectedCampaign.id, campaignForm)
      await Promise.race([updatePromise, timeout])
      
      console.log('캠페인 수정 완료')
      
      setSuccess(t.campaignUpdated)
      setEditModal(false)
      setSelectedCampaign(null)
      resetForm()
      
      // 데이터 다시 로드
      setTimeout(() => {
        loadData()
      }, 1000)
      
    } catch (error) {
      console.error('캠페인 수정 오류:', error)
      setError(`캠페인 수정에 실패했습니다: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm(t.confirmDelete)) return

    try {
      setProcessing(true)
      setError('')
      setSuccess('')
      
      console.log('캠페인 삭제 시작:', campaignId)

      // 타임아웃 설정
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('캠페인 삭제 타임아웃')), 15000)
      )

      // 캠페인 삭제
      const deletePromise = database.campaigns.delete(campaignId)
      await Promise.race([deletePromise, timeout])
      
      console.log('캠페인 삭제 완료')
      
      setSuccess(t.campaignDeleted)
      
      // 데이터 다시 로드
      setTimeout(() => {
        loadData()
      }, 1000)
      
    } catch (error) {
      console.error('캠페인 삭제 오류:', error)
      setError(`캠페인 삭제에 실패했습니다: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign)
    
    // 날짜 형식 변환 (ISO string을 YYYY-MM-DD 형식으로)
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toISOString().split('T')[0]
    }

    setCampaignForm({
      title: campaign.title || '',
      brand: campaign.brand || '',
      description: campaign.description || '',
      requirements: campaign.requirements || '',
      category: campaign.category || 'beauty',
      reward_amount: campaign.reward_amount?.toString() || '',
      max_participants: campaign.max_participants?.toString() || '',
      application_deadline: formatDateForInput(campaign.application_deadline),
      start_date: formatDateForInput(campaign.start_date),
      end_date: formatDateForInput(campaign.end_date),
      status: campaign.status || 'active',
      question_1: campaign.question_1 || '',
      question_1_required: campaign.question_1_required || false,
      question_2: campaign.question_2 || '',
      question_2_required: campaign.question_2_required || false,
      question_3: campaign.question_3 || '',
      question_3_required: campaign.question_3_required || false,
      question_4: campaign.question_4 || '',
      question_4_required: campaign.question_4_required || false
    })
    
    setEditModal(true)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: 'default', text: t.active },
      inactive: { variant: 'secondary', text: t.inactive },
      completed: { variant: 'outline', text: t.completed }
    }
    
    const statusInfo = statusMap[status] || statusMap.active
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'ja-JP', {
      style: 'currency',
      currency: language === 'ko' ? 'KRW' : 'JPY'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{t.loading}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      {/* 분할 화면 레이아웃 */}
      <div className="flex h-screen pt-16">
        {/* 왼쪽: 캠페인 관리 */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                  <p className="text-gray-600 mt-1">{t.subtitle}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={loadData}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    새로고침
                  </Button>
                  <Dialog open={createModal} onOpenChange={setCreateModal}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => { resetForm(); setCreateModal(true) }}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t.createCampaign}
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* 캠페인 목록 */}
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {campaign.brand}
                        </CardDescription>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">보상금:</span>
                          <span className="ml-1 font-medium">{formatCurrency(campaign.reward_amount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">참여자:</span>
                          <span className="ml-1 font-medium">{campaign.max_participants || '-'}명</span>
                        </div>
                        <div>
                          <span className="text-gray-500">마감일:</span>
                          <span className="ml-1 font-medium">{formatDate(campaign.application_deadline)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">카테고리:</span>
                          <span className="ml-1 font-medium">{t[campaign.category] || campaign.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/applications?campaign=${campaign.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          신청자
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(campaign)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t.edit}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t.delete}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {campaigns.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">등록된 캠페인이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 번역기 */}
        <div className="w-1/2 bg-gray-50">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">🌐</span>
                {t.translator}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                캠페인 내용을 한국어로 작성하고 일본어로 번역하세요
              </p>
            </div>
            <TranslationHelper />
          </div>
        </div>
      </div>

      {/* 캠페인 생성 모달 */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.createCampaign}</DialogTitle>
            <DialogDescription>
              새로운 캠페인을 생성합니다. 모든 필수 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">{t.campaignTitle} *</Label>
                <Input
                  id="title"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="캠페인 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="brand">{t.brand} *</Label>
                <Input
                  id="brand"
                  value={campaignForm.brand}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="브랜드명을 입력하세요"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="캠페인 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="requirements">{t.requirements} *</Label>
              <Textarea
                id="requirements"
                value={campaignForm.requirements}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="참가조건을 입력하세요"
                rows={3}
              />
            </div>

            {/* 카테고리 및 금액 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">{t.category}</Label>
                <Select value={campaignForm.category} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beauty">{t.beauty}</SelectItem>
                    <SelectItem value="fashion">{t.fashion}</SelectItem>
                    <SelectItem value="food">{t.food}</SelectItem>
                    <SelectItem value="lifestyle">{t.lifestyle}</SelectItem>
                    <SelectItem value="tech">{t.tech}</SelectItem>
                    <SelectItem value="other">{t.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reward_amount">{t.rewardAmount}</Label>
                <Input
                  id="reward_amount"
                  type="number"
                  value={campaignForm.reward_amount}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, reward_amount: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="max_participants">{t.maxParticipants}</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={campaignForm.max_participants}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, max_participants: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* 날짜 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="application_deadline">{t.applicationDeadline}</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={campaignForm.application_deadline}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, application_deadline: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="start_date">{t.startDate}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={campaignForm.start_date}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="end_date">{t.endDate}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={campaignForm.end_date}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">{t.status}</Label>
              <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                  <SelectItem value="completed">{t.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SNS 플랫폼 선택 */}
            <div>
              <Label>{t.targetPlatforms} *</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instagram"
                    checked={campaignForm.target_platforms.instagram}
                    onCheckedChange={(checked) => setCampaignForm(prev => ({
                      ...prev,
                      target_platforms: { ...prev.target_platforms, instagram: checked }
                    }))}
                  />
                  <Label htmlFor="instagram">📷 {t.instagram}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="youtube"
                    checked={campaignForm.target_platforms.youtube}
                    onCheckedChange={(checked) => setCampaignForm(prev => ({
                      ...prev,
                      target_platforms: { ...prev.target_platforms, youtube: checked }
                    }))}
                  />
                  <Label htmlFor="youtube">🎥 {t.youtube}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tiktok"
                    checked={campaignForm.target_platforms.tiktok}
                    onCheckedChange={(checked) => setCampaignForm(prev => ({
                      ...prev,
                      target_platforms: { ...prev.target_platforms, tiktok: checked }
                    }))}
                  />
                  <Label htmlFor="tiktok">🎵 {t.tiktok}</Label>
                </div>
              </div>
            </div>

            {/* 질문 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t.questions}</h3>
              
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`question_${num}`}>{t.question} {num}</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`question_${num}_required`}
                        checked={campaignForm[`question_${num}_required`]}
                        onCheckedChange={(checked) => setCampaignForm(prev => ({ ...prev, [`question_${num}_required`]: checked }))}
                      />
                      <Label htmlFor={`question_${num}_required`} className="text-sm">
                        {t.required}
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id={`question_${num}`}
                    value={campaignForm[`question_${num}`]}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, [`question_${num}`]: e.target.value }))}
                    placeholder={`질문 ${num}을 입력하세요`}
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setCreateModal(false)}
                disabled={processing}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 캠페인 수정 모달 */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.editCampaign}</DialogTitle>
            <DialogDescription>
              캠페인 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title">{t.campaignTitle} *</Label>
                <Input
                  id="edit_title"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="캠페인 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="edit_brand">{t.brand} *</Label>
                <Input
                  id="edit_brand"
                  value={campaignForm.brand}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="브랜드명을 입력하세요"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">{t.description}</Label>
              <Textarea
                id="edit_description"
                value={campaignForm.description}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="캠페인 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit_requirements">{t.requirements} *</Label>
              <Textarea
                id="edit_requirements"
                value={campaignForm.requirements}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="참가조건을 입력하세요"
                rows={3}
              />
            </div>

            {/* 카테고리 및 금액 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_category">{t.category}</Label>
                <Select value={campaignForm.category} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beauty">{t.beauty}</SelectItem>
                    <SelectItem value="fashion">{t.fashion}</SelectItem>
                    <SelectItem value="food">{t.food}</SelectItem>
                    <SelectItem value="lifestyle">{t.lifestyle}</SelectItem>
                    <SelectItem value="tech">{t.tech}</SelectItem>
                    <SelectItem value="other">{t.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_reward_amount">{t.rewardAmount}</Label>
                <Input
                  id="edit_reward_amount"
                  type="number"
                  value={campaignForm.reward_amount}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, reward_amount: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="edit_max_participants">{t.maxParticipants}</Label>
                <Input
                  id="edit_max_participants"
                  type="number"
                  value={campaignForm.max_participants}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, max_participants: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* 날짜 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_application_deadline">{t.applicationDeadline}</Label>
                <Input
                  id="edit_application_deadline"
                  type="date"
                  value={campaignForm.application_deadline}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, application_deadline: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_start_date">{t.startDate}</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={campaignForm.start_date}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit_end_date">{t.endDate}</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={campaignForm.end_date}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_status">{t.status}</Label>
              <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                  <SelectItem value="completed">{t.completed}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 질문 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t.questions}</h3>
              
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`edit_question_${num}`}>{t.question} {num}</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit_question_${num}_required`}
                        checked={campaignForm[`question_${num}_required`]}
                        onCheckedChange={(checked) => setCampaignForm(prev => ({ ...prev, [`question_${num}_required`]: checked }))}
                      />
                      <Label htmlFor={`edit_question_${num}_required`} className="text-sm">
                        {t.required}
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id={`edit_question_${num}`}
                    value={campaignForm[`question_${num}`]}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, [`question_${num}`]: e.target.value }))}
                    placeholder={`질문 ${num}을 입력하세요`}
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setEditModal(false)}
                disabled={processing}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleUpdateCampaign}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminCampaignsWithQuestions
