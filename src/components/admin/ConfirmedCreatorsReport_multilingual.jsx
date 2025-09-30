import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { database } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Loader2, ArrowLeft, Download, Eye, Edit, Save, 
  AlertCircle, CheckCircle, Users, FileText, 
  Calendar, DollarSign, MapPin, Package,
  Instagram, Youtube, Hash, ExternalLink, Copy,
  Truck, Search
} from 'lucide-react'
import i18n from '../../lib/i18n'
import LanguageSelector from '../LanguageSelector'

const ConfirmedCreatorsReport = () => {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  
  const [campaign, setCampaign] = useState(null)
  const [applications, setApplications] = useState([])
  const [userProfiles, setUserProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [trackingModal, setTrackingModal] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [language, setLanguage] = useState(i18n.getCurrentLanguage())

  // 언어 변경 이벤트 리스너
  useEffect(() => {
    const handleLanguageChange = (e) => {
      setLanguage(e.detail.language);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

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
        // campaignId가 없으면 전체 확정 크리에이터 보기
        console.log('전체 확정 크리에이터 보기 모드')
        setCampaign(null)
      }
      
      // 승인된 신청서들 로드 (확정 크리에이터)
      let applicationsData
      if (campaignId && campaignId !== 'undefined') {
        applicationsData = await database.applications.getByCampaign(campaignId)
      } else {
        applicationsData = await database.applications.getAll()
      }
      
      if (!applicationsData || applicationsData.length === 0) {
        setApplications([])
        return
      }
      
      const approvedApplications = (Array.isArray(applicationsData) ? applicationsData : applicationsData?.data || [])
        .filter(app => app.status === 'approved' || app.status === 'completed')
      setApplications(approvedApplications)
      
      // 신청자들의 프로필 정보 로드
      const profiles = {}
      for (const app of approvedApplications) {
        const profile = await database.userProfiles.get(app.user_id)
        if (profile) {
          profiles[app.user_id] = profile
        }
      }
      setUserProfiles(profiles)
      
    } catch (error) {
      console.error('Load data error:', error)
      setError(i18n.t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleTrackingUpdate = async (applicationId, trackingNum) => {
    try {
      setProcessing(true)
      setError('')
      
      await database.applications.update(applicationId, {
        tracking_number: trackingNum,
        shipped_at: trackingNum ? new Date().toISOString() : null
      })
      
      setSuccess(i18n.t('confirmedCreatorsReport.shippingInfo.success'))
      setTrackingModal(false)
      loadData()
      
    } catch (error) {
      console.error('Tracking update error:', error)
      setError(i18n.t('confirmedCreatorsReport.shippingInfo.error'))
    } finally {
      setProcessing(false)
    }
  }

  const openTrackingModal = (application) => {
    setSelectedApplication(application)
    setTrackingNumber(application.tracking_number || '')
    setTrackingModal(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      language === 'ja' ? 'ja-JP' : (language === 'ko' ? 'ko-KR' : 'en-US'), 
      {
        style: 'currency',
        currency: 'JPY'
      }
    ).format(amount || 0)
  }

  const exportToExcel = () => {
    const headers = [
      i18n.t('common.name'), 
      'Instagram', 
      'TikTok', 
      'YouTube', 
      i18n.t('common.postalCode'), 
      i18n.t('common.address'), 
      i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumber'), 
      i18n.t('confirmedCreatorsReport.shippingInfo.shippingStatus'), 
      i18n.t('confirmedCreatorsReport.approvalDate')
    ]
    
    const rows = applications.map(app => {
      const profile = userProfiles[app.user_id]
      return [
        profile?.name || 'N/A',
        profile?.instagram_url || 'N/A',
        profile?.tiktok_url || 'N/A',
        profile?.youtube_url || 'N/A',
        profile?.postal_code || 'N/A',
        `${profile?.prefecture || ''} ${profile?.city || ''} ${profile?.address || ''}`.trim() || 'N/A',
        app.tracking_number || i18n.t('confirmedCreatorsReport.notShipped'),
        app.tracking_number ? i18n.t('confirmedCreatorsReport.shipped') : i18n.t('confirmedCreatorsReport.notShipped'),
        app.approved_at ? new Date(app.approved_at).toLocaleDateString(
          language === 'ja' ? 'ja-JP' : (language === 'ko' ? 'ko-KR' : 'en-US')
        ) : 'N/A'
      ]
    })
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${campaign?.title || 'campaign'}_confirmed_creators.csv`
    link.click()
  }

  const getJapanPostTrackingUrl = (trackingNumber) => {
    return `https://trackings.post.japanpost.jp/services/srv/search/direct?reqCodeNo1=${trackingNumber}&locale=ja`
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
  
  // 전체 확정 크리에이터 보기 모드
  if (!campaign && (!campaignId || campaignId === 'undefined')) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="outline" onClick={() => navigate('/admin/campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {i18n.t('common.back')}
            </Button>
          </div>
          <div className="flex space-x-2">
            <LanguageSelector />
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {i18n.t('common.download')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{i18n.t('confirmedCreatorsReport.title')}</CardTitle>
            <CardDescription className="text-lg mt-2 text-purple-600">
              {i18n.t('confirmedCreatorsReport.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  <strong>{i18n.t('confirmedCreatorsReport.confirmedCreators')}:</strong> {applications.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="text-sm">
                  <strong>{i18n.t('confirmedCreatorsReport.shipped')}:</strong> {applications.filter(app => app.tracking_number).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmed Creators List */}
        <div className="grid gap-4">
          {applications.map((application) => {
            const profile = userProfiles[application.user_id]
            
            return (
              <Card key={application.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold">{profile?.name || 'N/A'}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {i18n.t('confirmedCreatorsReport.confirmed')}
                        </Badge>
                        {application.tracking_number && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Package className="h-3 w-3 mr-1" />
                            {i18n.t('confirmedCreatorsReport.shipped')}
                          </Badge>
                        )}
                      </div>
                      
                      {/* SNS 정보 */}
                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                        {profile?.instagram_url && (
                          <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Instagram className="h-4 w-4 text-pink-500" />
                              <span>Instagram</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* 주소 정보 */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-800">{i18n.t('confirmedCreatorsReport.shippingInfo.shippingAddress')}</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          <p><strong>{i18n.t('common.postalCode')}:</strong> {profile?.postal_code || 'N/A'}</p>
                          <p><strong>{i18n.t('common.address')}:</strong> {`${profile?.prefecture || ''} ${profile?.city || ''} ${profile?.address || ''}`.trim() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTrackingModal(application)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {application.tracking_number ? i18n.t('confirmedCreatorsReport.shippingInfo.editShippingInfo') : i18n.t('confirmedCreatorsReport.shippingInfo.enterTrackingNumber')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {applications.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{i18n.t('confirmedCreatorsReport.noCreators.title')}</h3>
                <p className="text-gray-500">{i18n.t('confirmedCreatorsReport.noCreators.description')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 배송 정보 입력 모달 */}
        <Dialog open={trackingModal} onOpenChange={setTrackingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{i18n.t('confirmedCreatorsReport.shippingInfo.title')}</DialogTitle>
              <DialogDescription>
                {i18n.t('confirmedCreatorsReport.shippingInfo.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tracking">{i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumber')}</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumberPlaceholder')}
                />
                <p className="text-sm text-gray-500">
                  {i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumberHelp')}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setTrackingModal(false)}>
                {i18n.t('common.cancel')}
              </Button>
              <Button 
                onClick={() => handleTrackingUpdate(selectedApplication?.id, trackingNumber)}
                disabled={processing}
              >
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {i18n.t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => navigate('/admin/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {i18n.t('common.back')}
          </Button>
        </div>
        <div className="flex space-x-2">
          <LanguageSelector />
          <Button onClick={exportToExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {i18n.t('common.download')}
          </Button>
        </div>
      </div>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{campaign.title}</CardTitle>
              <CardDescription className="text-lg mt-2 text-purple-600">
                {campaign.brand} - {i18n.t('confirmedCreatorsReport.description')}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(campaign.reward_amount)}
              </div>
              <div className="text-sm text-gray-600">{i18n.t('confirmedCreatorsReport.unitReward')}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm">
                <strong>{i18n.t('confirmedCreatorsReport.confirmedCreators')}:</strong> {applications.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-sm">
                <strong>{i18n.t('confirmedCreatorsReport.shipped')}:</strong> {applications.filter(app => app.tracking_number).length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <span className="text-sm">
                <strong>{i18n.t('confirmedCreatorsReport.notShipped')}:</strong> {applications.filter(app => !app.tracking_number).length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <span className="text-sm">
                <strong>{i18n.t('confirmedCreatorsReport.totalReward')}:</strong> {formatCurrency(applications.length * campaign.reward_amount)}
              </span>
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

      {/* Confirmed Creators List */}
      <div className="grid gap-4">
        {applications.map((application) => {
          const profile = userProfiles[application.user_id]
          
          return (
            <Card key={application.id} className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold">{profile?.name || 'N/A'}</h3>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {i18n.t('confirmedCreatorsReport.confirmed')}
                      </Badge>
                      {application.tracking_number && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Package className="h-3 w-3 mr-1" />
                          {i18n.t('confirmedCreatorsReport.shipped')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* SNS 정보 */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                      {profile?.instagram_url && (
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-4 w-4 text-pink-500" />
                            <span>Instagram</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {profile?.tiktok_url && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-black" />
                            <span>TikTok</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      )}
                      
                      {profile?.youtube_url && (
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Youtube className="h-4 w-4 text-red-500" />
                            <span>YouTube</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 주소 정보 */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">{i18n.t('confirmedCreatorsReport.shippingInfo.shippingAddress')}</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        <p><strong>{i18n.t('common.postalCode')}:</strong> {profile?.postal_code || 'N/A'}</p>
                        <p><strong>{i18n.t('common.address')}:</strong> {`${profile?.prefecture || ''} ${profile?.city || ''} ${profile?.address || ''}`.trim() || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* 배송 정보 */}
                    {application.tracking_number && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">{i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumber')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-700">{application.tracking_number}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                            navigator.clipboard.writeText(application.tracking_number)
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={getJapanPostTrackingUrl(application.tracking_number)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {i18n.t('common.view')}
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTrackingModal(application)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {application.tracking_number ? i18n.t('confirmedCreatorsReport.shippingInfo.editShippingInfo') : i18n.t('confirmedCreatorsReport.shippingInfo.enterTrackingNumber')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">{i18n.t('confirmedCreatorsReport.noCreators.title')}</h3>
              <p className="text-gray-500">{i18n.t('confirmedCreatorsReport.noCreators.description')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 배송 정보 입력 모달 */}
      <Dialog open={trackingModal} onOpenChange={setTrackingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{i18n.t('confirmedCreatorsReport.shippingInfo.title')}</DialogTitle>
            <DialogDescription>
              {i18n.t('confirmedCreatorsReport.shippingInfo.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking">{i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumber')}</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumberPlaceholder')}
              />
              <p className="text-sm text-gray-500">
                {i18n.t('confirmedCreatorsReport.shippingInfo.trackingNumberHelp')}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setTrackingModal(false)}>
              {i18n.t('common.cancel')}
            </Button>
            <Button 
              onClick={() => handleTrackingUpdate(selectedApplication?.id, trackingNumber)}
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {i18n.t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConfirmedCreatorsReport
