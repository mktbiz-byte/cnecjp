import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import AdminNavigation from './AdminNavigation'
import { 
  Loader2, Save, Settings, Globe, Search, Image, 
  FileText, Link, AlertCircle, CheckCircle, 
  RefreshCw, Eye, Code, Monitor, Mail
} from 'lucide-react'

const SystemSettings = () => {
  const { language } = useLanguage()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 이메일 설정
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    fromName: 'CNEC Japan',
    replyToEmail: '',
    testEmail: ''
  })

  // SEO 설정
  const [seoSettings, setSeoSettings] = useState({
    siteName: 'CNEC Japan',
    siteDescription: 'K-Beauty × クリエイター配信プラットフォーム',
    siteKeywords: 'K-Beauty, クリエイター, 配信, プラットフォーム, 韓国コスメ',
    ogTitle: 'CNEC Japan - K-Beauty × クリエイター配信プラットフォーム',
    ogDescription: '韓国コスメブランドの最新キャンペーンに参加して、あなたの影響力を収益化しましょう',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterSite: '@cnecjapan',
    canonicalUrl: 'https://cnec.jp',
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapUrl: 'https://cnec.jp/sitemap.xml',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    metaAuthor: 'CNEC Japan',
    metaViewport: 'width=device-width, initial-scale=1.0',
    metaCharset: 'UTF-8',
    favicon: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png'
  })

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '시스템 설정',
      subtitle: 'SEO, 이메일 및 사이트 전반적인 설정을 관리합니다',
      emailSettings: '이메일 설정',
      smtpSettings: 'SMTP 서버 설정',
      emailGeneral: '일반 이메일 설정',
      testEmail: '테스트 이메일',
      smtpHost: 'SMTP 호스트',
      smtpPort: 'SMTP 포트',
      smtpSecure: 'SSL/TLS 사용',
      smtpUser: 'SMTP 사용자명',
      smtpPass: 'SMTP 비밀번호',
      fromEmail: '발신자 이메일',
      fromName: '발신자 이름',
      replyToEmail: '답장 이메일',
      testEmailAddress: '테스트 이메일 주소',
      sendTestEmail: '테스트 이메일 발송',
      seoSettings: 'SEO 설정',
      basicSeo: '기본 SEO 설정',
      socialMedia: '소셜 미디어 설정',
      analytics: '분석 도구 설정',
      technical: '기술적 설정',
      siteName: '사이트 이름',
      siteDescription: '사이트 설명',
      siteKeywords: '사이트 키워드',
      ogTitle: 'Open Graph 제목',
      ogDescription: 'Open Graph 설명',
      ogImage: 'Open Graph 이미지 URL',
      twitterCard: 'Twitter 카드 타입',
      twitterSite: 'Twitter 사이트 계정',
      canonicalUrl: '기본 URL',
      robotsTxt: 'robots.txt 내용',
      sitemapUrl: '사이트맵 URL',
      googleAnalyticsId: 'Google Analytics ID',
      googleTagManagerId: 'Google Tag Manager ID',
      facebookPixelId: 'Facebook Pixel ID',
      metaAuthor: '작성자',
      metaViewport: 'Viewport 설정',
      metaCharset: '문자 인코딩',
      favicon: 'Favicon URL',
      appleTouchIcon: 'Apple Touch Icon URL',
      save: '저장',
      cancel: '취소',
      loading: '로딩 중...',
      saving: '저장 중...',
      error: '오류가 발생했습니다.',
      success: '설정이 성공적으로 저장되었습니다.',
      preview: '미리보기',
      reset: '초기화',
      export: '내보내기',
      import: '가져오기'
    },
    ja: {
      title: 'システム設定',
      subtitle: 'SEOおよびサイト全般の設定を管理します',
      seoSettings: 'SEO設定',
      basicSeo: '基本SEO設定',
      socialMedia: 'ソーシャルメディア設定',
      analytics: '分析ツール設定',
      technical: '技術的設定',
      siteName: 'サイト名',
      siteDescription: 'サイト説明',
      siteKeywords: 'サイトキーワード',
      ogTitle: 'Open Graphタイトル',
      ogDescription: 'Open Graph説明',
      ogImage: 'Open Graph画像URL',
      twitterCard: 'Twitterカードタイプ',
      twitterSite: 'Twitterサイトアカウント',
      canonicalUrl: '基本URL',
      robotsTxt: 'robots.txt内容',
      sitemapUrl: 'サイトマップURL',
      googleAnalyticsId: 'Google Analytics ID',
      googleTagManagerId: 'Google Tag Manager ID',
      facebookPixelId: 'Facebook Pixel ID',
      metaAuthor: '作成者',
      metaViewport: 'Viewport設定',
      metaCharset: '文字エンコーディング',
      favicon: 'Favicon URL',
      appleTouchIcon: 'Apple Touch Icon URL',
      save: '保存',
      cancel: 'キャンセル',
      loading: '読み込み中...',
      saving: '保存中...',
      error: 'エラーが発生しました。',
      success: '設定が正常に保存されました。',
      preview: 'プレビュー',
      reset: 'リセット',
      export: 'エクスポート',
      import: 'インポート'
    }
  }

  const t = texts[language] || texts.ko

  useEffect(() => {
    console.log('SystemSettings 마운트됨')
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 로컬 스토리지에서 설정 로드
      const savedSeoSettings = localStorage.getItem('cnec_seo_settings')
      if (savedSeoSettings) {
        setSeoSettings(JSON.parse(savedSeoSettings))
      }
      
      const savedEmailSettings = localStorage.getItem('cnec_email_settings')
      if (savedEmailSettings) {
        setEmailSettings(JSON.parse(savedEmailSettings))
      }
      
    } catch (error) {
      console.error('설정 로드 오류:', error)
      setError(`${t.error}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      // 로컬 스토리지에 설정 저장
      localStorage.setItem('cnec_seo_settings', JSON.stringify(seoSettings))
      localStorage.setItem('cnec_email_settings', JSON.stringify(emailSettings))
      
      // 실제 환경에서는 서버에 저장
      // await database.settings.upsert('seo', seoSettings)
      // await database.settings.upsert('email', emailSettings)
      
      setSuccess(t.success)
      
    } catch (error) {
      console.error('설정 저장 오류:', error)
      setError(`설정 저장에 실패했습니다: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSeoSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmailInputChange = (field, value) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const sendTestEmail = async () => {
    try {
      if (!emailSettings.testEmail) {
        setError('테스트 이메일 주소를 입력해주세요.')
        return
      }
      
      setSaving(true)
      setError('')
      setSuccess('')
      
      // 테스트 이메일 발송 로직 (실제 구현 필요)
      console.log('테스트 이메일 발송:', {
        to: emailSettings.testEmail,
        settings: emailSettings
      })
      
      // 실제 환경에서는 이메일 발송 API 호출
      // await emailService.sendTestEmail(emailSettings)
      
      setSuccess('테스트 이메일이 발송되었습니다.')
      
    } catch (error) {
      console.error('테스트 이메일 발송 오류:', error)
      setError(`테스트 이메일 발송에 실패했습니다: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    if (confirm('모든 설정을 초기값으로 되돌리시겠습니까?')) {
      setSeoSettings({
        siteName: 'CNEC Japan',
        siteDescription: 'K-Beauty × クリエイター配信プラットフォーム',
        siteKeywords: 'K-Beauty, クリエイター, 配信, プラットフォーム, 韓国コスメ',
        ogTitle: 'CNEC Japan - K-Beauty × クリエイター配信プラットフォーム',
        ogDescription: '韓国コスメブランドの最新キャンペーンに参加して、あなたの影響力を収益化しましょう',
        ogImage: '',
        twitterCard: 'summary_large_image',
        twitterSite: '@cnecjapan',
        canonicalUrl: 'https://cnec.jp',
        robotsTxt: 'User-agent: *\nAllow: /',
        sitemapUrl: 'https://cnec.jp/sitemap.xml',
        googleAnalyticsId: '',
        googleTagManagerId: '',
        facebookPixelId: '',
        metaAuthor: 'CNEC Japan',
        metaViewport: 'width=device-width, initial-scale=1.0',
        metaCharset: 'UTF-8',
        favicon: '/favicon.ico',
        appleTouchIcon: '/apple-touch-icon.png'
      })
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(seoSettings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'cnec_seo_settings.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result)
          setSeoSettings(importedSettings)
          setSuccess('설정을 성공적으로 가져왔습니다.')
        } catch (error) {
          setError('설정 파일을 읽는 중 오류가 발생했습니다.')
        }
      }
      reader.readAsText(file)
    }
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-2">{t.subtitle}</p>
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
                id="import-settings"
              />
              <label
                htmlFor="import-settings"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t.import}
              </label>
              <button
                onClick={exportSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t.export}
              </button>
              <button
                onClick={resetSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.reset}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* 이메일 설정 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t.emailSettings}</h3>
              </div>
              
              {/* SMTP 서버 설정 */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">{t.smtpSettings}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.smtpHost}</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => handleEmailInputChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.smtpPort}</label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => handleEmailInputChange('smtpPort', e.target.value)}
                      placeholder="587"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.smtpUser}</label>
                    <input
                      type="email"
                      value={emailSettings.smtpUser}
                      onChange={(e) => handleEmailInputChange('smtpUser', e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.smtpPass}</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPass}
                      onChange={(e) => handleEmailInputChange('smtpPass', e.target.value)}
                      placeholder="앱 비밀번호"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailSettings.smtpSecure}
                      onChange={(e) => handleEmailInputChange('smtpSecure', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t.smtpSecure}</span>
                  </label>
                </div>
              </div>
              
              {/* 일반 이메일 설정 */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">{t.emailGeneral}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.fromEmail}</label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => handleEmailInputChange('fromEmail', e.target.value)}
                      placeholder="noreply@cnec.jp"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.fromName}</label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) => handleEmailInputChange('fromName', e.target.value)}
                      placeholder="CNEC Japan"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.replyToEmail}</label>
                    <input
                      type="email"
                      value={emailSettings.replyToEmail}
                      onChange={(e) => handleEmailInputChange('replyToEmail', e.target.value)}
                      placeholder="support@cnec.jp"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* 테스트 이메일 */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">{t.testEmail}</h4>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={emailSettings.testEmail}
                      onChange={(e) => handleEmailInputChange('testEmail', e.target.value)}
                      placeholder="test@example.com"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={sendTestEmail}
                    disabled={saving || !emailSettings.testEmail}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        발송 중...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        {t.sendTestEmail}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 기본 SEO 설정 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t.basicSeo}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.siteName}</label>
                  <input
                    type="text"
                    value={seoSettings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.siteDescription}</label>
                  <textarea
                    rows={3}
                    value={seoSettings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.siteKeywords}</label>
                  <input
                    type="text"
                    value={seoSettings.siteKeywords}
                    onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
                    placeholder="키워드1, 키워드2, 키워드3"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.canonicalUrl}</label>
                  <input
                    type="url"
                    value={seoSettings.canonicalUrl}
                    onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 소셜 미디어 설정 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t.socialMedia}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.ogTitle}</label>
                  <input
                    type="text"
                    value={seoSettings.ogTitle}
                    onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.ogDescription}</label>
                  <textarea
                    rows={3}
                    value={seoSettings.ogDescription}
                    onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.ogImage}</label>
                  <input
                    type="url"
                    value={seoSettings.ogImage}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.twitterCard}</label>
                    <select
                      value={seoSettings.twitterCard}
                      onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="app">App</option>
                      <option value="player">Player</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.twitterSite}</label>
                    <input
                      type="text"
                      value={seoSettings.twitterSite}
                      onChange={(e) => handleInputChange('twitterSite', e.target.value)}
                      placeholder="@username"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 분석 도구 설정 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Monitor className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t.analytics}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.googleAnalyticsId}</label>
                  <input
                    type="text"
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                    placeholder="GA_MEASUREMENT_ID"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.googleTagManagerId}</label>
                  <input
                    type="text"
                    value={seoSettings.googleTagManagerId}
                    onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.facebookPixelId}</label>
                  <input
                    type="text"
                    value={seoSettings.facebookPixelId}
                    onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                    placeholder="123456789012345"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 기술적 설정 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Code className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t.technical}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.robotsTxt}</label>
                  <textarea
                    rows={4}
                    value={seoSettings.robotsTxt}
                    onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t.sitemapUrl}</label>
                  <input
                    type="url"
                    value={seoSettings.sitemapUrl}
                    onChange={(e) => handleInputChange('sitemapUrl', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.favicon}</label>
                    <input
                      type="text"
                      value={seoSettings.favicon}
                      onChange={(e) => handleInputChange('favicon', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.appleTouchIcon}</label>
                    <input
                      type="text"
                      value={seoSettings.appleTouchIcon}
                      onChange={(e) => handleInputChange('appleTouchIcon', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.metaAuthor}</label>
                    <input
                      type="text"
                      value={seoSettings.metaAuthor}
                      onChange={(e) => handleInputChange('metaAuthor', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.metaViewport}</label>
                    <input
                      type="text"
                      value={seoSettings.metaViewport}
                      onChange={(e) => handleInputChange('metaViewport', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.metaCharset}</label>
                    <input
                      type="text"
                      value={seoSettings.metaCharset}
                      onChange={(e) => handleInputChange('metaCharset', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {saving ? t.saving : t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
