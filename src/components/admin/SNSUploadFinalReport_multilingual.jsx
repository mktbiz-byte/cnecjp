import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { database } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, ArrowLeft, Download, Play, 
  AlertCircle, CheckCircle, Users, FileText, 
  Calendar, DollarSign, Activity,
  Instagram, Youtube, Hash, ExternalLink, Globe,
  TrendingUp, BarChart3, Award
} from 'lucide-react'
import i18n from '../../lib/i18n'
import LanguageSelector from '../LanguageSelector'

const SNSUploadFinalReport = () => {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  
  const [campaign, setCampaign] = useState(null)
  const [applications, setApplications] = useState([])
  const [userProfiles, setUserProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [reportData, setReportData] = useState({
    totalUploads: 0,
    platformStats: {
      instagram: 0,
      tiktok: 0,
      youtube: 0,
      other: 0
    }
  })

  useEffect(() => {
    loadData()
  }, [campaignId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 특정 캠페인 또는 전체 캠페인 로드
      if (campaignId && campaignId !== 'undefined') {
        const campaignData = await database.campaigns.getById(campaignId)
        if (!campaignData) {
          setError(i18n.t('common.error'))
          return
        }
        setCampaign(campaignData)
      } else {
        // campaignId가 없으면 전체 SNS 업로드 보기
        console.log('전체 SNS 업로드 보기 모드')
        setCampaign(null)
      }
      
      // SNS 업로드 데이터 로드
      let applicationsData
      if (campaignId && campaignId !== 'undefined') {
        applicationsData = await database.applications.getByCampaign(campaignId)
      } else {
        applicationsData = await database.applications.getAll()
      }
      
      if (!applicationsData) {
        setError(i18n.t('common.error'))
        return
      }
      
      // 기본 통계 계산
      const dataArray = Array.isArray(applicationsData) ? applicationsData : applicationsData?.data || []
      const stats = {
        totalUploads: dataArray.length,
        platformStats: {
          instagram: 0,
          tiktok: 0, 
          youtube: 0,
          other: 0
        }
      }
      
      setApplications(dataArray)
      setReportData(stats)
      
      // 사용자 프로필 로드
      if (dataArray.length > 0) {
        const userIds = [...new Set(dataArray.map(app => app.user_id))]
        const profiles = {}
        
        for (const userId of userIds) {
          const profile = await database.userProfiles.get(userId)
          if (profile) {
            profiles[userId] = profile
          }
        }
        setUserProfiles(profiles)
      }
      
    } catch (error) {
      console.error('SNS 업로드 데이터 로드 오류:', error)
      setError(i18n.t('common.error'))
    } finally {
      setLoading(false)
    }

  }

  const calculateReportData = (apps) => {
    const platformStats = {
      instagram: 0,
      tiktok: 0,
      youtube: 0,
      other: 0
    }
    
    let totalUploads = 0
    
    apps.forEach(app => {
      if (app.video_links) {
        if (app.video_links.instagram_url) {
          platformStats.instagram++
          totalUploads++
        }
        if (app.video_links.tiktok_url) {
          platformStats.tiktok++
          totalUploads++
        }
        if (app.video_links.youtube_url) {
          platformStats.youtube++
          totalUploads++
        }
        if (app.video_links.other_url) {
          platformStats.other++
          totalUploads++
        }
      }
    })
    
    setReportData({
      totalUploads,
      platformStats
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(i18n.getCurrentLanguage() === 'en' ? 'en-US' : 'ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    const locale = i18n.getCurrentLanguage() === 'en' ? 'en-US' : 
                  i18n.getCurrentLanguage() === 'ko' ? 'ko-KR' : 'ja-JP'
    
    return date.toLocaleDateString(locale)
  }

  const exportToExcel = () => {
    const headers = [
      i18n.t('common.name'), 
      'Instagram URL', 
      'TikTok URL', 
      'YouTube URL', 
      i18n.t('snsUploadReport.notes'), 
      i18n.t('snsUploadReport.uploadDate')
    ]
    
    const rows = applications.map(app => {
      const profile = userProfiles[app.user_id]
      const videoLinks = app.video_links || {}
      return [
        profile?.name || 'N/A',
        videoLinks.instagram_url || '',
        videoLinks.tiktok_url || '',
        videoLinks.youtube_url || '',
        videoLinks.other_url || '',
        videoLinks.notes || '',
        app.video_uploaded_at ? formatDate(app.video_uploaded_at) : 'N/A'
      ]
    })
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${campaign?.title || 'campaign'}_sns_uploads_final.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{i18n.t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!campaign && campaignId && campaignId !== 'undefined') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{i18n.t('common.error')}</h3>
        <Button onClick={() => navigate('/admin/campaigns')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {i18n.t('common.back')}
        </Button>
      </div>
    )
  }
  
  // 전체 SNS 업로드 보기 모드
  if (!campaign && (!campaignId || campaignId === 'undefined')) {
    return (
      <div className="space-y-6">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => navigate('/admin/campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {i18n.t('common.back')}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {i18n.t('common.download')}
            </Button>
            <Button onClick={() => window.print()}>
              <FileText className="h-4 w-4 mr-2" />
              {i18n.t('common.print')}
            </Button>
          </div>
        </div>

        {/* Header Card */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{i18n.t('snsUploadReport.title')}</CardTitle>
                <CardDescription className="text-xl text-purple-600 font-medium">
                  {i18n.t('snsUploadReport.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{i18n.t('snsUploadReport.completedCreators')}</p>
                  <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{i18n.t('snsUploadReport.totalUploads')}</p>
                  <p className="text-3xl font-bold text-green-600">{reportData.totalUploads}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>{i18n.t('snsUploadReport.platformStats')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Instagram className="h-8 w-8 text-pink-500" />
                  <div>
                    <p className="font-medium">{i18n.t('sns.instagram')}</p>
                    <p className="text-sm text-gray-600">{i18n.t('sns.reels')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-pink-600">
                  {reportData.platformStats.instagram}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Hash className="h-8 w-8 text-black" />
                  <div>
                    <p className="font-medium">{i18n.t('sns.tiktok')}</p>
                    <p className="text-sm text-gray-600">{i18n.t('sns.shorts')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {reportData.platformStats.tiktok}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Youtube className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium">{i18n.t('sns.youtube')}</p>
                    <p className="text-sm text-gray-600">{i18n.t('sns.videos')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {reportData.platformStats.youtube}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{i18n.t('sns.other')}</p>
                    <p className="text-sm text-gray-600">{i18n.t('sns.externalPlatform')}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.platformStats.other}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Content List */}
        <Card>
          <CardHeader>
            <CardTitle>{i18n.t('snsUploadReport.uploadedContentList')}</CardTitle>
            <CardDescription>
              {i18n.t('snsUploadReport.uploadedContentDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {applications.map((application) => {
                const profile = userProfiles[application.user_id]
                const videoLinks = application.video_links || {}
                
                return (
                  <div key={application.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{profile?.name || 'N/A'}</h3>
                        <p className="text-sm text-gray-600">
                          {i18n.t('snsUploadReport.uploadDate')}: {application.video_uploaded_at ? formatDate(application.video_uploaded_at) : 'N/A'}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {i18n.t('snsUploadReport.completed')}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {videoLinks.instagram_url && (
                        <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Instagram className="h-6 w-6 text-pink-500" />
                            <div>
                              <p className="font-medium">{i18n.t('sns.instagram')}</p>
                              <p className="text-sm text-gray-600">{i18n.t('sns.reels')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={videoLinks.instagram_url} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-2" />
                              {i18n.t('snsUploadReport.watch')}
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {videoLinks.tiktok_url && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Hash className="h-6 w-6 text-black" />
                            <div>
                              <p className="font-medium">{i18n.t('sns.tiktok')}</p>
                              <p className="text-sm text-gray-600">{i18n.t('sns.shorts')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={videoLinks.tiktok_url} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-2" />
                              {i18n.t('snsUploadReport.watch')}
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {videoLinks.youtube_url && (
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Youtube className="h-6 w-6 text-red-500" />
                            <div>
                              <p className="font-medium">{i18n.t('sns.youtube')}</p>
                              <p className="text-sm text-gray-600">{i18n.t('sns.videos')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={videoLinks.youtube_url} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-2" />
                              {i18n.t('snsUploadReport.watch')}
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {videoLinks.other_url && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Globe className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium">{i18n.t('sns.other')}</p>
                              <p className="text-sm text-gray-600">{i18n.t('sns.externalPlatform')}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={videoLinks.other_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {i18n.t('common.view')}
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {videoLinks.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">{i18n.t('snsUploadReport.notes')}:</p>
                        <p className="text-sm text-gray-600">{videoLinks.notes}</p>
                      </div>
                    )}
                  </div>
                )
              })}
              
              {applications.length === 0 && (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">{i18n.t('common.error')}</h3>
                  <p className="text-gray-500">{i18n.t('common.error')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 특정 캠페인 SNS 업로드 보기 모드
  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <div className="flex justify-end mb-4">
        <LanguageSelector />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate('/admin/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {i18n.t('common.back')}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {i18n.t('common.download')}
          </Button>
          <Button onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            {i18n.t('common.print')}
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{campaign.title}</CardTitle>
              <CardDescription className="text-xl text-purple-600 font-medium">
                {i18n.t('snsUploadReport.description')}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>{i18n.t('snsUploadReport.completed')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(applications.length * campaign.reward_amount)}
            </div>
            <div className="text-sm text-gray-600">{i18n.t('companyReport.metrics.totalReward')}</div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{i18n.t('snsUploadReport.completedCreators')}</p>
                <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{i18n.t('snsUploadReport.totalUploads')}</p>
                <p className="text-3xl font-bold text-green-600">{reportData.totalUploads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{i18n.t('companyReport.metrics.totalReward')}</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(applications.length * campaign.reward_amount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{i18n.t('companyReport.campaignPerformance.completionRate')}</p>
                <p className="text-3xl font-bold text-orange-600">100%</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{i18n.t('snsUploadReport.platformStats')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Instagram className="h-8 w-8 text-pink-500" />
                <div>
                  <p className="font-medium">{i18n.t('sns.instagram')}</p>
                  <p className="text-sm text-gray-600">{i18n.t('sns.reels')}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-pink-600">
                {reportData.platformStats.instagram}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Hash className="h-8 w-8 text-black" />
                <div>
                  <p className="font-medium">{i18n.t('sns.tiktok')}</p>
                  <p className="text-sm text-gray-600">{i18n.t('sns.shorts')}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {reportData.platformStats.tiktok}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Youtube className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium">{i18n.t('sns.youtube')}</p>
                  <p className="text-sm text-gray-600">{i18n.t('sns.videos')}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {reportData.platformStats.youtube}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{i18n.t('sns.other')}</p>
                  <p className="text-sm text-gray-600">{i18n.t('sns.externalPlatform')}</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {reportData.platformStats.other}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Content List */}
      <Card>
        <CardHeader>
          <CardTitle>{i18n.t('snsUploadReport.uploadedContentList')}</CardTitle>
          <CardDescription>
            {i18n.t('snsUploadReport.uploadedContentDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {applications.map((application) => {
              const profile = userProfiles[application.user_id]
              const videoLinks = application.video_links || {}
              
              return (
                <div key={application.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{profile?.name || 'N/A'}</h3>
                      <p className="text-sm text-gray-600">
                        {i18n.t('snsUploadReport.uploadDate')}: {application.video_uploaded_at ? formatDate(application.video_uploaded_at) : 'N/A'}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {i18n.t('snsUploadReport.completed')}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {videoLinks.instagram_url && (
                      <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Instagram className="h-6 w-6 text-pink-500" />
                          <div>
                            <p className="font-medium">{i18n.t('sns.instagram')}</p>
                            <p className="text-sm text-gray-600">{i18n.t('sns.reels')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={videoLinks.instagram_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-2" />
                            {i18n.t('snsUploadReport.watch')}
                          </a>
                        </Button>
                      </div>
                    )}
                    
                    {videoLinks.tiktok_url && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Hash className="h-6 w-6 text-black" />
                          <div>
                            <p className="font-medium">{i18n.t('sns.tiktok')}</p>
                            <p className="text-sm text-gray-600">{i18n.t('sns.shorts')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={videoLinks.tiktok_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-2" />
                            {i18n.t('snsUploadReport.watch')}
                          </a>
                        </Button>
                      </div>
                    )}
                    
                    {videoLinks.youtube_url && (
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Youtube className="h-6 w-6 text-red-500" />
                          <div>
                            <p className="font-medium">{i18n.t('sns.youtube')}</p>
                            <p className="text-sm text-gray-600">{i18n.t('sns.videos')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={videoLinks.youtube_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-2" />
                            {i18n.t('snsUploadReport.watch')}
                          </a>
                        </Button>
                      </div>
                    )}
                    
                    {videoLinks.other_url && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe className="h-6 w-6 text-blue-500" />
                          <div>
                            <p className="font-medium">{i18n.t('sns.other')}</p>
                            <p className="text-sm text-gray-600">{i18n.t('sns.externalPlatform')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={videoLinks.other_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {i18n.t('common.view')}
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {videoLinks.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">{i18n.t('snsUploadReport.notes')}:</p>
                      <p className="text-sm text-gray-600">{videoLinks.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
            
            {applications.length === 0 && (
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{i18n.t('common.error')}</h3>
                <p className="text-gray-500">{i18n.t('common.error')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {applications.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Award className="h-5 w-5" />
              <span>{i18n.t('companyReport.campaignPerformance.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">{i18n.t('companyReport.metrics.totalApplications')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{i18n.t('snsUploadReport.completedCreators')}:</span>
                    <span className="font-medium">{applications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{i18n.t('snsUploadReport.totalUploads')}:</span>
                    <span className="font-medium">{reportData.totalUploads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{i18n.t('companyReport.metrics.totalReward')}:</span>
                    <span className="font-medium">{formatCurrency(applications.length * campaign.reward_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{i18n.t('companyReport.campaignPerformance.completionRate')}:</span>
                    <span className="font-medium text-green-600">100%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">{i18n.t('companyReport.campaignPerformance.platformDistribution')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{i18n.t('sns.instagram')}:</span>
                    <span className="font-medium">{reportData.platformStats.instagram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{i18n.t('sns.tiktok')}:</span>
                    <span className="font-medium">{reportData.platformStats.tiktok}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{i18n.t('sns.youtube')}:</span>
                    <span className="font-medium">{reportData.platformStats.youtube}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{i18n.t('sns.other')}:</span>
                    <span className="font-medium">{reportData.platformStats.other}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SNSUploadFinalReport
