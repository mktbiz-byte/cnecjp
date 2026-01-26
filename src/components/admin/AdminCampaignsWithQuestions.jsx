import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { database } from '../../lib/supabase'
import AdminNavigation from './AdminNavigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Users, BarChart3, FileText } from 'lucide-react'

const AdminCampaignsWithQuestions = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const [campaigns, setCampaigns] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('캠페인 및 신청서 데이터 로드 시작')
      
      // 캠페인 데이터 로드
      const campaignData = await database.campaigns.getAll()
      console.log('로드된 캠페인 데이터:', campaignData)
      setCampaigns(campaignData || [])
      
      // 신청서 데이터 로드
      const applicationData = await database.applications.getAll()
      console.log('로드된 신청서 데이터:', applicationData)
      setApplications(applicationData || [])
      
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      setError(`데이터 로드에 실패했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 캠페인 상태 변경
  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      await database.campaigns.update(campaignId, { status: newStatus })
      await loadData() // 데이터 새로고침
      alert(`캠페인 상태가 ${newStatus === 'active' ? '활성' : newStatus === 'completed' ? '완료' : '비활성'}으로 변경되었습니다.`)
    } catch (error) {
      console.error('상태 변경 오류:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  // 캠페인 삭제
  const handleDelete = async (campaignId, campaignTitle) => {
    if (!confirm(`"${campaignTitle}" 캠페인을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      await database.campaigns.delete(campaignId)
      await loadData() // 데이터 새로고침
      alert('캠페인이 삭제되었습니다.')
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('캠페인 삭제에 실패했습니다.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  // 캠페인별 신청자/확정자 수 계산
  const getCampaignStats = (campaignId) => {
    const campaignApplications = applications.filter(app => app.campaign_id === campaignId)
    const totalApplicants = campaignApplications.length
    const confirmedApplicants = campaignApplications.filter(app => app.status === 'approved').length
    
    return {
      totalApplicants,
      confirmedApplicants
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>로딩 중...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 필터링된 캠페인 목록
  const filteredCampaigns = campaigns
    .filter(campaign => {
      // 검색어 필터링
      if (searchTerm && !campaign.brand?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !campaign.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 상태 필터링
      if (activeTab === 'active' && campaign.status !== 'active') {
        return false;
      }
      if (activeTab === 'completed' && campaign.status !== 'completed') {
        return false;
      }
      
      return true;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">캠페인 관리</h1>
              <p className="text-gray-600 mt-2">모든 캠페인을 관리합니다</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                새로고침
              </button>
              <button
                onClick={() => navigate('/campaign-create')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                새 캠페인 작성
              </button>
            </div>
          </div>
        </div>

        {/* 검색 및 필터링 UI */}
        <div className="mb-6">
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="브랜드명 또는 캠페인명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="border-gray-300"
            >
              초기화
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">전체 캠페인</TabsTrigger>
              <TabsTrigger value="active">활성 캠페인</TabsTrigger>
              <TabsTrigger value="completed">완료된 캠페인</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 캠페인 목록 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="flex items-center flex-wrap gap-2">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {campaign.title || '제목 없음'}
                          </p>
                          {/* 캠페인 유형 배지 */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.campaign_type === '4week_challenge' ? 'bg-blue-100 text-blue-800' :
                            campaign.campaign_type === 'megawari' ? 'bg-orange-100 text-orange-800' :
                            campaign.campaign_type === 'oliveyoung' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {campaign.campaign_type === '4week_challenge' ? '🗓️ 4주 챌린지' :
                             campaign.campaign_type === 'megawari' ? '🎯 메가와리' :
                             campaign.campaign_type === 'oliveyoung' ? '🛍️ 올영세일' :
                             '📹 기획형'}
                            {campaign.total_steps > 1 && ` (${campaign.total_steps}스텝)`}
                          </span>
                          {/* 상태 배지 */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {campaign.status === 'active' ? '활성' :
                             campaign.status === 'completed' ? '완료' : '비활성'}
                          </span>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <p>브랜드: {campaign.brand || '-'}</p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <p>보상금: {formatCurrency(campaign.reward_amount)}</p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <p>마감일: {formatDate(campaign.application_deadline)}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-blue-600 font-medium">
                            {(() => {
                              const stats = getCampaignStats(campaign.id)
                              return (
                                <p>
                                  모집인원: {campaign.max_participants || '-'}명 | 
                                  신청자: {stats.totalApplicants}명 | 
                                  확정자: {stats.confirmedApplicants}명
                                </p>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* 상태 변경 드롭다운 */}
                      <select
                        value={campaign.status || 'inactive'}
                        onChange={(e) => handleStatusChange(campaign.id, e.target.value)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">활성</option>
                        <option value="inactive">임시</option>
                        <option value="completed">완료</option>
                        <option value="suspended">중단</option>
                      </select>
                      
                      <button
                        onClick={() => navigate(`/applications-report?campaign=${campaign.id}`)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        신청자 보기
                      </button>
                      <button
                        onClick={() => navigate(`/campaign-create?edit=${campaign.id}`)}
                        className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        수정
                      </button>
                      
                      {/* 보고서 버튼 그룹 */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => window.open(`/company-report/${campaign.id}`, '_blank')}
                          className="inline-flex items-center px-3 py-1 border border-purple-300 shadow-sm text-sm leading-4 font-medium rounded-l-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                          title="기업 보고서"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          기업보고서
                        </button>
                        <button
                          onClick={() => window.open(`/confirmed-creators/${campaign.id}`, '_blank')}
                          className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-sm leading-4 font-medium text-green-700 bg-green-50 hover:bg-green-100"
                          title="확정 크리에이터 보고서"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          확정자
                        </button>
                        <button
                          onClick={() => window.open(`/sns-uploads/${campaign.id}`, '_blank')}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                          title="SNS 업로드 보고서"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          SNS
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleDelete(campaign.id, campaign.title)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            
            {filteredCampaigns.length === 0 && (
              <li>
                <div className="px-4 py-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm || activeTab !== 'all' 
                      ? '검색 조건에 맞는 캠페인이 없습니다.' 
                      : '등록된 캠페인이 없습니다.'}
                  </p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminCampaignsWithQuestions
