import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Loader2, Users, Target, Award, TrendingUp,
  Instagram, Youtube, Hash, Twitter, Calendar,
  DollarSign, ArrowRight, CheckCircle, Menu, X,
  Shield, Star, Clock, Zap, Heart, Home, Search, User
} from 'lucide-react'

const HomePage = () => {
  const { user, signOut } = useAuth()
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalRewards: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [campaignsData, statsData] = await Promise.all([
        database.campaigns.getActive(),
        database.stats.getOverall()
      ])

      setCampaigns(campaignsData || [])
      setStats(statsData || {})
    } catch (error) {
      console.error('Load page data error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate days until deadline
  const getDaysRemaining = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get urgency badge
  const getUrgencyBadge = (deadline) => {
    const days = getDaysRemaining(deadline)
    if (days <= 3 && days > 0) {
      return (
        <Badge className="bg-red-500 text-white animate-pulse">
          <Clock className="w-3 h-3 mr-1" />
          {language === 'ko' ? `${days}일 남음` : `残り${days}日`}
        </Badge>
      )
    } else if (days <= 7 && days > 0) {
      return (
        <Badge className="bg-orange-500 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {language === 'ko' ? `${days}일 남음` : `残り${days}日`}
        </Badge>
      )
    }
    return null
  }

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign)
    setDetailModal(true)
  }

  const handleApply = (campaignId) => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(`/campaign-application?campaign_id=${campaignId}`)
  }

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'tiktok': return <Hash className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getPlatformBadge = (platform) => {
    const platformStyles = {
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-purple-100 text-purple-800',
      youtube: 'bg-red-100 text-red-800',
      twitter: 'bg-blue-100 text-blue-800'
    }
    return (
      <Badge key={platform} variant="secondary" className={platformStyles[platform?.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
        {getPlatformIcon(platform)}
        <span className="ml-1 capitalize">{platform}</span>
      </Badge>
    )
  }

  const getActivePlatforms = (campaign) => {
    if (campaign.platforms && Array.isArray(campaign.platforms)) {
      return campaign.platforms
    }
    if (campaign.target_platforms && typeof campaign.target_platforms === 'object') {
      const platforms = []
      if (campaign.target_platforms.instagram) platforms.push('instagram')
      if (campaign.target_platforms.tiktok) platforms.push('tiktok')
      if (campaign.target_platforms.youtube) platforms.push('youtube')
      return platforms.length > 0 ? platforms : ['instagram']
    }
    return ['instagram']
  }

  // Testimonials data (Japanese localized)
  const testimonials = [
    {
      name: "Sakura M.",
      role: language === 'ko' ? '뷰티 크리에이터' : 'ビューティークリエイター',
      followers: "125K",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      text: language === 'ko'
        ? 'CNEC 덕분에 제 커리어가 바뀌었어요! 3개월 만에 10개 이상의 K-Beauty 브랜드와 협업했습니다.'
        : 'CNECのおかげでキャリアが変わりました！3ヶ月で10以上のK-Beautyブランドとコラボしました。',
      rating: 5
    },
    {
      name: "Yuki C.",
      role: language === 'ko' ? '스킨케어 인플루언서' : 'スキンケアインフルエンサー',
      followers: "89K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      text: language === 'ko'
        ? 'K-Beauty 콜라보레이션을 위한 최고의 플랫폼. 빠른 결제, 좋은 브랜드, 훌륭한 지원팀!'
        : 'K-Beautyコラボのための最高のプラットフォーム。迅速な支払い、素晴らしいブランド、充実したサポート！',
      rating: 5
    },
    {
      name: "Hana L.",
      role: language === 'ko' ? 'TikTok 크리에이터' : 'TikTokクリエイター',
      followers: "250K",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      text: language === 'ko'
        ? '드디어 숏폼 콘텐츠를 이해하는 플랫폼! 은행 송금도 정말 편리해요.'
        : 'ついにショート動画を理解してくれるプラットフォーム！銀行振込も本当に便利です。',
      rating: 5
    }
  ]

  // Partner brands
  const partnerBrands = [
    "COSRX", "innisfree", "Laneige", "ETUDE", "Missha", "Some By Mi", "Torriden", "Anua"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎬</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">CNEC Japan</h1>
                <p className="text-xs text-gray-600">K-Beauty × {language === 'ko' ? '숏폼' : 'ショート動画'}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#campaigns" className="text-gray-600 hover:text-purple-600 transition-colors">
                {language === 'ko' ? '캠페인' : 'キャンペーン'}
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">
                {language === 'ko' ? '이용방법' : '使い方'}
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">
                {language === 'ko' ? '후기' : 'レビュー'}
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <Link to="/mypage">
                    <Button variant="outline" size="sm">
                      {language === 'ko' ? '마이페이지' : 'マイページ'}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    {language === 'ko' ? '로그아웃' : 'ログアウト'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      {language === 'ko' ? '로그인' : 'ログイン'}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      {language === 'ko' ? '회원가입' : '新規登録'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <a href="#campaigns" className="text-gray-600 hover:text-purple-600 py-2">
                  {language === 'ko' ? '캠페인' : 'キャンペーン'}
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 py-2">
                  {language === 'ko' ? '이용방법' : '使い方'}
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-purple-600 py-2">
                  {language === 'ko' ? '후기' : 'レビュー'}
                </a>
                {user ? (
                  <>
                    <Link to="/mypage">
                      <Button variant="outline" className="w-full justify-start">
                        {language === 'ko' ? '마이페이지' : 'マイページ'}
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                      {language === 'ko' ? '로그아웃' : 'ログアウト'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="w-full justify-start">
                        {language === 'ko' ? '로그인' : 'ログイン'}
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                        {language === 'ko' ? '회원가입' : '新規登録'}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="py-12 md:py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center bg-white/95 rounded-full px-5 py-2.5 shadow-lg mb-6">
            <div className="flex -space-x-2 mr-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white" />
              ))}
            </div>
            <span className="text-sm md:text-base font-medium text-gray-700">
              <span className="text-purple-600 font-bold">2,500+</span> {language === 'ko' ? '크리에이터' : 'クリエイター'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            K-Beauty × <br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {language === 'ko' ? '숏폼 콜라보' : 'ショート動画コラボ'}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
            {language === 'ko'
              ? '한국 코스메틱 브랜드와 협업하고 은행 송금으로 보상받으세요'
              : '韓国コスメブランドとコラボして銀行振込で報酬を受け取ろう'
            }
          </p>

          {/* Trust Badges - Inline */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            <div className="flex items-center text-xs sm:text-sm text-gray-600 bg-white/90 rounded-full px-4 py-2 shadow-sm">
              <Shield className="h-4 w-4 text-green-600 mr-1.5" />
              {language === 'ko' ? '안전' : '安全'}
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 bg-white/90 rounded-full px-4 py-2 shadow-sm">
              <Zap className="h-4 w-4 text-yellow-600 mr-1.5" />
              {language === 'ko' ? '빠른 승인' : '迅速承認'}
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 bg-white/90 rounded-full px-4 py-2 shadow-sm">
              <DollarSign className="h-4 w-4 text-green-600 mr-1.5" />
              {language === 'ko' ? '은행 송금' : '銀行振込'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-8 py-6 text-base sm:text-lg">
                {language === 'ko' ? '수익 시작하기' : '収益を始める'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campaigns Section - Mobile Optimized */}
      <section id="campaigns" className="py-10 md:py-12 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                {language === 'ko' ? '모집 중인 캠페인' : '募集中のキャンペーン'}
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                {language === 'ko' ? 'K-Beauty 캠페인에 지원하세요' : 'K-Beautyキャンペーンに応募しよう'}
              </p>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-300 px-3 py-1.5 text-sm font-medium self-start sm:self-auto">
              {campaigns.filter((c) => {
                const deadline = c.application_deadline || c.deadline || c.end_date
                if (!deadline) return true
                return new Date(deadline) >= new Date()
              }).length} {language === 'ko' ? '개 오픈' : '件オープン'}
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">{t('loading')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-400 text-4xl mb-2">⚠️</div>
              <p className="text-sm text-red-600 mb-2">{t('loadingFailed')}</p>
              <Button onClick={loadPageData} variant="outline" size="sm">
                {language === 'ko' ? '다시 시도' : '再試行'}
              </Button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-sm text-gray-600">
                {language === 'ko' ? '현재 모집 중인 캠페인이 없습니다' : '現在募集中のキャンペーンはありません'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {campaigns.filter((campaign) => {
                // Filter out campaigns past their deadline
                const deadline = campaign.application_deadline || campaign.deadline || campaign.end_date
                if (!deadline) return true
                return new Date(deadline) >= new Date()
              }).map((campaign) => (
                <Card
                  key={campaign.id}
                  className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-0 shadow-lg cursor-pointer overflow-hidden group bg-white"
                  onClick={() => handleCampaignClick(campaign)}
                >
                  {/* Image with better aspect ratio for mobile */}
                  <div className="relative">
                    {campaign.image_url ? (
                      <div className="w-full aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] sm:aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-5xl">✨</span>
                      </div>
                    )}

                    {/* Urgency Badge - Top Left */}
                    <div className="absolute top-3 left-3">
                      {getUrgencyBadge(campaign.application_deadline || campaign.deadline || campaign.end_date)}
                    </div>

                    {/* Reward Badge - Top Right */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-purple-600 text-white text-sm font-bold px-3 py-1">
                        {formatCurrency(campaign.reward_amount)}
                      </Badge>
                    </div>
                  </div>

                  {/* Content with better readability */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                        <Zap className="w-3 h-3 mr-1" />
                        {language === 'ko' ? '모집중' : '募集中'}
                      </Badge>
                      <span className="text-sm text-purple-600 font-semibold truncate">{campaign.brand}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-2 mb-3 leading-snug">
                      {campaign.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 hidden sm:block">
                      {campaign.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex gap-1.5">
                        {getActivePlatforms(campaign).slice(0, 3).map((platform) => (
                          <span key={platform} className="text-gray-500">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <Users className="w-4 h-4 mr-1" />
                        {campaign.max_participants || 10}{language === 'ko' ? '명' : '名'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* View All Button */}
          {campaigns.length > 0 && (
            <div className="text-center mt-6">
              <Link to="/signup">
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  {language === 'ko' ? '가입하고 지원하기' : '登録して応募する'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Partner Brands Section - Mobile Optimized */}
      <section className="py-8 bg-white/50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-5 font-medium">
            {language === 'ko' ? '톱 K-BEAUTY 브랜드들의 신뢰' : 'トップK-BEAUTYブランドに信頼されています'}
          </p>
          <div className="flex overflow-x-auto md:flex-wrap md:justify-center items-center gap-6 md:gap-8 pb-2 md:pb-0 -mx-4 px-4 md:mx-0">
            {partnerBrands.map((brand) => (
              <span key={brand} className="text-base md:text-lg font-bold text-gray-400 hover:text-purple-600 transition-colors whitespace-nowrap flex-shrink-0">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Mobile Optimized */}
      <section className="py-12 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {language === 'ko' ? '실적' : '実績'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="py-6 px-4">
                <div className="text-2xl md:text-3xl font-bold mb-1">{stats.totalCampaigns || '50'}+</div>
                <div className="text-purple-100 text-sm font-medium">{language === 'ko' ? '캠페인' : 'キャンペーン'}</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="py-6 px-4">
                <div className="text-2xl md:text-3xl font-bold mb-1">{stats.totalUsers || '2.5'}K</div>
                <div className="text-blue-100 text-sm font-medium">{language === 'ko' ? '크리에이터' : 'クリエイター'}</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="py-6 px-4">
                <div className="text-2xl md:text-3xl font-bold mb-1">{stats.totalApplications || '10'}K</div>
                <div className="text-green-100 text-sm font-medium">{language === 'ko' ? '콜라보' : 'コラボ'}</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="py-6 px-4">
                <div className="text-2xl md:text-3xl font-bold mb-1">¥50M</div>
                <div className="text-orange-100 text-sm font-medium">{language === 'ko' ? '지급 완료' : '支払済み'}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact */}
      <section id="how-it-works" className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {language === 'ko' ? '이용 방법' : '使い方'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'ko' ? '4단계로 수익 시작하기' : '4ステップで収益をスタート'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { step: 1, icon: "📝", title: language === 'ko' ? '가입' : '登録', desc: language === 'ko' ? '무료 계정 생성' : '無料アカウント作成' },
              { step: 2, icon: "🎯", title: language === 'ko' ? '지원' : '応募', desc: language === 'ko' ? '캠페인 선택' : 'キャンペーンを選ぶ' },
              { step: 3, icon: "📱", title: language === 'ko' ? '제작' : '制作', desc: language === 'ko' ? '콘텐츠 만들기' : 'コンテンツ作成' },
              { step: 4, icon: "💰", title: language === 'ko' ? '수익' : '報酬', desc: language === 'ko' ? '은행 송금' : '銀行振込' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-600 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Mobile Optimized */}
      <section id="testimonials" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {language === 'ko' ? '크리에이터들의 사랑' : 'クリエイターに愛されています'}
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              {language === 'ko' ? '커뮤니티의 목소리를 들어보세요' : 'コミュニティの声をご覧ください'}
            </p>
          </div>

          {/* Mobile: Horizontal scroll, Desktop: Grid */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 snap-x snap-mandatory">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-auto snap-center">
                <CardContent className="p-5 md:pt-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-purple-100"
                    />
                    <div>
                      <div className="font-bold text-gray-800">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                      <div className="text-xs text-purple-600 font-medium">{testimonial.followers} followers</div>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile scroll indicator */}
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {testimonials.map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-purple-200" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {language === 'ko' ? '수익을 시작할 준비가 되셨나요?' : '収益をスタートする準備はできましたか？'}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            {language === 'ko'
              ? '이미 수천 명의 크리에이터들이 K-Beauty 브랜드와 협업하고 있습니다'
              : '既に数千人のクリエイターがK-Beautyブランドとコラボしています'
            }
          </p>
          <Link to="/signup" className="block sm:inline-block">
            <Button size="lg" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 text-base sm:text-lg px-8 py-6">
              {language === 'ko' ? '무료 계정 만들기' : '無料アカウント作成'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl">🎬</div>
                <div className="text-xl font-bold">CNEC Japan</div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {language === 'ko'
                  ? 'K-Beauty 브랜드와 크리에이터를 연결하는 선도적인 플랫폼'
                  : 'K-Beautyブランドとクリエイターを繋ぐリーディングプラットフォーム'
                }
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {language === 'ko' ? '크리에이터' : 'クリエイター向け'}
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#campaigns" className="hover:text-white transition-colors">
                  {language === 'ko' ? '캠페인 보기' : 'キャンペーンを見る'}
                </a></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">
                  {language === 'ko' ? '크리에이터 가입' : 'クリエイター登録'}
                </Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">
                  {language === 'ko' ? '이용방법' : '使い方'}
                </a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {language === 'ko' ? '지원' : 'サポート'}
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">
                  {language === 'ko' ? '자주 묻는 질문' : 'よくある質問'}
                </a></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">
                  {language === 'ko' ? '이용약관' : '利用規約'}
                </Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">
                  {language === 'ko' ? '개인정보처리방침' : 'プライバシーポリシー'}
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {language === 'ko' ? '문의' : 'お問い合わせ'}
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: mkt_biz@cnec.co.kr</li>
                <li>Tokyo, Japan</li>
              </ul>
              <div className="mt-4 flex items-center text-sm text-gray-400">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                SSL Secured
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2025 CNEC Japan. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              {language === 'ko' ? 'K-Beauty 크리에이터를 위해 ❤️로 제작' : 'K-Beautyクリエイターのために❤️で作られました'}
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          <a href="#" className="flex flex-col items-center py-2 px-4 text-purple-600">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">{language === 'ko' ? '홈' : 'ホーム'}</span>
          </a>
          <a href="#campaigns" className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-purple-600">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">{language === 'ko' ? '캠페인' : 'キャンペーン'}</span>
          </a>
          <Link to={user ? "/mypage" : "/login"} className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-purple-600">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">{user ? (language === 'ko' ? '마이' : 'マイ') : (language === 'ko' ? '로그인' : 'ログイン')}</span>
          </Link>
        </div>
      </nav>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Dialog open={detailModal} onOpenChange={setDetailModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCampaign.title}</DialogTitle>
              <DialogDescription className="text-purple-600 font-medium">
                {selectedCampaign.brand}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {selectedCampaign.image_url && (
                <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-100">
                  <img src={selectedCampaign.image_url} alt={selectedCampaign.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{language === 'ko' ? '보상' : '報酬'}</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(selectedCampaign.reward_amount)}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{language === 'ko' ? '모집 인원' : '募集人数'}</div>
                  <div className="text-2xl font-bold text-blue-700">{selectedCampaign.max_participants || 'Open'}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  {language === 'ko' ? '캠페인 설명' : 'キャンペーン説明'}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.description}</p>
              </div>

              {selectedCampaign.requirements && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    {language === 'ko' ? '요구사항' : '要件'}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.requirements}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {getActivePlatforms(selectedCampaign).map((platform) => (
                  <span key={platform}>{getPlatformBadge(platform)}</span>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {language === 'ko' ? '신청 마감: ' : '応募締切: '}
                {formatDate(selectedCampaign.application_deadline || selectedCampaign.deadline || selectedCampaign.end_date)}
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                onClick={() => { setDetailModal(false); handleApply(selectedCampaign.id) }}
              >
                {language === 'ko' ? '이 캠페인에 지원하기' : 'このキャンペーンに応募する'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default HomePage
