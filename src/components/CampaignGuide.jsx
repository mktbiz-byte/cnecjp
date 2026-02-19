import React from 'react'
import { Link } from 'react-router-dom'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, FileText, CheckCircle, Upload, Eye, Award,
  BookOpen, Share2, Wallet, Clock, User, MapPin, Phone,
  Instagram, Youtube, Hash, Save, ArrowRight, Film,
  CreditCard, Shield, Search, Send, HelpCircle, ChevronRight,
  AlertCircle, Star, Calendar, DollarSign, RefreshCw
} from 'lucide-react'

// ─── Tailwind-safe color map ───
const colors = {
  blue: {
    bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800',
    icon: 'text-blue-600', circle: 'bg-blue-100 border-blue-300',
    line: 'bg-blue-200', badge: 'bg-blue-100 text-blue-700',
    link: 'bg-blue-50 hover:bg-blue-100', linkText: 'text-blue-800'
  },
  purple: {
    bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-800',
    icon: 'text-purple-600', circle: 'bg-purple-100 border-purple-300',
    line: 'bg-purple-200', badge: 'bg-purple-100 text-purple-700',
    link: 'bg-purple-50 hover:bg-purple-100', linkText: 'text-purple-800'
  },
  emerald: {
    bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800',
    icon: 'text-emerald-600', circle: 'bg-emerald-100 border-emerald-300',
    line: 'bg-emerald-200', badge: 'bg-emerald-100 text-emerald-700',
    link: 'bg-emerald-50 hover:bg-emerald-100', linkText: 'text-emerald-800'
  },
  amber: {
    bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800',
    icon: 'text-amber-600', circle: 'bg-amber-100 border-amber-300',
    line: 'bg-amber-200', badge: 'bg-amber-100 text-amber-700',
    link: 'bg-amber-50 hover:bg-amber-100', linkText: 'text-amber-800'
  },
  red: {
    bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800',
    icon: 'text-red-600', circle: 'bg-red-100 border-red-300',
    line: 'bg-red-200', badge: 'bg-red-100 text-red-700',
    link: 'bg-red-50 hover:bg-red-100', linkText: 'text-red-800'
  },
  green: {
    bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-800',
    icon: 'text-green-600', circle: 'bg-green-100 border-green-300',
    line: 'bg-green-200', badge: 'bg-green-100 text-green-700',
    link: 'bg-green-50 hover:bg-green-100', linkText: 'text-green-800'
  }
}

// ─── Flow Diagram (horizontal on desktop, vertical on mobile) ───
const FlowDiagram = ({ steps, color = 'blue' }) => {
  const c = colors[color]
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 py-4 sm:py-6">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-row sm:flex-col items-center text-center gap-3 sm:gap-0 w-full sm:w-auto">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${c.circle} border-2 flex items-center justify-center flex-shrink-0`}>
              {step.icon}
            </div>
            <div className="text-left sm:text-center sm:mt-2.5 flex-1 sm:flex-none">
              <span className="text-xs sm:text-sm font-bold text-gray-800 block">{step.title}</span>
              {step.desc && <span className="text-[11px] sm:text-xs text-gray-500 block mt-0.5">{step.desc}</span>}
            </div>
          </div>
          {i < steps.length - 1 && (
            <>
              <div className={`hidden sm:block flex-1 h-0.5 ${c.line} mx-2`} />
              <div className={`sm:hidden w-0.5 h-4 ${c.line} ml-6 sm:ml-0`} />
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Vertical Timeline Step ───
const TimelineStep = ({ step, isLast }) => {
  const c = colors[step.color]
  return (
    <div className="relative pl-10 sm:pl-12 pb-6 last:pb-0">
      {!isLast && (
        <div className="absolute left-[15px] sm:left-[19px] top-10 bottom-0 w-0.5 bg-gray-200" />
      )}
      <div className={`absolute left-0 top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${c.circle} border-2 flex items-center justify-center z-10`}>
        <span className={c.icon}>{step.icon}</span>
      </div>
      <div className={`${c.bg} ${c.border} border rounded-xl p-3.5 sm:p-4`}>
        <div className="flex items-center gap-2 mb-1.5">
          <h4 className={`font-bold text-sm sm:text-base ${c.text}`}>{step.title}</h4>
          {step.badges && step.badges.map((b, i) => (
            <Badge key={i} variant="secondary" className={`text-[10px] px-1.5 py-0 ${c.badge}`}>{b}</Badge>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.description}</p>
        {step.detail && (
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">{step.detail}</p>
        )}
      </div>
    </div>
  )
}

// ─── Section Header ───
const SectionHeader = ({ id, number, title, subtitle, icon, color }) => {
  const c = colors[color]
  return (
    <div id={id} className="scroll-mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${c.circle} border-2 flex items-center justify-center flex-shrink-0`}>
          <span className={c.icon}>{icon}</span>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {number}. {title}
          </h2>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════
