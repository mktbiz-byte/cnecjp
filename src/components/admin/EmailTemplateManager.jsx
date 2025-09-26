import { useState, useEffect } from 'react'
import { database } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, Save, Eye, RotateCcw, Mail, 
  AlertCircle, CheckCircle, Edit, Send
} from 'lucide-react'

const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState({
    welcome: { subject: '', content: '' },
    campaign_approved: { subject: '', content: '' },
    guide_links: { subject: '', content: '' },
    deadline_3days: { subject: '', content: '' },
    deadline_1day: { subject: '', content: '' },
    point_approved: { subject: '', content: '' },
    payment_completed: { subject: '', content: '' }
  })
  
  const [selectedTemplate, setSelectedTemplate] = useState('welcome')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const templateNames = {
    welcome: '가입 축하 메일',
    campaign_approved: '캠페인 승인 메일',
    guide_links: '가이드 및 링크 안내 메일',
    deadline_3days: '마감 3일전 알림 메일',
    deadline_1day: '마감 1일전 긴급 알림 메일',
    point_approved: '포인트 승인 메일',
    payment_completed: '입금 완료 메일'
  }

  const defaultTemplates = {
    welcome: {
      subject: 'CNEC へようこそ！アカウント作成完了のお知らせ',
      content: `
<div style="font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">CNEC</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">K-Beauty インフルエンサープラットフォーム</p>
  </div>
  
  <div style="background: white; padding: 40px 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">ようこそ、{{userName}}さん！</h2>
    
    <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
      CNECへのご登録ありがとうございます。あなたのアカウントが正常に作成されました。
    </p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">次のステップ</h3>
      <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>プロフィールを完成させる</li>
        <li>興味のあるキャンペーンを探す</li>
        <li>キャンペーンに応募する</li>
        <li>承認後、コンテンツを作成・投稿する</li>
        <li>報酬を獲得する</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{siteUrl}}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
        マイページを見る
      </a>
    </div>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
    <p style="margin: 0;">© 2024 CNEC. All rights reserved.</p>
  </div>
</div>
      `
    },
    campaign_approved: {
      subject: 'キャンペーン承認のお知らせ - {{campaignTitle}}',
      content: `
<div style="font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 承認おめでとうございます！</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">{{userName}}さん</h2>
    
    <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
      「<strong>{{campaignTitle}}</strong>」キャンペーンへの応募が承認されました！
    </p>
    
    <div style="background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">キャンペーン詳細</h3>
      <p style="margin: 5px 0; color: #333;"><strong>ブランド:</strong> {{campaignBrand}}</p>
      <p style="margin: 5px 0; color: #333;"><strong>報酬:</strong> ¥{{rewardAmount}}</p>
    </div>
    
    <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #d97706; margin: 0 0 15px 0; font-size: 18px;">⚠️ 重要な注意事項</h3>
      <p style="color: #92400e; line-height: 1.6; margin: 0;">
        動画は1次共有後、修正を経てからSNSにアップロードしてください。<br>
        <strong>任意でのアップロードは禁止されています。</strong>
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{guideLink}}" 
         style="background: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 5px;">
        📋 ガイド資料
      </a>
      <a href="{{driveLink}}" 
         style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin: 5px;">
        📁 共有フォルダ
      </a>
    </div>
  </div>
</div>
      `
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 데이터베이스에서 템플릿 로드
      const savedTemplates = await database.emailTemplates.getAll()
      
      if (savedTemplates && savedTemplates.length > 0) {
        const templateMap = {}
        savedTemplates.forEach(template => {
          templateMap[template.type] = {
            subject: template.subject,
            content: template.content
          }
        })
        setTemplates(prev => ({ ...prev, ...templateMap }))
      } else {
        // 기본 템플릿 사용
        setTemplates(prev => ({ ...prev, ...defaultTemplates }))
      }
      
    } catch (error) {
      console.error('Load templates error:', error)
      setError('テンプレートの読み込みに失敗しました。')
      // 오류 시 기본 템플릿 사용
      setTemplates(prev => ({ ...prev, ...defaultTemplates }))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    try {
      setProcessing(true)
      setError('')
      
      const currentTemplate = templates[selectedTemplate]
      
      if (!currentTemplate.subject.trim()) {
        setError('件名を入力してください。')
        return
      }
      
      if (!currentTemplate.content.trim()) {
        setError('本文を入力してください。')
        return
      }
      
      // 데이터베이스에 템플릿 저장
      await database.emailTemplates.upsert({
        type: selectedTemplate,
        subject: currentTemplate.subject,
        content: currentTemplate.content,
        updated_at: new Date().toISOString()
      })
      
      setSuccess('テンプレートを保存しました。')
      
    } catch (error) {
      console.error('Save template error:', error)
      setError('テンプレートの保存に失敗しました。')
    } finally {
      setProcessing(false)
    }
  }

  const handleResetTemplate = () => {
    if (defaultTemplates[selectedTemplate]) {
      setTemplates(prev => ({
        ...prev,
        [selectedTemplate]: { ...defaultTemplates[selectedTemplate] }
      }))
      setSuccess('テンプレートをデフォルトに戻しました。')
    }
  }

  const handleTemplateChange = (field, value) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [field]: value
      }
    }))
  }

  const renderPreview = () => {
    const template = templates[selectedTemplate]
    if (!template) return null

    // 샘플 데이터로 템플릿 렌더링
    let previewContent = template.content
      .replace(/{{userName}}/g, '山田太郎')
      .replace(/{{campaignTitle}}/g, 'テストキャンペーン')
      .replace(/{{campaignBrand}}/g, 'テストブランド')
      .replace(/{{rewardAmount}}/g, '25,000')
      .replace(/{{siteUrl}}/g, 'https://cnec.jp')
      .replace(/{{guideLink}}/g, '#')
      .replace(/{{driveLink}}/g, '#')

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">件名プレビュー</h4>
          <div className="bg-gray-50 p-3 rounded border">
            {template.subject.replace(/{{campaignTitle}}/g, 'テストキャンペーン')}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-800 mb-2">本文プレビュー</h4>
          <div 
            className="bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">テンプレートを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">メールテンプレート管理</h2>
          <p className="text-gray-600">自動送信メールのテンプレートを編集できます</p>
        </div>
      </div>

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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span>テンプレート選択</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(templateNames).map(([key, name]) => (
                <Button
                  key={key}
                  variant={selectedTemplate === key ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedTemplate(key)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-green-600" />
                <span>{templateNames[selectedTemplate]}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? '編集' : 'プレビュー'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetTemplate}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  リセット
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {previewMode ? (
              renderPreview()
            ) : (
              <div className="space-y-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">件名</Label>
                  <Input
                    id="subject"
                    value={templates[selectedTemplate]?.subject || ''}
                    onChange={(e) => handleTemplateChange('subject', e.target.value)}
                    placeholder="メールの件名を入力してください"
                  />
                  <p className="text-xs text-gray-500">
                    使用可能な変数: {{userName}}, {{campaignTitle}}, {{rewardAmount}} など
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">本文 (HTML)</Label>
                  <Textarea
                    id="content"
                    value={templates[selectedTemplate]?.content || ''}
                    onChange={(e) => handleTemplateChange('content', e.target.value)}
                    placeholder="メールの本文をHTMLで入力してください"
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    HTMLタグが使用できます。変数は {{変数名}} の形式で記述してください。
                  </p>
                </div>

                {/* Variables Help */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">使用可能な変数</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><code>{{userName}}</code> - ユーザー名</p>
                    <p><code>{{campaignTitle}}</code> - キャンペーンタイトル</p>
                    <p><code>{{campaignBrand}}</code> - ブランド名</p>
                    <p><code>{{rewardAmount}}</code> - 報酬金額</p>
                    <p><code>{{siteUrl}}</code> - サイトURL</p>
                    <p><code>{{guideLink}}</code> - ガイドリンク</p>
                    <p><code>{{driveLink}}</code> - ドライブリンク</p>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveTemplate}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  テンプレートを保存
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmailTemplateManager
