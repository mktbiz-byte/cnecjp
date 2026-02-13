import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Loader2, Play, Users, Target, Shield,
  Instagram, Youtube, Hash, Twitter, ExternalLink,
  Star, Award, Calendar, DollarSign, Eye, ArrowRight,
  CheckCircle, Clock, MapPin, Phone, Mail, User, Zap,
  Menu, X, TrendingUp, Wallet, FileText, AlertCircle, Sparkles
} from 'lucide-react'
import LineRegistrationBanner from './LineRegistrationBanner'
import HolidayNoticePopup from './HolidayNoticePopup'

const HomePageJP = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalCreators: 0,
    totalApplications: 0,
    totalRewards: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false)
  const [showProfileRequiredModal, setShowProfileRequiredModal] = useState(false)

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    try {
      setLoading(true)
      const tasks = [loadCampaigns(), loadStats()]
      if (user) tasks.push(loadUserProfile())
      await Promise.all(tasks)
    } catch (error) {
      console.error('Page data load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async () => {
    try {
      const profileData = await database.userProfiles.get(user.id)
      setUserProfile(profileData)
      // バナー表示状態の復元（セッション中は非表示にできる）
      const dismissed = sessionStorage.getItem('profile_banner_dismissed')
      if (dismissed === 'true') setProfileBannerDismissed(true)
    } catch (err) {
      console.error('Load user profile error:', err)
    }
  }

  // プロフィール必須項目チェック（ニックネーム・電話番号・名前が最低限必要）
  const isProfileComplete = userProfile &&
    userProfile.nickname?.trim() &&
    userProfile.phone?.trim() &&
    userProfile.name?.trim()

  const loadCampaigns = async () => {
    try {
      const campaignsData = await database.campaigns.getAll()
      const activeCampaigns = campaignsData?.filter(campaign => campaign.status === 'active') || []
      setCampaigns(activeCampaigns)
    } catch (error) {
      console.error('Load campaigns error:', error)
      setCampaigns([])
    }
  }

  const loadStats = async () => {
    try {
      const [campaignsData, applicationsData, usersData] = await Promise.all([
        database.campaigns.getAll(),
        database.applications.getAll(),
        database.userProfiles.getAll()
      ])

      const allCampaigns = campaignsData || []
      const applications = applicationsData || []
      const users = usersData || []

      setStats({
        totalCampaigns: allCampaigns.length,
        totalCreators: users.length,
        totalApplications: applications.length,
        totalRewards: allCampaigns.reduce((sum, campaign) => sum + (campaign.reward_amount || 0), 0)
      })
    } catch (error) {
      console.error('Load stats error:', error)
      setStats({
        totalCampaigns: 0,
        totalCreators: 800,
        totalApplications: 0,
        totalRewards: 0
      })
    }
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
    // プロフィール未設定の場合は応募不可
    if (!isProfileComplete) {
      setShowProfileRequiredModal(true)
      return
    }
    navigate(`/campaign-application?campaign_id=${campaignId}`)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'tiktok':
        return <Hash className="h-4 w-4" />
      case 'youtube':
        return <Youtube className="h-4 w-4" />
      case 'twitter':
        return <Twitter className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'tiktok':
        return 'bg-black text-white'
      case 'youtube':
        return 'bg-red-600 text-white'
      case 'twitter':
        return 'bg-blue-400 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getActivePlatforms = (targetPlatforms) => {
    if (!targetPlatforms) return ['instagram']
    const platforms = []
    if (targetPlatforms.instagram) platforms.push('instagram')
    if (targetPlatforms.tiktok) platforms.push('tiktok')
    if (targetPlatforms.youtube) platforms.push('youtube')
    return platforms.length > 0 ? platforms : ['instagram']
  }

  // Campaign filtering helpers for tabs
  const filterValidCampaigns = (campaignList) => {
    return campaignList.filter(campaign => {
      const deadline = campaign.application_deadline
      if (!deadline) return true
      const deadlineDate = new Date(deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return deadlineDate >= today
    })
  }

  const getCampaignsByType = (type) => {
    const valid = filterValidCampaigns(campaigns)
    if (type === 'all') {
      return valid
    }
    if (type === 'regular') {
      return valid.filter(c => !c.campaign_type || c.campaign_type === 'regular' || c.campaign_type === 'oliveyoung')
    }
    if (type === 'megawari') {
      return valid.filter(c => c.campaign_type === 'megawari')
    }
    if (type === '4week_challenge') {
      return valid.filter(c => c.campaign_type === '4week_challenge')
    }
    return valid
  }

  const renderCampaignCard = (campaign) => (
    <div
      key={campaign.id}
      className="group bg-white rounded-[24px] border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => handleCampaignClick(campaign)}
    >
      {campaign.image_url && (
        <div className="w-full h-36 sm:h-52 overflow-hidden bg-slate-50">
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-1.5 flex-wrap">
            {getActivePlatforms(campaign.target_platforms).map((platform) => (
              <span key={platform} className={`${getPlatformColor(platform)} flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium`}>
                <span className="flex items-center">{getPlatformIcon(platform)}</span>
                <span className="capitalize hidden sm:inline">{platform}</span>
              </span>
            ))}
          </div>
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold inline-flex items-center">
            <DollarSign className="h-3 w-3 mr-0.5" />
            {formatCurrency(campaign.reward_amount)}
          </span>
        </div>
        <h3 className="text-sm sm:text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-1.5">{campaign.title}</h3>
        <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 hidden sm:block mb-4">{campaign.description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs sm:text-sm text-slate-400">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0 text-slate-300" />
            <span className="truncate">締切: {formatDate(campaign.application_deadline)}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-slate-400">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0 text-slate-300" />
            {campaign.max_participants || campaign.total_slots} 名募集
          </div>
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-full transition-colors shadow-lg shadow-blue-600/20"
          onClick={(e) => {
            e.stopPropagation()
            handleApply(campaign.id)
          }}
        >
          今すぐ応募
        </button>
      </div>
    </div>
  )

  const renderCampaignGrid = (campaignList) => {
    if (campaignList.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-400 text-lg">現在募集中のキャンペーンはありません</p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
        {campaignList.map(renderCampaignCard)}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ========== Header ========== */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-[12px] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/25">C</div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">CNEC Japan</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 tracking-wide">K-Beauty Creator Network</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-2">
              <a href="#campaigns" className="text-slate-500 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-all text-sm">キャンペーン</a>
              <a href="#how-it-works" className="text-slate-500 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-all text-sm">参加方法</a>
              <Link to="/guide" className="text-slate-500 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-all text-sm">ガイド</Link>
              {user ? (
                <>
                  <Button variant="ghost" className="text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50" asChild>
                    <Link to="/mypage">マイページ</Link>
                  </Button>
                  <Button variant="ghost" className="text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50" onClick={signOut}>ログアウト</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-slate-500 hover:text-blue-600 rounded-full hover:bg-blue-50" asChild>
                    <Link to="/login">ログイン</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl" asChild>
                    <Link to="/signup">今すぐ登録</Link>
                  </Button>
                </>
              )}
            </nav>

            <button
              className="md:hidden p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-100">
              <div className="flex flex-col space-y-1 pt-4">
                <a href="#campaigns" className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all">キャンペーン</a>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all">参加方法</a>
                <Link to="/guide" className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all">キャンペーンガイド</Link>
                {user ? (
                  <>
                    <Link to="/mypage" className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all">マイページ</Link>
                    <button onClick={signOut} className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all text-left">ログアウト</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all">ログイン</Link>
                    <Link to="/signup" className="bg-blue-600 text-white font-semibold py-3 px-4 rounded-full text-center hover:bg-blue-700 transition-all mt-2">今すぐ登録</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========== プロフィール未設定バナー ========== */}
      {user && !isProfileComplete && !profileBannerDismissed && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 sm:py-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                  プロフィールを設定して、キャンペーンに応募しましょう！
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  プロフィールを完成させると<span className="text-amber-700 font-semibold">キャンペーンへの応募が可能</span>になり、
                  <span className="text-amber-700 font-semibold">企業からの採用率がアップ</span>します。
                  ニックネーム・電話番号・名前を入力するだけで応募スタートできます。
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Link
                    to="/profile-beauty"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-lg shadow-amber-500/20"
                  >
                    <User className="w-3.5 h-3.5" />
                    プロフィールを設定する
                  </Link>
                  <button
                    onClick={() => {
                      setProfileBannerDismissed(true)
                      sessionStorage.setItem('profile_banner_dismissed', 'true')
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 transition-colors"
                  >
                    後で設定する
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setProfileBannerDismissed(true)
                  sessionStorage.setItem('profile_banner_dismissed', 'true')
                }}
                className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Hero Section ========== */}
      <section className="relative py-12 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative">
          <div className="inline-flex mb-5 sm:mb-8">
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              週払い対応・手数料無料・安心のサポート
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-slate-900 mb-5 sm:mb-8 leading-[1.15] tracking-tight">
            K-Beauty クリエイターとして
            <br />
            <span className="text-blue-600">収益を得よう</span>
          </h2>

          <p className="text-sm sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            韓国コスメブランドのショート動画を制作し、毎週報酬を受け取れます。
            <br className="hidden sm:block" />
            遅延なし、面倒なし、透明な報酬システム。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-20 px-4 sm:px-0">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-8 sm:px-10 py-6 rounded-full shadow-xl shadow-blue-600/25 transition-all hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              asChild
            >
              <Link to="/signup">
                今すぐ登録する
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 text-base sm:text-lg px-8 sm:px-10 py-6 rounded-full transition-all hover:-translate-y-0.5"
            >
              <a href="#how-it-works" className="flex items-center">
                参加方法を見る
              </a>
            </Button>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 md:p-7 shadow-xl shadow-slate-200/40 border border-slate-100/80">
              <div className="text-xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                {stats.totalCreators}+
              </div>
              <div className="text-[10px] sm:text-sm text-slate-400 font-medium">登録クリエイター</div>
            </div>
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 md:p-7 shadow-xl shadow-slate-200/40 border border-slate-100/80 overflow-hidden">
              <div className="text-lg sm:text-2xl md:text-4xl font-bold text-emerald-500 mb-1 truncate">
                {formatCurrency(stats.totalRewards)}
              </div>
              <div className="text-[10px] sm:text-sm text-slate-400 font-medium">総支払額</div>
            </div>
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 md:p-7 shadow-xl shadow-slate-200/40 border border-slate-100/80">
              <div className="text-xl sm:text-3xl md:text-4xl font-bold text-violet-500 mb-1">
                {stats.totalCampaigns}+
              </div>
              <div className="text-[10px] sm:text-sm text-slate-400 font-medium">実施キャンペーン</div>
            </div>
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 md:p-7 shadow-xl shadow-slate-200/40 border border-slate-100/80">
              <div className="text-xl sm:text-3xl md:text-4xl font-bold text-amber-500 mb-1">
                4.8★
              </div>
              <div className="text-[10px] sm:text-sm text-slate-400 font-medium">クリエイター評価</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== How It Works ========== */}
      <section id="how-it-works" className="py-14 sm:py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium inline-block mb-4">HOW IT WORKS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              参加方法
            </h2>
            <p className="text-base md:text-lg text-slate-400">
              4つの簡単なステップで収益化を開始
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-[24px] p-6 md:p-8 text-center shadow-lg shadow-slate-100/50 border border-slate-100/80 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Target className="h-7 w-7 text-blue-600" />
              </div>
              <div className="text-xs font-bold text-blue-600 mb-2 tracking-widest">STEP 1</div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">応募</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                興味のあるキャンペーンを選んで応募
              </p>
            </div>

            <div className="bg-white rounded-[24px] p-6 md:p-8 text-center shadow-lg shadow-slate-100/50 border border-slate-100/80 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Play className="h-7 w-7 text-violet-600" />
              </div>
              <div className="text-xs font-bold text-violet-600 mb-2 tracking-widest">STEP 2</div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">制作</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                ガイドラインに沿ってショート動画を制作
              </p>
            </div>

            <div className="bg-white rounded-[24px] p-6 md:p-8 text-center shadow-lg shadow-slate-100/50 border border-slate-100/80 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="h-7 w-7 text-pink-600" />
              </div>
              <div className="text-xs font-bold text-pink-600 mb-2 tracking-widest">STEP 3</div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">投稿</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                SNSに投稿して証明を提出
              </p>
            </div>

            <div className="bg-white rounded-[24px] p-6 md:p-8 text-center shadow-lg shadow-slate-100/50 border border-slate-100/80 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Wallet className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-emerald-600 mb-2 tracking-widest">STEP 4</div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">受取</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                毎週報酬を銀行口座で受取
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Active Campaigns with Tabs ========== */}
      <section id="campaigns" className="py-14 sm:py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <span className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium inline-block mb-4">CAMPAIGNS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              募集中のキャンペーン
            </h2>
            <p className="text-base md:text-lg text-slate-400">
              K-Beautyブランドの最新キャンペーンで収益化を開始
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <span className="text-slate-400 text-sm">キャンペーンを読み込み中...</span>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center mb-8 sm:mb-10 overflow-x-auto scrollbar-hide px-1">
                <TabsList className="bg-slate-100 rounded-full p-1 sm:p-1.5 h-auto inline-flex">
                  <TabsTrigger value="all" className="rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-slate-400 transition-all">
                    全体
                  </TabsTrigger>
                  <TabsTrigger value="regular" className="rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-slate-400 transition-all">
                    企画型
                  </TabsTrigger>
                  <TabsTrigger value="megawari" className="rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-slate-400 transition-all">
                    メガ割り
                  </TabsTrigger>
                  <TabsTrigger value="4week_challenge" className="rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md text-slate-400 transition-all">
                    4週チャレンジ
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all">
                {renderCampaignGrid(getCampaignsByType('all'))}
              </TabsContent>
              <TabsContent value="regular">
                {renderCampaignGrid(getCampaignsByType('regular'))}
              </TabsContent>
              <TabsContent value="megawari">
                {renderCampaignGrid(getCampaignsByType('megawari'))}
              </TabsContent>
              <TabsContent value="4week_challenge">
                {renderCampaignGrid(getCampaignsByType('4week_challenge'))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* ========== Weekly Payment Section ========== */}
      <section className="py-14 sm:py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium inline-block mb-6">
                  安心の週払いシステム
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                  毎週安定した
                  <br />
                  収入を実現
                </h2>
                <p className="text-base md:text-lg text-slate-400 mb-10 leading-relaxed">
                  毎週定期的に報酬を受け取れます。数ヶ月待つ必要はありません。
                  隠れた手数料なし、中間業者なし。
                </p>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 mb-0.5">銀行振込対応</div>
                      <div className="text-sm text-slate-400">日本の銀行口座に直接振込</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 mb-0.5">透明な追跡</div>
                      <div className="text-sm text-slate-400">リアルタイムで収益を確認</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 mb-0.5">最低出金額なし</div>
                      <div className="text-sm text-slate-400">金額に関係なく出金可能</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6 md:p-10">
                <div className="text-center mb-8">
                  <div className="text-sm text-slate-400 font-medium mb-2">月間平均収入</div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-900">
                    ¥50,000 - ¥200,000
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">1</span>
                      </div>
                      <span className="text-slate-600 font-medium">第1週</span>
                    </div>
                    <span className="font-bold text-slate-800">¥35,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                        <span className="text-violet-600 text-xs font-bold">2</span>
                      </div>
                      <span className="text-slate-600 font-medium">第2週</span>
                    </div>
                    <span className="font-bold text-slate-800">¥42,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-pink-600 text-xs font-bold">3</span>
                      </div>
                      <span className="text-slate-600 font-medium">第3週</span>
                    </div>
                    <span className="font-bold text-slate-800">¥38,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-xs font-bold">4</span>
                      </div>
                      <span className="text-slate-600 font-medium">第4週</span>
                    </div>
                    <span className="font-bold text-slate-800">¥45,000</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">月合計</span>
                  <span className="text-2xl font-bold text-blue-600">¥160,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Final CTA ========== */}
      <section className="py-14 sm:py-20 md:py-28 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            今すぐ収益化を開始しませんか？
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            800名以上のクリエイターが既にK-Beautyブランドとの
            コラボレーションで収入を得ています
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-10 py-6 rounded-full shadow-xl shadow-blue-900/30 transition-all hover:shadow-2xl hover:-translate-y-0.5 font-semibold"
            asChild
          >
            <Link to="/signup">
              無料アカウント作成
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ========== Campaign Detail Modal ========== */}
      <Dialog open={detailModal} onOpenChange={setDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] border-slate-100 p-0">
          {selectedCampaign && (
            <div>
              {selectedCampaign.image_url && (
                <div className="w-full h-48 md:h-72 overflow-hidden bg-slate-50">
                  <img
                    src={selectedCampaign.image_url}
                    alt={selectedCampaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                <DialogHeader className="mb-6">
                  <div className="flex gap-2 mb-3">
                    {getActivePlatforms(selectedCampaign.target_platforms).map((platform) => (
                      <span key={platform} className={`${getPlatformColor(platform)} flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium`}>
                        {getPlatformIcon(platform)}
                        <span className="capitalize">{platform}</span>
                      </span>
                    ))}
                  </div>
                  <DialogTitle className="text-xl md:text-2xl font-bold text-slate-800">{selectedCampaign.title}</DialogTitle>
                  <DialogDescription className="sr-only">キャンペーン詳細情報</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-base text-slate-700 mb-2">キャンペーン詳細</h3>
                    <p className="text-slate-500 leading-relaxed">{selectedCampaign.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs text-slate-400">報酬</span>
                      </div>
                      <div className="font-bold text-slate-800">{formatCurrency(selectedCampaign.reward_amount)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-slate-400">締切</span>
                      </div>
                      <div className="font-bold text-slate-800">{formatDate(selectedCampaign.application_deadline)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-violet-500" />
                        <span className="text-xs text-slate-400">募集人数</span>
                      </div>
                      <div className="font-bold text-slate-800">{selectedCampaign.max_participants || selectedCampaign.total_slots} 名</div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-slate-400">カテゴリー</span>
                      </div>
                      <div className="font-bold text-slate-800">{selectedCampaign.category}</div>
                    </div>
                  </div>

                  {selectedCampaign.requirements && (
                    <div>
                      <h3 className="font-semibold text-base text-slate-700 mb-2">応募条件</h3>
                      <p className="text-slate-500 whitespace-pre-line leading-relaxed">{selectedCampaign.requirements}</p>
                    </div>
                  )}

                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-full transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl text-base"
                    onClick={() => {
                      setDetailModal(false)
                      handleApply(selectedCampaign.id)
                    }}
                  >
                    このキャンペーンに応募
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========== Footer ========== */}
      <footer className="bg-slate-900 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-4 gap-10 md:gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-[12px] flex items-center justify-center text-white font-bold text-lg">C</div>
                <h3 className="text-xl font-bold">CNEC Japan</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                K-Beautyブランドとクリエイターを繋ぐ
                専門プラットフォーム
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-slate-200">サービス</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#campaigns" className="hover:text-white transition-colors">キャンペーン</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">参加方法</a></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">新規登録</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-slate-200">サポート</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/guide" className="hover:text-white transition-colors">キャンペーンガイド</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">よくある質問</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-slate-200">フォロー</h4>
              <div className="flex space-x-3">
                <a href="https://www.youtube.com/@CNEC_JP" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          {/* 特定商取引法に基づく表記 / Company Information */}
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="mb-6">
              <h4 className="font-semibold text-slate-300 text-sm mb-4">運営会社情報</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-500">
                <div className="flex"><span className="text-slate-400 w-32 flex-shrink-0">会社名</span><span>株式会社ハウパパ（CNEC）</span></div>
                <div className="flex"><span className="text-slate-400 w-32 flex-shrink-0">代表者</span><span>パク・ヒョンヨン</span></div>
                <div className="flex"><span className="text-slate-400 w-32 flex-shrink-0">事業者登録番号</span><span>575-81-02253</span></div>
                <div className="flex"><span className="text-slate-400 w-32 flex-shrink-0">通信販売業届出番号</span><span>2022-ソウルマポ-3903号</span></div>
                <div className="flex sm:col-span-2"><span className="text-slate-400 w-32 flex-shrink-0">所在地</span><span>ソウル市 中区 退渓路36ギル2 東国大学 忠武路映像センター1009号</span></div>
                <div className="flex"><span className="text-slate-400 w-32 flex-shrink-0">メール</span><span>howpapa@howpapa.co.kr</span></div>
              </div>
            </div>
            <div className="text-center text-sm text-slate-500">
              <p>&copy; 2025 CNEC Japan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ========== プロフィール必須モーダル ========== */}
      <Dialog open={showProfileRequiredModal} onOpenChange={setShowProfileRequiredModal}>
        <DialogContent className="sm:max-w-md mx-4 rounded-[24px] p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8">
            <DialogHeader className="mb-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800 text-center">
                プロフィール設定が必要です
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 text-center mt-2">
                キャンペーンに応募するには、まずプロフィールを設定してください。
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3">プロフィール設定のメリット</h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600">キャンペーンへの<b>応募が可能</b>になります</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600">企業からの<b>採用率が大幅アップ</b></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600"><b>ニックネーム</b>で表示されるため実名は安心保護</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600">ビューティープロフィールで<b>ぴったりのキャンペーン</b>をマッチング</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  最低限<b>ニックネーム・電話番号・名前</b>の入力が必要です。所要時間: 約1分
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-full shadow-lg shadow-blue-600/25"
                onClick={() => {
                  setShowProfileRequiredModal(false)
                  navigate('/profile-beauty')
                }}
              >
                <User className="w-4 h-4 mr-2" />
                今すぐプロフィールを設定
              </Button>
              <button
                className="text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors"
                onClick={() => setShowProfileRequiredModal(false)}
              >
                後で設定する
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LINE Registration Floating Banner */}
      <LineRegistrationBanner />

      {/* 休業お知らせポップアップ */}
      <HolidayNoticePopup />
    </div>
  )
}

export default HomePageJP