export default function CampaignGuide() {
  // ─── Section 1: Application Flow Steps ───
  const applicationSteps = [
    { icon: <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />, title: 'キャンペーン検索', desc: 'ホームページで確認' },
    { icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />, title: '応募フォーム入力', desc: '必要情報を記入' },
    { icon: <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />, title: '応募提出', desc: '内容確認して送信' },
    { icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />, title: '結果発表', desc: 'メールで通知' },
  ]

  // ─── Section 1: Application Form Fields ───
  const formFields = [
    {
      icon: <User className="w-4 h-4 text-blue-600" />,
      title: '個人情報',
      items: ['名前', '年齢', '肌タイプ（乾燥肌・脂性肌・混合肌・敏感肌・普通肌）']
    },
    {
      icon: <MapPin className="w-4 h-4 text-blue-600" />,
      title: '連絡先・配送情報',
      items: ['郵便番号', '詳細住所', '電話番号']
    },
    {
      icon: <Instagram className="w-4 h-4 text-blue-600" />,
      title: 'SNS情報',
      items: ['Instagram URL（必須）', 'YouTube URL（任意）', 'TikTok URL（任意）']
    },
    {
      icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
      title: 'キャンペーン質問',
      items: ['キャンペーンごとの質問に回答', '最大4問まで']
    }
  ]

  // ─── Section 2: Workflow Steps ───
  const workflowSteps = [
    {
      icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: 'ガイド確認',
      color: 'purple',
      badges: ['guide_pending', 'guide_confirmed'],
      description: '撮影ガイドを確認し、「確認完了」ボタンを押してください。',
      detail: 'キャンペーンの撮影ガイドラインが配信されます。動画の構成、必須項目、注意事項などを確認できます。'
    },
    {
      icon: <Upload className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: '動画アップロード',
      color: 'blue',
      badges: ['video_uploading', 'video_uploaded'],
      description: 'ガイドに沿って撮影した動画をアップロードします。',
      detail: 'メイン動画（必須）とクリーン版（字幕なし版、キャンペーンにより必須の場合あり）をアップロードできます。'
    },
    {
      icon: <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: 'SNS投稿',
      color: 'green',
      badges: ['sns_pending', 'sns_submitted'],
      description: '動画をSNSに投稿し、投稿URLを提出してください。',
      detail: '対象SNS（Instagram / YouTube / TikTok）に動画を投稿後、URLを入力します。広告表示（#AD、#PR等）が必要な場合があります。'
    },
    {
      icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: 'レビュー',
      color: 'amber',
      badges: ['review_pending', 'completed'],
      description: '運営チームが投稿内容を確認します。',
      detail: '問題がなければ「完了」となります。修正が必要な場合は「修正依頼」としてフィードバックが届きます。'
    },
    {
      icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: 'ポイント支給',
      color: 'emerald',
      badges: ['points_paid'],
      description: 'レビュー完了後、キャンペーン報酬がポイントとして付与されます。',
      detail: '付与されたポイントはマイページで確認でき、出金申請が可能です。'
    }
  ]

  // ─── Section 3: Withdrawal Steps ───
  const withdrawalSteps = [
    { icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: 'ポイント確認', desc: 'マイページで残高確認' },
    { icon: <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: '出金申請', desc: '銀行口座情報を入力' },
    { icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: '処理完了', desc: '1〜3営業日で送金' },
  ]

  // ─── Section 4: Campaign Types ───
  const campaignTypes = [
    {
      value: 'regular',
      emoji: '📹',
      label: '企画型（Regular）',
      color: 'purple',
      steps: 1,
      stepLabels: ['Step 1'],
      description: '1本の動画を制作する標準的なキャンペーンです。',
      details: [
        'ガイド確認 → 動画アップロード → SNS投稿 → レビュー → ポイント支給',
        '1回の動画提出で完了するシンプルなフロー',
        'ブランドの商品紹介やレビュー動画が中心'
      ]
    },
    {
      value: 'megawari',
      emoji: '🎯',
      label: 'メガ割（Megawari）',
      color: 'amber',
      steps: 2,
      stepLabels: ['Step 1', 'Step 2'],
      description: 'メガ割セール期間に合わせた2ステップのキャンペーンです。',
      details: [
        'Step 1：セール前の事前告知動画を制作・投稿',
        'Step 2：セール期間中のレビュー動画を制作・投稿',
        '各ステップごとに「ガイド確認 → 動画 → SNS → レビュー → ポイント」を繰り返す'
      ]
    },
    {
      value: '4week_challenge',
      emoji: '🗓️',
      label: '4週チャレンジ（4-Week Challenge）',
      color: 'blue',
      steps: 4,
      stepLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      description: '4週間にわたり毎週1本ずつ動画を提出するチャレンジ型キャンペーンです。',
      details: [
        'Week 1〜4：毎週テーマに沿った動画を制作・投稿',
        '各Weekごとに「ガイド確認 → 動画 → SNS → レビュー → ポイント」を繰り返す',
        '4週間の継続的な活動が求められるため、スケジュール管理が重要',
        '全Weekの完了でボーナスポイントが付与される場合あり'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        {/* ── Header ── */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            キャンペーンガイド
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            応募から報酬受取までの完全ガイド
          </p>
        </div>

        {/* ── Table of Contents ── */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">目次</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <a href="#application-flow" className={`flex items-center gap-3 p-3 rounded-xl ${colors.blue.link} transition-colors`}>
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className={`font-medium text-sm ${colors.blue.linkText}`}>1. キャンペーン応募フロー</span>
            </a>
            <a href="#workflow" className={`flex items-center gap-3 p-3 rounded-xl ${colors.purple.link} transition-colors`}>
              <Film className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className={`font-medium text-sm ${colors.purple.linkText}`}>2. 選定後の進行フロー</span>
            </a>
            <a href="#withdrawal" className={`flex items-center gap-3 p-3 rounded-xl ${colors.emerald.link} transition-colors`}>
              <Wallet className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className={`font-medium text-sm ${colors.emerald.linkText}`}>3. ポイント出金申請</span>
            </a>
            <a href="#campaign-types" className={`flex items-center gap-3 p-3 rounded-xl ${colors.amber.link} transition-colors`}>
              <Star className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className={`font-medium text-sm ${colors.amber.linkText}`}>4. キャンペーンタイプの違い</span>
            </a>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 space-y-8 sm:space-y-12">

          {/* ═══ Section 1: Application Flow ═══ */}
          <section>
            <SectionHeader
              id="application-flow"
              number={1}
              title="キャンペーン応募フロー"
              subtitle="応募から結果発表まで"
              icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="blue"
            />

            {/* Flow Diagram */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-5 mb-5">
              <FlowDiagram steps={applicationSteps} color="blue" />
            </div>

            {/* Form Fields Grid */}
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">応募フォームの入力項目</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {formFields.map((field, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    {field.icon}
                    <h4 className="font-semibold text-sm text-gray-800">{field.title}</h4>
                  </div>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1 ml-6 list-disc">
                    {field.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Draft Auto-Save Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 mb-5">
              <Save className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-amber-800">下書き自動保存</h4>
                <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
                  入力内容は自動的にブラウザに保存されます。途中で閉じても24時間以内であれば、次回アクセス時に入力内容が復元されます。
                </p>
              </div>
            </div>

            {/* Portrait Rights */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-gray-800">肖像権使用許諾</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  応募時に肖像権の使用許諾への同意が必要です。制作した動画コンテンツの肖像（顔・姿・音声）について、ブランド及びCNECが1年間マーケティング目的で使用することを許諾いただきます。
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══ Section 2: Post-Selection Workflow ═══ */}
          <section>
            <SectionHeader
              id="workflow"
              number={2}
              title="選定後の進行フロー"
              subtitle="選定通知〜ポイント支給まで"
              icon={<Film className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="purple"
            />

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5 sm:p-4 mb-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-purple-700">
                キャンペーンに選定されると、メールで通知が届きます。マイページの「進行中キャンペーン」から各ステップを進めてください。
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="mt-4">
              {workflowSteps.map((step, i) => (
                <TimelineStep key={i} step={step} isLast={i === workflowSteps.length - 1} />
              ))}
            </div>

            {/* Revision Note */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 mt-5 flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-red-800">修正依頼について</h4>
                <p className="text-xs sm:text-sm text-red-600 mt-0.5">
                  レビューで「修正依頼」となった場合は、フィードバック内容を確認し、動画の再アップロードまたはSNS投稿の修正を行ってください。修正完了後、再度レビューが行われます。
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══ Section 3: Point Withdrawal ═══ */}
          <section>
            <SectionHeader
              id="withdrawal"
              number={3}
              title="ポイント出金申請"
              subtitle="ポイント獲得から出金まで"
              icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="emerald"
            />

            {/* How Points Are Earned */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 sm:p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm sm:text-base text-emerald-800">ポイントの獲得方法</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                キャンペーンの各ステップが「完了」になると、該当キャンペーンの報酬金額がポイントとして付与されます。
                付与されたポイントはマイページの「ポイント履歴」タブで確認できます。
              </p>
            </div>

            {/* Withdrawal Flow */}
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">出金プロセス</h3>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 sm:p-5 mb-5">
              <FlowDiagram steps={withdrawalSteps} color="emerald" />
            </div>

            {/* Withdrawal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  出金方法
                </h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    銀行振込での送金
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    銀行口座情報の入力が必須（銀行名・支店名・口座番号・名義）
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    1〜3営業日以内に処理完了
                  </li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  注意事項
                </h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    最低出金額：<span className="font-semibold text-emerald-700">1,000ポイント</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    出金手数料無料
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    マイページから申請可能
                  </li>
                </ul>
              </div>
            </div>

            {/* Withdrawal Statuses */}
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">出金ステータス</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-3 gap-0 text-center divide-x divide-slate-200">
                <div className="p-3 sm:p-4">
                  <Badge className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs mb-1.5">待機中</Badge>
                  <p className="text-[11px] sm:text-xs text-gray-500">申請受付済み</p>
                </div>
                <div className="p-3 sm:p-4">
                  <Badge className="bg-green-100 text-green-800 text-[10px] sm:text-xs mb-1.5">完了</Badge>
                  <p className="text-[11px] sm:text-xs text-gray-500">送金処理完了</p>
                </div>
                <div className="p-3 sm:p-4">
                  <Badge className="bg-red-100 text-red-800 text-[10px] sm:text-xs mb-1.5">拒否</Badge>
                  <p className="text-[11px] sm:text-xs text-gray-500">理由と共に通知</p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* ═══ Section 4: Campaign Types ═══ */}
          <section>
            <SectionHeader
              id="campaign-types"
              number={4}
              title="キャンペーンタイプの違い"
              subtitle="3つのタイプとそれぞれの特徴"
              icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="amber"
            />

            {/* Overview badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {campaignTypes.map((t) => (
                <span key={t.value} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${colors[t.color].bg} ${colors[t.color].border} border ${colors[t.color].text}`}>
                  {t.emoji} {t.label}
                  <Badge variant="secondary" className={`ml-1 text-[10px] px-1.5 py-0 ${colors[t.color].badge}`}>
                    {t.steps}ステップ
                  </Badge>
                </span>
              ))}
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible className="w-full space-y-2">
              {campaignTypes.map((type) => {
                const c = colors[type.color]
                return (
                  <AccordionItem key={type.value} value={type.value} className={`${c.bg} ${c.border} border rounded-xl overflow-hidden`}>
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-800">
                        <span className="text-lg">{type.emoji}</span>
                        {type.label}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className={`text-sm font-medium ${c.text} mb-3`}>{type.description}</p>

                      {/* Step labels */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {type.stepLabels.map((label, i) => (
                          <Badge key={i} variant="secondary" className={`${c.badge} text-xs`}>
                            {label}
                          </Badge>
                        ))}
                      </div>

                      {/* Details */}
                      <ul className="space-y-2">
                        {type.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                            <ChevronRight className={`w-3.5 h-3.5 ${c.icon} flex-shrink-0 mt-0.5`} />
                            {detail}
                          </li>
                        ))}
                      </ul>

                      {/* Mini workflow for multi-step */}
                      {type.steps > 1 && (
                        <div className={`mt-3 p-3 rounded-lg bg-white/60 border ${c.border}`}>
                          <p className="text-[11px] sm:text-xs text-gray-500 mb-1 font-medium">各ステップのフロー：</p>
                          <div className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs text-gray-600">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">ガイド確認</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">動画UP</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">SNS投稿</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">レビュー</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">ポイント</span>
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="text-center mt-8 sm:mt-10 pb-8">
          <Link
            to="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  )
}
