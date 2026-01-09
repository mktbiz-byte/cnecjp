import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Loader2, Play, Users, Target, Shield,
  Instagram, Youtube, Hash, Twitter, ExternalLink,
  Star, Award, Calendar, DollarSign, Eye, ArrowRight,
  CheckCircle, Clock, MapPin, Phone, Mail, User, Zap,
  Menu, X, TrendingUp, Wallet, FileText
} from 'lucide-react'
import LineRegistrationBanner from './LineRegistrationBanner'

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

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadCampaigns(),
        loadStats()
      ])
    } catch (error) {
      console.error('Page data load error:', error)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🇯🇵</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">CNEC Japan</h1>
                <p className="text-xs text-gray-600">K-Beauty クリエイターネットワーク</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <a href="#campaigns" className="text-gray-700 hover:text-blue-600 font-medium">キャンペーン</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">参加方法</a>
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/mypage">マイページ</Link>
                  </Button>
                  <Button variant="ghost" onClick={signOut}>ログアウト</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">ログイン</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link to="/signup">今すぐ登録</Link>
                  </Button>
                </>
              )}
            </nav>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <a href="#campaigns" className="text-gray-700 hover:text-blue-600 font-medium py-2">キャンペーン</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium py-2">参加方法</a>
                {user ? (
                  <>
                    <Link to="/mypage" className="text-gray-700 hover:text-blue-600 font-medium py-2">マイページ</Link>
                    <button onClick={signOut} className="text-gray-700 hover:text-blue-600 font-medium py-2 text-left">ログアウト</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium py-2">ログイン</Link>
                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium py-2">今すぐ登録</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-4">
            <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              週払い対応・手数料無料・安心のサポート
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            K-Beautyコンテンツで
            <br />
            <span className="text-blue-600">毎週収入を得る</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            韓国コスメブランドのショート動画を制作し、毎週報酬を受け取れます。
            遅延なし、面倒なし、透明な報酬システム。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8"
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
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8"
            >
              <a href="#how-it-works" className="flex items-center">
                参加方法を見る
              </a>
            </Button>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalCreators}+
              </div>
              <div className="text-sm text-gray-600">登録クリエイター</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatCurrency(stats.totalRewards)}
              </div>
              <div className="text-sm text-gray-600">総支払額</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.totalCampaigns}+
              </div>
              <div className="text-sm text-gray-600">実施キャンペーン</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                4.8★
              </div>
              <div className="text-sm text-gray-600">クリエイター評価</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              参加方法
            </h2>
            <p className="text-lg text-gray-600">
              4つの簡単なステップで収益化を開始
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-2">STEP 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">応募</h3>
              <p className="text-gray-600 text-sm">
                興味のあるキャンペーンを選んで応募
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-purple-600 mb-2">STEP 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">制作</h3>
              <p className="text-gray-600 text-sm">
                ガイドラインに沿ってショート動画を制作
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-pink-600" />
              </div>
              <div className="text-sm font-semibold text-pink-600 mb-2">STEP 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">投稿</h3>
              <p className="text-gray-600 text-sm">
                SNSに投稿して証明を提出
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600 mb-2">STEP 4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">受取</h3>
              <p className="text-gray-600 text-sm">
                毎週報酬を銀行口座で受取
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Payment Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block mb-4">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    安心の週払いシステム
                  </Badge>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  毎週安定した
                  <br />
                  収入を実現
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  毎週定期的に報酬を受け取れます。数ヶ月待つ必要はありません。
                  隠れた手数料なし、中間業者なし。
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">銀行振込対応</div>
                      <div className="text-sm text-gray-600">日本の銀行口座に直接振込</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">透明な追跡</div>
                      <div className="text-sm text-gray-600">リアルタイムで収益を確認</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">最低出金額なし</div>
                      <div className="text-sm text-gray-600">金額に関係なく出金可能</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ¥50,000-¥200,000
                  </div>
                  <div className="text-gray-600">月間平均収入</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">第1週</span>
                    <span className="font-semibold text-gray-900">¥35,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">第2週</span>
                    <span className="font-semibold text-gray-900">¥42,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">第3週</span>
                    <span className="font-semibold text-gray-900">¥38,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">第4週</span>
                    <span className="font-semibold text-gray-900">¥45,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      <section id="campaigns" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              募集中のキャンペーン
            </h2>
            <p className="text-lg text-gray-600">
              K-Beautyブランドの最新キャンペーンで収益化を開始
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">現在募集中のキャンペーンはありません</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {campaigns.filter((campaign) => {
                // Filter out campaigns past their application deadline
                const deadline = campaign.application_deadline
                if (!deadline) return true
                const deadlineDate = new Date(deadline)
                const today = new Date()
                today.setHours(0, 0, 0, 0) // Compare dates only, not time
                return deadlineDate >= today
              }).map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 overflow-hidden" onClick={() => handleCampaignClick(campaign)}>
                  {campaign.image_url && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={campaign.image_url} 
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {getActivePlatforms(campaign.target_platforms).map((platform) => (
                          <Badge key={platform} className={`${getPlatformColor(platform)} flex items-center gap-1 px-2 py-0.5 text-xs`}>
                            <span className="flex items-center">{getPlatformIcon(platform)}</span>
                            <span className="font-medium capitalize">{platform}</span>
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(campaign.reward_amount)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        応募締切: {formatDate(campaign.application_deadline)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {campaign.max_participants || campaign.total_slots} 名募集
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={(e) => {
                        e.stopPropagation()
                        handleApply(campaign.id)
                      }}>
                        今すぐ応募
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐ収益化を開始しませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            800名以上のクリエイターが既にK-Beautyブランドとの
            コラボレーションで収入を得ています
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
            asChild
          >
            <Link to="/signup">
              無料アカウント作成
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Campaign Detail Modal */}
      <Dialog open={detailModal} onOpenChange={setDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCampaign.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex gap-2 mt-2">
                    {getActivePlatforms(selectedCampaign.target_platforms).map((platform) => (
                      <Badge key={platform} className={getPlatformColor(platform)}>
                        {getPlatformIcon(platform)}
                        <span className="ml-1 capitalize">{platform}</span>
                      </Badge>
                    ))}
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              {selectedCampaign.image_url && (
                <img 
                  src={selectedCampaign.image_url} 
                  alt={selectedCampaign.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">キャンペーン詳細</h3>
                  <p className="text-gray-700">{selectedCampaign.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">報酬</div>
                      <div className="font-semibold">{formatCurrency(selectedCampaign.reward_amount)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">締切</div>
                      <div className="font-semibold">{formatDate(selectedCampaign.application_deadline)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">募集人数</div>
                      <div className="font-semibold">{selectedCampaign.max_participants || selectedCampaign.total_slots} 名</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-orange-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-600">カテゴリー</div>
                      <div className="font-semibold">{selectedCampaign.category}</div>
                    </div>
                  </div>
                </div>

                {selectedCampaign.requirements && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">応募条件</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedCampaign.requirements}</p>
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setDetailModal(false)
                    handleApply(selectedCampaign.id)
                  }}
                >
                  このキャンペーンに応募
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CNEC Japan</h3>
              <p className="text-gray-400 text-sm">
                K-Beautyブランドとクリエイターを繋ぐ
                専門プラットフォーム
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#campaigns" className="hover:text-white">キャンペーン</a></li>
                <li><a href="#how-it-works" className="hover:text-white">参加方法</a></li>
                <li><Link to="/signup" className="hover:text-white">新規登録</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">よくある質問</a></li>
                <li><a href="#" className="hover:text-white">お問い合わせ</a></li>
                <li><Link to="/terms" className="hover:text-white">利用規約</Link></li>
                <li><Link to="/privacy" className="hover:text-white">プライバシーポリシー</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">フォロー</h4>
              <div className="flex space-x-4">
                <a href="https://www.youtube.com/@CNEC_JP" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Youtube className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 CNEC Japan. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* LINE Registration Floating Banner */}
      <LineRegistrationBanner />
    </div>
  )
}

export default HomePageJP
