import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import {
  Award, Shield, Download, Filter,
  ChevronDown, ChevronUp, BookOpen, Upload, Link as LinkIcon,
  CheckCircle, Clock, AlertCircle, Film, FileVideo, Share2,
  Loader2, ExternalLink, X, XCircle, Play, Calendar, AlertTriangle,
  FileText
} from 'lucide-react'
import ExternalGuideViewer from './ExternalGuideViewer'
import ShootingGuideModal from './ShootingGuideModal'

// personalized_guide 파싱 헬퍼
// 3가지 형태:
// 1. PDF: {"type":"external_pdf","fileUrl":"https://...pdf","title":"..."}
// 2. AI 가이드: {"mood":"bright","scenes":[{"order":1,"dialogue":"...","shooting_tip":"..."},...]}
// 3. 텍스트: 일반 문자열
const parsePersonalizedGuide = (guide) => {
  if (!guide) return { isPdf: false, isAiGuide: false, text: null, pdfUrl: null, title: null, aiData: null }

  let parsed = null

  if (typeof guide === 'object') {
    parsed = guide
  } else if (typeof guide === 'string') {
    const trimmed = guide.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
      try {
        parsed = JSON.parse(trimmed)
        // 이중 인코딩 처리: JSON.parse 결과가 문자열이면 한번 더 파싱
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed) } catch (e2) { /* single string value */ }
        }
      } catch (e) { /* not JSON */ }
    }
    if (!parsed) {
      return { isPdf: false, isAiGuide: false, text: guide, pdfUrl: null, title: null, aiData: null }
    }
  } else {
    return { isPdf: false, isAiGuide: false, text: null, pdfUrl: null, title: null, aiData: null }
  }

  // PDF 가이드
  if (parsed.type === 'external_pdf' && parsed.fileUrl) {
    return { isPdf: true, isAiGuide: false, text: null, pdfUrl: parsed.fileUrl, title: parsed.title || null, aiData: null }
  }
  if (parsed.fileUrl && parsed.fileUrl.endsWith('.pdf')) {
    return { isPdf: true, isAiGuide: false, text: null, pdfUrl: parsed.fileUrl, title: parsed.title || null, aiData: null }
  }

  // AI 가이드 (scenes 배열이 있는 경우)
  if (parsed.scenes && Array.isArray(parsed.scenes)) {
    return { isPdf: false, isAiGuide: true, text: null, pdfUrl: null, title: null, aiData: parsed }
  }

  // 기타 JSON → 텍스트로 표시
  return { isPdf: false, isAiGuide: false, text: JSON.stringify(parsed, null, 2), pdfUrl: null, title: null, aiData: null }
}

// AI 가이드 렌더링 컴포넌트
const AiGuideRenderer = ({ data, language }) => {
  if (!data?.scenes) return null
  const isJa = language === 'ja'

  return (
    <div className="space-y-4">
      {/* 무드/템포 */}
      {(data.mood || data.tempo) && (
        <div className="flex flex-wrap gap-2">
          {data.mood && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              🎨 {isJa ? 'ムード' : '무드'}: {data.mood}
            </span>
          )}
          {data.tempo && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              🎵 {isJa ? 'テンポ' : '템포'}: {data.tempo}
            </span>
          )}
        </div>
      )}

      {/* 씬 목록 */}
      {data.scenes.map((scene, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-bold text-gray-800">
              {isJa ? `シーン ${scene.order || idx + 1}` : `씬 ${scene.order || idx + 1}`}
            </h5>
          </div>

          {/* 대사 */}
          {(scene.dialogue_translated || scene.dialogue) && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">💬 {isJa ? 'セリフ' : '대사'}</p>
              <p className="text-sm text-gray-800 bg-yellow-50 rounded p-2 border-l-3 border-yellow-400">
                {isJa ? (scene.dialogue_translated || scene.dialogue) : scene.dialogue}
              </p>
            </div>
          )}

          {/* 촬영 팁 */}
          {(scene.shooting_tip_translated || scene.shooting_tip) && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">📸 {isJa ? '撮影ポイント' : '촬영 팁'}</p>
              <p className="text-sm text-gray-700 bg-blue-50 rounded p-2">
                {isJa ? (scene.shooting_tip_translated || scene.shooting_tip) : scene.shooting_tip}
              </p>
            </div>
          )}

          {/* 장면 설명 */}
          {(scene.scene_description_translated || scene.scene_description) && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">🎬 {isJa ? 'シーン説明' : '장면 설명'}</p>
              <p className="text-sm text-gray-600">
                {isJa ? (scene.scene_description_translated || scene.scene_description) : scene.scene_description}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// 캠페인 유형 정보 (일본 마이페이지용 - 올리브영 제외)
const CAMPAIGN_TYPES = {
  regular: {
    icon: '📹',
    labelKo: '기획형',
    labelJa: '企画型',
    descKo: '1개 영상 제작',
    descJa: '1本の動画制作',
    steps: 1,
    snsSteps: 1,
    color: 'purple',
    bgClass: 'bg-purple-50 border-purple-200',
    textClass: 'text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-800'
  },
  megawari: {
    icon: '🎯',
    labelKo: '메가와리',
    labelJa: 'メガ割',
    descKo: '영상 2개 + SNS 3개',
    descJa: '動画2本＋SNS3回',
    steps: 2,
    snsSteps: 3,
    color: 'orange',
    bgClass: 'bg-orange-50 border-orange-200',
    textClass: 'text-orange-700',
    badgeClass: 'bg-orange-100 text-orange-800'
  },
  '4week_challenge': {
    icon: '🗓️',
    labelKo: '4주 챌린지',
    labelJa: '4週チャレンジ',
    descKo: '매주 1개씩 총 4개',
    descJa: '毎週1本ずつ計4本',
    steps: 4,
    snsSteps: 4,
    color: 'blue',
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-800'
  }
}

// 워크플로우 스텝: 영상업로드 → 수정확인 → SNS/클린본/광고코드 → 포인트
const WORKFLOW_STEPS = [
  { id: 'video', labelKo: '영상 업로드', labelJa: '動画提出', icon: Upload },
  { id: 'revision', labelKo: '수정 확인', labelJa: '修正確認', icon: AlertCircle },
  { id: 'sns', labelKo: 'SNS/クリーン', labelJa: 'SNS/クリーン', icon: Share2 },
  { id: 'complete', labelKo: '포인트 지급', labelJa: 'ポイント支給', icon: Award }
]

// ── video_submissions ↔ campaign_submissions ステータスマッピング ──
const mapVideoSubStatusToWorkflow = (status) => {
  const map = {
    'submitted': 'video_uploaded',
    'approved': 'sns_pending',
    'revision_requested': 'revision_required',
    'resubmitted': 'video_uploaded',
    'completed': 'points_paid'
  }
  return map[status] || 'guide_pending'
}

const mapWorkflowToVideoSubStatus = (workflowStatus) => {
  const map = {
    'guide_pending': 'submitted',
    'guide_confirmed': 'submitted',
    'video_uploaded': 'submitted',
    'revision_required': 'revision_requested',
    'revision_requested': 'revision_requested',
    'sns_pending': 'approved',
    'sns_submitted': 'completed',
    'review_pending': 'completed',
    'points_paid': 'completed',
    'completed': 'completed'
  }
  return map[workflowStatus] || 'submitted'
}

// video_submissions レコードを campaign_submissions フォーマットに変換
const mapVideoSubToSubmission = (vs) => ({
  id: vs.id,
  application_id: vs.application_id,
  user_id: vs.user_id,
  campaign_id: vs.campaign_id,
  step_number: vs.week_number || vs.video_number || 1,
  step_label: vs.week_number ? `Week ${vs.week_number}` : null,
  workflow_status: mapVideoSubStatusToWorkflow(vs.status),
  video_file_url: vs.video_file_url,
  video_file_name: vs.video_file_name,
  video_file_size: vs.video_file_size,
  video_uploaded_at: vs.video_uploaded_at,
  clean_video_file_url: vs.clean_video_url || vs.clean_video_file_url,
  sns_url: vs.sns_upload_url || vs.sns_url,
  ad_code: vs.ad_code || vs.partnership_code,
  revision_requests: vs.revision_requests || [],
  revision_notes: vs.revision_notes,
  video_versions: vs.version ? [{ version: vs.version, file_url: vs.video_file_url, file_name: vs.video_file_name, uploaded_at: vs.video_uploaded_at }] : [],
  points_amount: vs.points_amount || 0,
  points_paid_at: vs.points_paid_at,
  created_at: vs.created_at,
  updated_at: vs.updated_at,
  _source: 'video_submissions',
  _original: vs
})

// applications データからサブミッション風オブジェクトを構築
const buildSubmissionsFromApplication = (app, campaign) => {
  const campaignType = campaign?.campaign_type || 'regular'
  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const totalSteps = campaign?.total_steps || typeInfo.steps

  const submissions = []
  for (let step = 1; step <= totalSteps; step++) {
    // 4week_challenge: week1_url ~ week4_url
    const videoUrl = campaignType === '4week_challenge'
      ? app[`week${step}_url`]
      : (step === 1 ? app.video_file_url : null)
    const partnershipCode = campaignType === '4week_challenge'
      ? app[`week${step}_partnership_code`]
      : app.partnership_code
    const snsUrl = app.sns_upload_url

    let workflowStatus = 'guide_pending'
    if (app.status === 'completed') workflowStatus = 'points_paid'
    else if (snsUrl && videoUrl) workflowStatus = 'sns_submitted'
    else if (videoUrl) workflowStatus = 'video_uploaded'
    else if (['selected', 'filming', 'approved'].includes(app.status)) workflowStatus = 'guide_pending'

    submissions.push({
      id: `app-${app.id}-step-${step}`,
      application_id: app.id,
      user_id: app.user_id,
      campaign_id: app.campaign_id,
      step_number: step,
      step_label: campaignType === '4week_challenge' ? `Week ${step}` : null,
      workflow_status: workflowStatus,
      video_file_url: videoUrl,
      video_file_name: app.video_file_name,
      video_file_size: app.video_file_size,
      video_uploaded_at: app.video_uploaded_at,
      clean_video_file_url: app.clean_video_file_url || app.clean_video_url,
      sns_url: snsUrl,
      ad_code: app.ad_code || partnershipCode,
      revision_requests: [],
      video_versions: videoUrl ? [{ version: 1, file_url: videoUrl, file_name: app.video_file_name, uploaded_at: app.video_uploaded_at }] : [],
      _source: 'applications',
      _original: app
    })
  }
  return submissions
}

// 마감일 표시 컴포넌트
const DeadlineDisplay = ({ videoDeadline, snsDeadline, language }) => {
  const now = new Date()

  const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    return d.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (date) => {
    if (!date) return null
    const d = new Date(date)
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getDeadlineStatus = (date) => {
    const days = getDaysRemaining(date)
    if (days === null) return 'none'
    if (days < 0) return 'expired'
    if (days <= 3) return 'urgent'
    if (days <= 7) return 'soon'
    return 'normal'
  }

  const videoStatus = getDeadlineStatus(videoDeadline)
  const snsStatus = getDeadlineStatus(snsDeadline)

  if (!videoDeadline && !snsDeadline) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {videoDeadline && (
        <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
          videoStatus === 'expired' ? 'bg-red-100 text-red-700' :
          videoStatus === 'urgent' ? 'bg-orange-100 text-orange-700' :
          videoStatus === 'soon' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          <Upload className="w-3 h-3 mr-1" />
          <span>{language === 'ja' ? '動画:' : '영상:'}</span>
          <span className="font-medium ml-1">{formatDate(videoDeadline)}</span>
          {videoStatus === 'expired' && (
            <span className="ml-1">({language === 'ja' ? '期限切れ' : '마감'})</span>
          )}
          {videoStatus === 'urgent' && (
            <span className="ml-1 font-bold">({getDaysRemaining(videoDeadline)}{language === 'ja' ? '日' : '일'})</span>
          )}
        </div>
      )}
      {snsDeadline && (
        <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
          snsStatus === 'expired' ? 'bg-red-100 text-red-700' :
          snsStatus === 'urgent' ? 'bg-orange-100 text-orange-700' :
          snsStatus === 'soon' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          <Share2 className="w-3 h-3 mr-1" />
          <span>SNS:</span>
          <span className="font-medium ml-1">{formatDate(snsDeadline)}</span>
          {snsStatus === 'expired' && (
            <span className="ml-1">({language === 'ja' ? '期限切れ' : '마감'})</span>
          )}
          {snsStatus === 'urgent' && (
            <span className="ml-1 font-bold">({getDaysRemaining(snsDeadline)}{language === 'ja' ? '日' : '일'})</span>
          )}
        </div>
      )}
    </div>
  )
}

// 전체 마감일 스케줄 표시 컴포넌트
const AllDeadlinesOverview = ({ campaign, campaignType, language }) => {
  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const totalVideoSteps = campaign?.total_steps || typeInfo.steps
  const totalSnsSteps = typeInfo.snsSteps || totalVideoSteps
  const now = new Date()

  const formatDate = (date) => {
    if (!date) return language === 'ja' ? '未定' : '미정'
    return new Date(date).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusClass = (date) => {
    if (!date) return 'bg-gray-50 text-gray-400'
    const d = new Date(date)
    const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'bg-red-50 text-red-600'
    if (days <= 3) return 'bg-orange-50 text-orange-600'
    if (days <= 7) return 'bg-yellow-50 text-yellow-600'
    return 'bg-gray-50 text-gray-700'
  }

  // 마감일 데이터 수집
  const getVideoDeadline = (step) => {
    if (campaign?.step_deadlines) {
      const sd = campaign.step_deadlines.find(d => d.step === step)
      if (sd?.video_deadline) return sd.video_deadline
    }
    if (campaignType === '4week_challenge') {
      const weekField = `week${step}_deadline`
      if (campaign?.[weekField]) return campaign[weekField]
    }
    if (step === 1 && campaign?.video_deadline) return campaign.video_deadline
    return null
  }

  const getSnsDeadline = (step) => {
    if (campaign?.step_deadlines) {
      const sd = campaign.step_deadlines.find(d => d.step === step)
      if (sd?.sns_deadline) return sd.sns_deadline
    }
    if (campaignType === '4week_challenge') {
      const weekField = `week${step}_sns_deadline`
      if (campaign?.[weekField]) return campaign[weekField]
    }
    if (step === 1 && campaign?.sns_deadline) return campaign.sns_deadline
    return null
  }

  const videoDeadlines = Array.from({ length: totalVideoSteps }, (_, i) => ({
    step: i + 1,
    deadline: getVideoDeadline(i + 1)
  }))

  const snsDeadlines = Array.from({ length: totalSnsSteps }, (_, i) => ({
    step: i + 1,
    deadline: getSnsDeadline(i + 1)
  }))

  const getStepLabel = (step, type) => {
    if (campaignType === '4week_challenge') return `Week ${step}`
    if (campaignType === 'megawari') {
      if (type === 'sns' && step > totalVideoSteps) {
        return language === 'ja' ? `SNS ${step}` : `SNS ${step}`
      }
      return `${step}`
    }
    if (totalVideoSteps > 1 || totalSnsSteps > 1) return `${step}`
    return ''
  }

  return (
    <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg">
      <p className="text-xs font-medium text-gray-500 mb-2">
        {language === 'ja' ? '📅 スケジュール' : '📅 스케줄'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* 영상 마감일 */}
        <div>
          <p className="text-xs text-gray-400 mb-1">
            🎬 {language === 'ja' ? '動画締切' : '영상 마감일'}
          </p>
          <div className="space-y-1">
            {videoDeadlines.map(({ step, deadline }) => (
              <div key={`v-${step}`} className={`text-xs px-2 py-1 rounded ${getStatusClass(deadline)}`}>
                {getStepLabel(step, 'video') && <span className="font-medium">{getStepLabel(step, 'video')}: </span>}
                {formatDate(deadline)}
              </div>
            ))}
          </div>
        </div>
        {/* SNS 마감일 */}
        <div>
          <p className="text-xs text-gray-400 mb-1">
            📤 {language === 'ja' ? 'SNS締切' : 'SNS 마감일'}
            {totalSnsSteps > totalVideoSteps && (
              <span className="text-gray-300 ml-1">({totalSnsSteps}{language === 'ja' ? '回' : '회'})</span>
            )}
          </p>
          <div className="space-y-1">
            {snsDeadlines.map(({ step, deadline }) => (
              <div key={`s-${step}`} className={`text-xs px-2 py-1 rounded ${getStatusClass(deadline)}`}>
                {getStepLabel(step, 'sns') && <span className="font-medium">{getStepLabel(step, 'sns')}: </span>}
                {formatDate(deadline)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 가이드 모달 컴포넌트 - 상세 촬영 가이드 표시
const GuideModal = ({ isOpen, onClose, campaign, application, language, stepNumber = 1, campaignType = 'regular' }) => {
  if (!isOpen) return null

  // 4주 챌린지: 주차별 가이드 내용
  const getWeeklyGuideContent = () => {
    if (campaignType !== '4week_challenge') return null

    const weekGuides = {
      1: campaign?.week1_guide_ja || campaign?.week1_guide,
      2: campaign?.week2_guide_ja || campaign?.week2_guide,
      3: campaign?.week3_guide_ja || campaign?.week3_guide,
      4: campaign?.week4_guide_ja || campaign?.week4_guide
    }
    return weekGuides[stepNumber]
  }

  const weeklyGuide = getWeeklyGuideContent()
  const guideUrl = campaign?.shooting_guide_url

  // personalized_guide 파싱 (JSON PDF 가이드 vs 텍스트 가이드)
  const parsedGuide = parsePersonalizedGuide(application?.personalized_guide)

  // 외부 가이드 (PDF/Google Slides) 확인 - campaign 레벨 또는 personalized_guide JSON
  const hasExternalGuide = (campaign?.guide_type === 'pdf' && campaign?.guide_pdf_url) || parsedGuide.isPdf
  const externalGuideUrl = parsedGuide.isPdf ? parsedGuide.pdfUrl : campaign?.guide_pdf_url

  // 텍스트 가이드 콘텐츠
  const guideContent = weeklyGuide || parsedGuide.text || campaign?.shooting_guide_content

  // 주차별 라벨
  const getStepLabel = () => {
    if (campaignType === '4week_challenge') {
      return language === 'ja' ? `Week ${stepNumber}` : `${stepNumber}주차`
    }
    if (campaignType === 'megawari') {
      return language === 'ja' ? `ステップ ${stepNumber}` : `${stepNumber}스텝`
    }
    return null
  }

  const stepLabel = getStepLabel()

  // 촬영 장면 체크리스트
  const shootingScenes = []
  if (campaign?.shooting_scenes_ba_photo) shootingScenes.push({ ko: 'B&A 촬영', ja: 'B&A撮影' })
  if (campaign?.shooting_scenes_no_makeup) shootingScenes.push({ ko: '노메이크업', ja: 'ノーメイク' })
  if (campaign?.shooting_scenes_closeup) shootingScenes.push({ ko: '클로즈업', ja: 'クローズアップ' })
  if (campaign?.shooting_scenes_product_closeup) shootingScenes.push({ ko: '제품 클로즈업', ja: '製品クローズアップ' })
  if (campaign?.shooting_scenes_product_texture) shootingScenes.push({ ko: '제품 제형', ja: '製品テクスチャー' })
  if (campaign?.shooting_scenes_outdoor) shootingScenes.push({ ko: '외부 촬영', ja: '屋外撮影' })
  if (campaign?.shooting_scenes_couple) shootingScenes.push({ ko: '커플 출연', ja: 'カップル出演' })
  if (campaign?.shooting_scenes_child) shootingScenes.push({ ko: '아이 출연', ja: 'お子様出演' })
  if (campaign?.shooting_scenes_troubled_skin) shootingScenes.push({ ko: '트러블 피부', ja: '肌トラブル' })
  if (campaign?.shooting_scenes_wrinkles) shootingScenes.push({ ko: '주름', ja: 'シワ' })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            {language === 'ja' ? '撮影ガイド' : '촬영 가이드'}
            {stepLabel && (
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-sm rounded-full">
                {stepLabel}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] space-y-4 sm:space-y-6">
          {/* 캠페인 기본 정보 */}
          <div className="pb-4 border-b border-gray-100">
            <h4 className="font-bold text-lg text-gray-900">{campaign?.title}</h4>
            <p className="text-sm text-purple-600 font-medium">{campaign?.brand_name_ja || campaign?.brand}</p>
          </div>

          {/* 제품 정보 */}
          {(campaign?.product_name_ja || campaign?.product_description_ja) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                📦 {language === 'ja' ? '製品情報' : '제품 정보'}
              </h5>
              {campaign?.product_name_ja && (
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">{language === 'ja' ? '製品名:' : '제품명:'}</span> {campaign.product_name_ja}
                </p>
              )}
              {campaign?.product_description_ja && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.product_description_ja}</p>
              )}
              {campaign?.product_features_ja?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {language === 'ja' ? '製品の特徴:' : '제품 특징:'}
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {campaign.product_features_ja.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 필수 대사 */}
          {campaign?.required_dialogues_ja?.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                💬 {language === 'ja' ? '必須セリフ' : '필수 대사'}
              </h5>
              <ol className="list-decimal list-inside space-y-2">
                {campaign.required_dialogues_ja.map((line, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="bg-white px-2 py-1 rounded border border-yellow-200 ml-1">"{line}"</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 필수 장면 */}
          {campaign?.required_scenes_ja?.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                🎥 {language === 'ja' ? '必須シーン' : '필수 장면'}
              </h5>
              <ol className="list-decimal list-inside space-y-2">
                {campaign.required_scenes_ja.map((scene, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{scene}</li>
                ))}
              </ol>
            </div>
          )}

          {/* 필수 해시태그 */}
          {campaign?.required_hashtags_ja?.length > 0 && (
            <div className="bg-pink-50 rounded-lg p-4">
              <h5 className="font-semibold text-pink-800 mb-3 flex items-center">
                #️⃣ {language === 'ja' ? '必須ハッシュタグ' : '필수 해시태그'}
              </h5>
              <div className="flex flex-wrap gap-2">
                {campaign.required_hashtags_ja.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-pink-700 border border-pink-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 영상 사양 */}
          {(campaign?.video_duration_ja || campaign?.video_tempo_ja || campaign?.video_tone_ja) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-semibold text-purple-800 mb-3 flex items-center">
                🎬 {language === 'ja' ? '動画仕様' : '영상 사양'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {campaign?.video_duration_ja && (
                  <div className="bg-white rounded p-2 border border-purple-200">
                    <p className="text-xs text-gray-500">{language === 'ja' ? '長さ' : '길이'}</p>
                    <p className="text-sm font-medium text-gray-800">{campaign.video_duration_ja}</p>
                  </div>
                )}
                {campaign?.video_tempo_ja && (
                  <div className="bg-white rounded p-2 border border-purple-200">
                    <p className="text-xs text-gray-500">{language === 'ja' ? 'テンポ' : '템포'}</p>
                    <p className="text-sm font-medium text-gray-800">{campaign.video_tempo_ja}</p>
                  </div>
                )}
                {campaign?.video_tone_ja && (
                  <div className="bg-white rounded p-2 border border-purple-200">
                    <p className="text-xs text-gray-500">{language === 'ja' ? 'トーン' : '톤'}</p>
                    <p className="text-sm font-medium text-gray-800">{campaign.video_tone_ja}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 필수 촬영 장면 체크리스트 */}
          {shootingScenes.length > 0 && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h5 className="font-semibold text-indigo-800 mb-3 flex items-center">
                📷 {language === 'ja' ? '必須撮影シーン' : '필수 촬영 장면'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shootingScenes.map((scene, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {language === 'ja' ? scene.ja : scene.ko}
                  </div>
                ))}
              </div>
              {campaign?.shooting_scenes_ja?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {campaign.shooting_scenes_ja.map((scene, idx) => (
                      <li key={idx}>{scene}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 추가 요청사항 */}
          {(campaign?.additional_details_ja || campaign?.additional_shooting_requests_ja) && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h5 className="font-semibold text-orange-800 mb-3 flex items-center">
                📝 {language === 'ja' ? '追加リクエスト' : '추가 요청사항'}
              </h5>
              {campaign?.additional_details_ja && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{campaign.additional_details_ja}</p>
              )}
              {campaign?.additional_shooting_requests_ja && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.additional_shooting_requests_ja}</p>
              )}
            </div>
          )}

          {/* 특별 요청 배지 */}
          {(campaign?.meta_ad_code_requested || campaign?.requires_clean_video) && (
            <div className="flex flex-wrap gap-2">
              {campaign?.meta_ad_code_requested && (
                <span className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium flex items-center">
                  📱 {language === 'ja' ? 'Metaパートナーシップコード必要' : '메타 광고코드 필요'}
                </span>
              )}
              {campaign?.requires_clean_video && (
                <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium flex items-center">
                  🎞️ {language === 'ja' ? 'クリーン動画必要' : '클린 영상 필요'}
                </span>
              )}
            </div>
          )}

          {/* 외부 가이드 (PDF/Google Slides) - 최우선 표시 */}
          {hasExternalGuide && externalGuideUrl && (
            <ExternalGuideViewer
              url={externalGuideUrl}
              language={language}
            />
          )}

          {/* AI 가이드 (scenes 배열) */}
          {!hasExternalGuide && parsedGuide.isAiGuide && parsedGuide.aiData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-800 mb-3">
                {language === 'ja' ? '詳細ガイド' : '상세 가이드'}
              </h5>
              <AiGuideRenderer data={parsedGuide.aiData} language={language} />
            </div>
          )}

          {/* 텍스트 가이드 - PDF/AI 가이드가 없는 경우 */}
          {!hasExternalGuide && !parsedGuide.isAiGuide && guideContent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-800 mb-3">
                {language === 'ja' ? '詳細ガイド' : '상세 가이드'}
              </h5>
              <div className="bg-white rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700 border border-gray-200">
                {guideContent}
              </div>
            </div>
          )}

          {/* 외부 가이드 링크 */}
          {!hasExternalGuide && guideUrl && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                {language === 'ja' ? '詳細ガイドリンク:' : '상세 가이드 링크:'}
              </p>
              <a
                href={guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:underline font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {language === 'ja' ? 'ガイドを開く' : '가이드 열기'}
              </a>
            </div>
          )}

          {/* Google Drive/Slides 링크 */}
          {(application?.google_drive_url || application?.google_slides_url) && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                {language === 'ja' ? '資料リンク:' : '자료 링크:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {application?.google_drive_url && (
                  <a
                    href={application.google_drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-green-200 rounded-lg text-green-700 hover:bg-green-100 text-sm"
                  >
                    📁 Google Drive
                  </a>
                )}
                {application?.google_slides_url && (
                  <a
                    href={application.google_slides_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-green-200 rounded-lg text-green-700 hover:bg-green-100 text-sm"
                  >
                    📊 Google Slides
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            {language === 'ja' ? '閉じる' : '닫기'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 수정 요청사항 표시 컴포넌트
const RevisionRequestsSection = ({ revisionRequests, language }) => {
  const [translations, setTranslations] = useState({})
  const [loadingTranslations, setLoadingTranslations] = useState({})

  // AI 번역 함수 (Gemini API)
  const translateToJapanese = async (text, index) => {
    if (translations[index]) return

    setLoadingTranslations(prev => ({ ...prev, [index]: true }))
    try {
      // 간단한 번역 처리 - 실제로는 API 호출 필요
      // 여기서는 텍스트를 그대로 표시 (API 연동 시 교체)
      setTranslations(prev => ({ ...prev, [index]: text }))
    } catch (error) {
      console.error('Translation error:', error)
      setTranslations(prev => ({ ...prev, [index]: text }))
    } finally {
      setLoadingTranslations(prev => ({ ...prev, [index]: false }))
    }
  }

  useEffect(() => {
    if (revisionRequests?.length > 0) {
      revisionRequests.forEach((req, idx) => {
        if (!req.comment_ja && req.comment) {
          translateToJapanese(req.comment, idx)
        }
      })
    }
  }, [revisionRequests])

  if (!revisionRequests || revisionRequests.length === 0) return null

  return (
    <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
      <h4 className="font-semibold text-red-800 mb-3 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-2" />
        {language === 'ja' ? '修正リクエスト' : '수정 요청사항'}
        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
          {revisionRequests.length}
        </span>
      </h4>

      <div className="space-y-3">
        {revisionRequests.map((request, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border border-red-100 shadow-sm">
            {/* 한국어 원문 */}
            <div className="mb-3">
              <div className="flex items-center text-xs font-medium text-gray-500 mb-1">
                <span className="mr-1">🇰🇷</span>
                <span>{language === 'ja' ? '原文 (Korean)' : '원문 (Original)'}</span>
              </div>
              <p className="text-sm text-gray-800 bg-gray-50 rounded p-2">
                {request.comment}
              </p>
            </div>

            {/* 구분선 */}
            <hr className="border-dashed border-gray-200 my-2" />

            {/* 일본어 번역 */}
            <div>
              <div className="flex items-center text-xs font-medium text-gray-500 mb-1">
                <span className="mr-1">🇯🇵</span>
                <span>{language === 'ja' ? '日本語訳' : '일본어 번역'}</span>
              </div>
              {request.comment_ja ? (
                <p className="text-sm text-gray-800 bg-blue-50 rounded p-2">
                  {request.comment_ja}
                </p>
              ) : loadingTranslations[idx] ? (
                <p className="text-sm text-gray-400 italic bg-gray-50 rounded p-2">
                  {language === 'ja' ? '翻訳中...' : '번역 중...'}
                </p>
              ) : translations[idx] ? (
                <p className="text-sm text-gray-800 bg-blue-50 rounded p-2">
                  {translations[idx]}
                </p>
              ) : (
                <p className="text-sm text-gray-800 bg-blue-50 rounded p-2">
                  {request.comment}
                </p>
              )}
            </div>

            {/* 날짜 */}
            <div className="mt-2 text-right">
              <time className="text-xs text-gray-400">
                {new Date(request.created_at).toLocaleString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 개별 스텝 카드
const StepCard = ({
  stepNumber,
  totalSteps,
  campaignType,
  submission,
  campaign,
  application,
  onUpdate,
  language,
  hasVideoUpload = true,
  hasSnsUpload = true,
  submissionTable = 'campaign_submissions'
}) => {
  const [expanded, setExpanded] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [snsUrl, setSnsUrl] = useState(submission?.sns_url || '')
  const [adCode, setAdCode] = useState(submission?.ad_code || '')
  const [submitting, setSubmitting] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  // 영상 업로드 모드: 'file' 또는 'url'
  const [uploadMode, setUploadMode] = useState('url')

  // URL 입력 상태 (DB 스키마: video_file_url, clean_video_file_url, ad_code)
  const [videoUrl, setVideoUrl] = useState(submission?.video_file_url || '')
  const [cleanVideoUrl, setCleanVideoUrl] = useState(submission?.clean_video_file_url || '')
  const [partnershipCode, setPartnershipCode] = useState(submission?.ad_code || '')

  const videoInputRef = useRef(null)
  const cleanVideoInputRef = useRef(null)
  const [videoFile, setVideoFile] = useState(null)
  const [cleanVideoFile, setCleanVideoFile] = useState(null)

  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const status = submission?.workflow_status || 'guide_pending'

  // ── デュアルテーブル保存ヘルパー ──
  // campaign_submissions / video_submissions / applications を使い分ける
  const saveSubmission = async (data, isNew = false) => {
    const submissionId = submission?.id
    const isRealId = submissionId && !submissionId.startsWith('temp-') && !submissionId.startsWith('app-')

    if (submissionTable === 'campaign_submissions') {
      if (isRealId && !isNew) {
        const { error } = await supabase.from('campaign_submissions').update(data).eq('id', submissionId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('campaign_submissions').insert({
          application_id: application.id,
          user_id: application.user_id,
          campaign_id: application.campaign_id,
          step_number: stepNumber,
          step_label: getStepLabel(),
          ...data
        })
        if (error) throw error
      }
    } else if (submissionTable === 'video_submissions') {
      // video_submissions テーブルへのマッピング
      const vsData = {
        video_number: stepNumber,
        week_number: campaignType === '4week_challenge' ? stepNumber : null,
        version: (data.video_versions?.length || 0) + 1,
        video_file_url: data.video_file_url,
        video_file_name: data.video_file_name,
        video_file_size: data.video_file_size,
        video_uploaded_at: data.video_uploaded_at,
        clean_video_url: data.clean_video_file_url,
        sns_upload_url: data.sns_url,
        ad_code: data.ad_code,
        partnership_code: data.ad_code,
        status: mapWorkflowToVideoSubStatus(data.workflow_status),
        updated_at: new Date().toISOString()
      }
      // Remove undefined values
      Object.keys(vsData).forEach(k => vsData[k] === undefined && delete vsData[k])

      if (isRealId && !isNew) {
        const { error } = await supabase.from('video_submissions').update(vsData).eq('id', submissionId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('video_submissions').insert({
          application_id: application.id,
          user_id: application.user_id,
          campaign_id: application.campaign_id,
          ...vsData,
          submitted_at: new Date().toISOString()
        })
        if (error) throw error
      }
    }

    // ── 常に applications テーブルも同期 ──
    try {
      const appUpdate = { updated_at: new Date().toISOString() }
      if (data.video_file_url) {
        if (campaignType === '4week_challenge') {
          appUpdate[`week${stepNumber}_url`] = data.video_file_url
        } else {
          appUpdate.video_file_url = data.video_file_url
          if (data.video_file_name) appUpdate.video_file_name = data.video_file_name
          if (data.video_file_size) appUpdate.video_file_size = data.video_file_size
          if (data.video_uploaded_at) appUpdate.video_uploaded_at = data.video_uploaded_at
        }
      }
      if (data.clean_video_file_url) {
        appUpdate.clean_video_file_url = data.clean_video_file_url
      }
      if (data.sns_url) {
        appUpdate.sns_upload_url = data.sns_url
      }
      if (data.ad_code) {
        appUpdate.partnership_code = data.ad_code
        appUpdate.ad_code = data.ad_code
        if (campaignType === '4week_challenge') {
          appUpdate[`week${stepNumber}_partnership_code`] = data.ad_code
        }
      }
      if (data.workflow_status === 'video_uploaded') {
        appUpdate.status = 'video_submitted'
      } else if (data.workflow_status === 'sns_submitted') {
        appUpdate.submission_status = 'sns_submitted'
      }
      await supabase.from('applications').update(appUpdate).eq('id', application.id)
    } catch (syncErr) {
      console.warn('Applications sync warning:', syncErr.message)
    }
  }

  // 스텝별 마감일 가져오기
  const getStepDeadlines = () => {
    // submission에서 먼저 확인
    if (submission?.video_deadline || submission?.sns_deadline) {
      return {
        videoDeadline: submission.video_deadline,
        snsDeadline: submission.sns_deadline
      }
    }

    // 4주 챌린지: 주차별 마감일 필드 사용
    if (campaignType === '4week_challenge') {
      const weekDeadlines = {
        1: { video: campaign?.week1_deadline, sns: campaign?.week1_sns_deadline },
        2: { video: campaign?.week2_deadline, sns: campaign?.week2_sns_deadline },
        3: { video: campaign?.week3_deadline, sns: campaign?.week3_sns_deadline },
        4: { video: campaign?.week4_deadline, sns: campaign?.week4_sns_deadline }
      }
      if (weekDeadlines[stepNumber]) {
        return {
          videoDeadline: weekDeadlines[stepNumber].video,
          snsDeadline: weekDeadlines[stepNumber].sns
        }
      }
    }

    // 기획형/메가와리: 기본 마감일 사용
    if (campaign?.video_deadline || campaign?.sns_deadline) {
      return {
        videoDeadline: campaign.video_deadline,
        snsDeadline: campaign.sns_deadline
      }
    }

    // campaign의 step_deadlines 배열에서 확인
    if (campaign?.step_deadlines) {
      const stepDeadline = campaign.step_deadlines.find(d => d.step === stepNumber)
      if (stepDeadline) {
        return {
          videoDeadline: stepDeadline.video_deadline,
          snsDeadline: stepDeadline.sns_deadline
        }
      }
    }

    return { videoDeadline: null, snsDeadline: null }
  }

  const { videoDeadline, snsDeadline } = getStepDeadlines()

  // 스텝 라벨
  const getStepLabel = () => {
    if (campaignType === '4week_challenge') {
      return language === 'ja' ? `Week ${stepNumber}` : `${stepNumber}주차`
    }
    if (campaignType === 'megawari') {
      if (!hasVideoUpload) {
        return language === 'ja' ? `SNS ${stepNumber}` : `SNS ${stepNumber}`
      }
      return language === 'ja' ? `ステップ ${stepNumber}` : `${stepNumber}스텝`
    }
    return null
  }

  // 현재 워크플로우 단계
  // 영상 있는 스텝: 영상업로드(1) → 수정확인(2) → SNS/클린본/광고코드(3) → 포인트(4)
  // SNS only 스텝 (메가와리 3번째): SNS제출(3) → 포인트(4) (영상/수정 스킵)
  const getCurrentStep = () => {
    if (status === 'points_paid' || status === 'completed') return 4
    if (status === 'sns_submitted' || status === 'review_pending') return 4
    if (status === 'sns_pending') return 3
    if (!hasVideoUpload) return 3 // SNS only 스텝은 바로 SNS 제출 단계
    if (status === 'video_uploaded') return 2
    if (status === 'revision_required' || status === 'revision_requested') return 2
    return 1 // 영상 업로드
  }

  // 영상 버전 계산 (v1, v2, v3...)
  const getVideoVersion = () => {
    const path = submission?.video_file_path || ''
    const match = path.match(/_v(\d+)_/)
    return match ? parseInt(match[1]) : (submission?.video_file_url ? 1 : 0)
  }

  // 수정 요청 확인
  const hasRevisionRequests = submission?.revision_requests?.length > 0 || application?.revision_requests?.length > 0

  // 가이드 확인 처리
  const handleGuideConfirm = async () => {
    setSubmitting(true)
    try {
      await saveSubmission({
        workflow_status: 'guide_confirmed',
        video_deadline: videoDeadline,
        sns_deadline: snsDeadline,
        updated_at: new Date().toISOString()
      }, true)
      onUpdate?.()
    } catch (error) {
      console.error('Guide confirm error:', error)
      alert(language === 'ja' ? 'エラーが発生しました' : '오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e, isClean = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert(language === 'ja' ? 'ファイルサイズは2GB以下にしてください' : '파일 크기는 2GB 이하여야 합니다')
      return
    }
    if (isClean) {
      setCleanVideoFile(file)
    } else {
      setVideoFile(file)
    }
  }

  // 영상 업로드 처리
  const handleVideoUpload = async () => {
    if (!videoFile) return
    setUploading(true)
    setUploadProgress(0)

    try {
      const timestamp = Date.now()
      const userId = application.user_id
      const getExt = (name) => {
        const dot = name.lastIndexOf('.')
        return dot >= 0 ? name.substring(dot) : ''
      }
      const nextVersion = getVideoVersion() + 1
      const videoPath = `${userId}/${application.campaign_id}/${submission?.id || 'new'}/${timestamp}_v${nextVersion}_main${getExt(videoFile.name)}`

      const { error: uploadError } = await supabase.storage
        .from('campaign-videos')
        .upload(videoPath, videoFile, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      setUploadProgress(50)

      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('campaign-videos')
        .getPublicUrl(videoPath)

      let cleanVideoUrl = null
      if (cleanVideoFile) {
        const cleanVideoPath = `${userId}/${application.campaign_id}/${submission?.id || 'new'}/${timestamp}_clean${getExt(cleanVideoFile.name)}`
        const { error: cleanError } = await supabase.storage
          .from('campaign-videos')
          .upload(cleanVideoPath, cleanVideoFile, { cacheControl: '3600', upsert: false })
        if (cleanError) throw cleanError
        const { data: { publicUrl } } = supabase.storage
          .from('campaign-videos')
          .getPublicUrl(cleanVideoPath)
        cleanVideoUrl = publicUrl
      }

      setUploadProgress(80)

      const existingVersions = Array.isArray(submission?.video_versions) ? submission.video_versions : []
      const newVersionEntry = {
        version: nextVersion,
        file_path: videoPath,
        file_url: videoUrl,
        file_name: videoFile.name,
        file_size: videoFile.size,
        uploaded_at: new Date().toISOString()
      }
      const updatedVersions = [...existingVersions, newVersionEntry]

      const preserveStatus = ['sns_pending', 'sns_submitted', 'review_pending'].includes(status)
      const newStatus = preserveStatus ? status : 'video_uploaded'

      await saveSubmission({
        workflow_status: newStatus,
        video_file_path: videoPath,
        video_file_url: videoUrl,
        video_file_name: videoFile.name,
        video_file_size: videoFile.size,
        video_uploaded_at: new Date().toISOString(),
        clean_video_file_url: cleanVideoUrl,
        clean_video_file_name: cleanVideoFile?.name,
        video_versions: updatedVersions,
        video_deadline: videoDeadline,
        sns_deadline: snsDeadline,
        updated_at: new Date().toISOString()
      })

      setUploadProgress(100)
      setVideoFile(null)
      setCleanVideoFile(null)
      onUpdate?.()
    } catch (error) {
      console.error('Upload error:', error)
      alert(language === 'ja' ? 'アップロードに失敗しました' : '업로드에 실패했습니다')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Step 3: SNS + 클린본 + 광고코드 제출
  const handleVideoUrlSubmit = async () => {
    if (!snsUrl.trim()) {
      alert(language === 'ja' ? 'SNS投稿URLを入力してください' : 'SNS 게시물 URL을 입력해주세요')
      return
    }
    if (campaign?.requires_clean_video && !cleanVideoFile && !submission?.clean_video_file_url) {
      alert(language === 'ja' ? 'クリーン動画ファイルを選択してください' : '클린본 파일을 선택해주세요')
      return
    }

    setSubmitting(true)
    try {
      let uploadedCleanUrl = submission?.clean_video_file_url || null
      if (cleanVideoFile) {
        const timestamp = Date.now()
        const userId = application.user_id
        const getExt = (name) => { const dot = name.lastIndexOf('.'); return dot >= 0 ? name.substring(dot) : '' }
        const cleanPath = `${userId}/${application.campaign_id}/${submission?.id || 'new'}/${timestamp}_clean${getExt(cleanVideoFile.name)}`
        const { error: cleanUploadError } = await supabase.storage
          .from('campaign-videos')
          .upload(cleanPath, cleanVideoFile, { cacheControl: '3600', upsert: false })
        if (cleanUploadError) throw cleanUploadError
        const { data: { publicUrl } } = supabase.storage
          .from('campaign-videos')
          .getPublicUrl(cleanPath)
        uploadedCleanUrl = publicUrl
      }

      await saveSubmission({
        workflow_status: 'sns_submitted',
        sns_url: snsUrl,
        sns_submitted_at: new Date().toISOString(),
        clean_video_file_url: uploadedCleanUrl,
        clean_video_file_name: cleanVideoFile?.name || null,
        ad_code: partnershipCode || null,
        updated_at: new Date().toISOString()
      })

      onUpdate?.()
      alert(language === 'ja' ? 'SNS・クリーン動画・広告コードを提出しました！' : 'SNS/클린본/광고코드를 제출했습니다!')
    } catch (error) {
      console.error('Video URL submit error:', error)
      alert(language === 'ja' ? '提出に失敗しました' : '제출에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  // SNS URL 제출
  const handleSnsSubmit = async () => {
    if (!snsUrl.trim()) {
      alert(language === 'ja' ? 'SNS URLを入力してください' : 'SNS URL을 입력해주세요')
      return
    }

    setSubmitting(true)
    try {
      let platform = 'other'
      if (snsUrl.includes('instagram.com')) platform = 'instagram'
      else if (snsUrl.includes('tiktok.com')) platform = 'tiktok'
      else if (snsUrl.includes('youtube.com') || snsUrl.includes('youtu.be')) platform = 'youtube'

      await saveSubmission({
        sns_platform: platform,
        sns_url: snsUrl,
        ad_code: adCode,
        sns_uploaded_at: new Date().toISOString(),
        workflow_status: 'sns_submitted',
        video_deadline: videoDeadline,
        sns_deadline: snsDeadline,
        updated_at: new Date().toISOString()
      })
      onUpdate?.()
    } catch (error) {
      console.error('SNS submit error:', error)
      alert(language === 'ja' ? '提出に失敗しました' : '제출에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const stepLabel = getStepLabel()
  const currentStep = getCurrentStep()

  return (
    <>
      <div className={`border rounded-lg overflow-hidden ${
        status === 'points_paid' ? 'bg-green-50 border-green-200' :
        status === 'completed' ? 'bg-blue-50 border-blue-200' :
        'bg-white border-gray-200'
      }`}>
        {/* 헤더 */}
        <div
          className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                status === 'points_paid' ? 'bg-green-500 text-white' :
                status === 'completed' ? 'bg-blue-500 text-white' :
                currentStep > 1 ? 'bg-purple-500 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {status === 'points_paid' || status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {stepLabel && (
                    <span className={`text-sm font-semibold ${typeInfo.textClass}`}>
                      {stepLabel}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    status === 'points_paid' ? 'bg-green-100 text-green-800' :
                    status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    (status === 'revision_required' || status === 'revision_requested') ? 'bg-red-100 text-red-800' :
                    status === 'sns_submitted' ? 'bg-indigo-100 text-indigo-800' :
                    status === 'video_uploaded' ? 'bg-cyan-100 text-cyan-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {status === 'points_paid' ? (language === 'ja' ? 'ポイント支給済み' : '포인트 지급완료') :
                     status === 'completed' ? (language === 'ja' ? '完了' : '완료') :
                     (status === 'revision_required' || status === 'revision_requested') ? (language === 'ja' ? '修正必要' : '수정 필요') :
                     status === 'sns_submitted' ? (language === 'ja' ? 'SNS提出済み' : 'SNS 제출완료') :
                     status === 'sns_pending' ? (language === 'ja' ? 'SNS提出待ち' : 'SNS 제출 대기') :
                     status === 'video_uploaded' ? (language === 'ja' ? '修正確認中' : '수정 확인중') :
                     !hasVideoUpload ? (language === 'ja' ? 'SNS提出待ち' : 'SNS 제출 대기') :
                     (language === 'ja' ? '動画提出待ち' : '영상 제출 대기')}
                  </span>
                  {/* 수정 요청 알림 배지 */}
                  {hasRevisionRequests && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                      ⚠️ {language === 'ja' ? '修正リクエストあり' : '수정 요청 있음'}
                    </span>
                  )}
                </div>

                {/* 마감일 표시 */}
                <DeadlineDisplay
                  videoDeadline={videoDeadline}
                  snsDeadline={snsDeadline}
                  language={language}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1">
              {WORKFLOW_STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    currentStep > idx ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* 확장 컨텐츠 */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4">
            {/* 워크플로우 타임라인 */}
            <div className="flex items-center justify-between mb-6 px-2">
              {(() => {
                // SNS only 스텝 (메가와리 3번째 등): 영상/수정 생략
                const steps = hasVideoUpload
                  ? WORKFLOW_STEPS
                  : WORKFLOW_STEPS.filter(s => s.id === 'sns' || s.id === 'complete')
                const getStepIdx = (stepId) => {
                  if (!hasVideoUpload) {
                    if (stepId === 'sns') return 3
                    if (stepId === 'complete') return 4
                  }
                  return WORKFLOW_STEPS.findIndex(s => s.id === stepId) + 1
                }
                return steps.map((step, idx) => {
                  const Icon = step.icon
                  const stepIdx = getStepIdx(step.id)
                  const isActive = currentStep > stepIdx - 1
                  const isCurrent = currentStep === stepIdx
                  return (
                    <React.Fragment key={step.id}>
                      <div className={`flex flex-col items-center ${
                        isActive ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs mt-1 text-center">
                          {language === 'ja' ? step.labelJa : step.labelKo}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${
                          isActive ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </React.Fragment>
                  )
                })
              })()}
            </div>

            {/* Step 1: 영상 업로드 */}
            {currentStep === 1 && (
              <div className="bg-blue-50 rounded-lg p-4">
                {/* 경고: SNS 미리 업로드 금지 */}
                <div className="mb-4 p-3 bg-red-50 rounded-lg border-2 border-red-300">
                  <p className="text-sm font-bold text-red-700 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {language === 'ja'
                      ? '⛔ SNSへの事前アップロード絶対禁止！修正確認後にアップロードしてください'
                      : '⛔ SNS 미리 업로드 절대 금지! 수정사항 체크 후 업로드하세요'}
                  </p>
                </div>

                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  {language === 'ja' ? '編集済み動画をアップロードしてください' : '편집본 영상을 업로드해주세요'}
                </h4>

                {/* ガイド確認ボタン */}
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="w-full mb-4 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center shadow-sm"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {language === 'ja' ? '📖 撮影ガイドを確認する' : '📖 촬영 가이드 확인하기'}
                </button>

                {/* 파일 업로드 (메인) */}
                <div className="space-y-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                  />
                  <div
                    onClick={() => !uploading && videoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      videoFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {videoFile ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Film className="w-6 h-6 text-blue-500" />
                        <span className="text-sm text-gray-700">{videoFile.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setVideoFile(null) }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">{language === 'ja' ? 'クリックして編集済み動画を選択' : '클릭하여 편집본 영상 선택'}</p>
                        <p className="text-xs mt-1">{language === 'ja' ? '最大2GB' : '최대 2GB'}</p>
                      </div>
                    )}
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-center text-xs text-gray-500">{uploadProgress}%</p>
                    </div>
                  )}

                  {videoFile && !uploading && (
                    <button
                      onClick={handleVideoUpload}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'ja'
                        ? `v${getVideoVersion() + 1} 動画をアップロード`
                        : `v${getVideoVersion() + 1} 영상 업로드`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: 수정 확인 */}
            {currentStep === 2 && (
              <div className="bg-orange-50 rounded-lg p-4">
                {/* 경고: SNS 미리 업로드 금지 */}
                <div className="mb-4 p-3 bg-red-50 rounded-lg border-2 border-red-300">
                  <p className="text-sm font-bold text-red-700 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {language === 'ja'
                      ? '⛔ SNSへの事前アップロード絶対禁止！修正確認後にアップロードしてください'
                      : '⛔ SNS 미리 업로드 절대 금지! 수정사항 체크 후 업로드하세요'}
                  </p>
                </div>

                <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {(status === 'revision_required' || status === 'revision_requested')
                    ? (language === 'ja' ? '修正リクエストがあります → 再アップロードしてください' : '수정 요청이 있습니다 → 재업로드 해주세요')
                    : (language === 'ja' ? '修正確認中です（担当者がレビュー中）' : '수정 확인 중입니다 (담당자 검토 중)')
                  }
                </h4>

                {/* 수정 요청사항 표시 */}
                {(submission?.revision_requests?.length > 0 || application?.revision_requests?.length > 0) && (
                  <RevisionRequestsSection
                    revisionRequests={submission?.revision_requests || application?.revision_requests}
                    language={language}
                  />
                )}

                {status === 'revision_required' && submission?.revision_notes && !submission?.revision_requests?.length && (
                  <div className="mb-4 bg-red-100 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <p className="font-medium mb-1">{language === 'ja' ? '修正内容:' : '수정 내용:'}</p>
                    {submission.revision_notes}
                  </div>
                )}

                {/* ガイド確認ボタン */}
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="w-full mt-4 px-4 py-2.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg font-medium hover:bg-purple-200 flex items-center justify-center"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {language === 'ja' ? '📖 撮影ガイドを確認する' : '📖 촬영 가이드 확인하기'}
                </button>
              </div>
            )}

            {/* Step 3: SNS + 클린본 + 광고코드 */}
            {currentStep === 3 && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-3 flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  {language === 'ja' ? 'SNS投稿 / クリーン動画 / 広告コードを提出' : 'SNS 게시 / 클린본 / 광고코드 제출'}
                </h4>

                <p className="text-sm text-green-700 mb-4 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {language === 'ja'
                    ? '動画の修正確認が完了しました。SNSにアップロードしてください。'
                    : '영상 수정 확인이 완료되었습니다. SNS에 업로드해주세요.'}
                </p>

                <div className="space-y-4">
                  {/* SNS URL */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {language === 'ja' ? 'SNS投稿URL' : 'SNS 게시물 URL'} *
                    </label>
                    <input
                      type="url"
                      value={snsUrl}
                      onChange={(e) => setSnsUrl(e.target.value)}
                      placeholder="https://www.instagram.com/reel/... or https://www.tiktok.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ja'
                        ? 'Instagram、TikTok、YouTube等のSNS投稿リンク'
                        : 'Instagram, TikTok, YouTube 등 SNS 게시물 링크'}
                    </p>
                  </div>

                  {/* 클린본 파일 업로드 */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {language === 'ja' ? 'クリーン動画（字幕/BGMなし）' : '클린본 (자막/BGM 없는 버전)'}
                      <span className={`ml-1 ${campaign?.requires_clean_video ? 'text-red-500' : 'text-gray-400'}`}>
                        ({campaign?.requires_clean_video
                          ? (language === 'ja' ? '必須' : '필수')
                          : (language === 'ja' ? '任意' : '선택')
                        })
                      </span>
                    </label>
                    <input
                      ref={cleanVideoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setCleanVideoFile(e.target.files[0])
                      }}
                      className="hidden"
                    />
                    <div
                      onClick={() => cleanVideoInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        cleanVideoFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {cleanVideoFile ? (
                        <div className="flex items-center justify-center space-x-3">
                          <FileVideo className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">{cleanVideoFile.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCleanVideoFile(null) }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ) : submission?.clean_video_file_url ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">{language === 'ja' ? 'アップロード済み（再選択で上書き）' : '업로드됨 (재선택시 덮어쓰기)'}</span>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">
                          <Upload className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                          {language === 'ja' ? 'クリックしてクリーン動画を選択' : '클릭하여 클린본 선택'}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ja' ? 'BGMや字幕なしのオリジナル動画ファイル' : 'BGM, 자막이 없는 원본 영상 파일'}
                    </p>
                  </div>

                  {/* 광고코드 */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      {language === 'ja' ? '広告コード' : '광고 코드'}
                      <span className="text-gray-400 ml-1">
                        ({campaign?.meta_ad_code_requested
                          ? (language === 'ja' ? '必須' : '필수')
                          : (language === 'ja' ? '任意' : '선택')
                        })
                      </span>
                    </label>
                    <input
                      type="text"
                      value={partnershipCode}
                      onChange={(e) => setPartnershipCode(e.target.value)}
                      placeholder="adcode-Q9jTBBAen2L45CCA8KP_..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ja'
                        ? 'Meta パートナーシップ / TikTok Spark Ads / YouTube広告共有コード'
                        : 'Meta 파트너십 / TikTok Spark Ads / YouTube 광고 공유 코드'}
                    </p>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    onClick={handleVideoUrlSubmit}
                    disabled={submitting || !snsUrl.trim()}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4 mr-2" />
                    )}
                    {language === 'ja' ? 'SNS・クリーン動画・広告コードを提出' : 'SNS/클린본/광고코드 제출'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: 완료 */}
            {currentStep === 4 && (
              <div className={`rounded-lg p-4 ${
                status === 'points_paid' ? 'bg-green-100' : 'bg-yellow-50'
              }`}>
                <h4 className={`font-medium mb-3 flex items-center ${
                  status === 'points_paid' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {status === 'points_paid' ? (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      {language === 'ja' ? 'ポイント支給完了!' : '포인트 지급 완료!'}
                    </>
                  ) : status === 'revision_required' ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {language === 'ja' ? '修正が必要です' : '수정이 필요합니다'}
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      {language === 'ja' ? 'レビュー待ち' : '검토 대기 중'}
                    </>
                  )}
                </h4>

                {status === 'points_paid' && submission?.points_amount > 0 && (
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-green-600">
                      +{submission.points_amount.toLocaleString()}P
                    </p>
                    {submission.points_paid_at && (
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(submission.points_paid_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
                      </p>
                    )}
                  </div>
                )}

                {/* 수정 요청사항 표시 (revision_requests 배열) */}
                {(submission?.revision_requests?.length > 0 || application?.revision_requests?.length > 0) && (
                  <RevisionRequestsSection
                    revisionRequests={submission?.revision_requests || application?.revision_requests}
                    language={language}
                  />
                )}

                {/* 기존 revision_notes (단일 메모) */}
                {status === 'revision_required' && submission?.revision_notes && !submission?.revision_requests?.length && (
                  <div className="bg-red-100 border border-red-200 rounded p-3 text-sm text-red-700">
                    {submission.revision_notes}
                  </div>
                )}

                {submission?.sns_url && (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-500 mb-1">
                      {language === 'ja' ? '提出済みSNS:' : '제출한 SNS:'}
                    </p>
                    <a
                      href={submission.sns_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      {submission.sns_url}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 영상 재업로드 섹션 - 영상 업로드 완료 후 어느 단계에서든 항상 표시 */}
            {currentStep >= 2 && submission?.video_file_url && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* 전체 버전 히스토리 */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">{language === 'ja' ? '提出済み動画:' : '제출된 영상:'}</p>
                  <div className="space-y-1.5">
                    {(Array.isArray(submission?.video_versions) && submission.video_versions.length > 0
                      ? [...submission.video_versions].sort((a, b) => (b.version || 0) - (a.version || 0))
                      : [{ version: getVideoVersion() || 1, file_url: submission.video_file_url, file_name: submission.video_file_name, uploaded_at: submission.video_uploaded_at }]
                    ).map((ver, idx) => (
                      <div key={idx} className={`p-2.5 bg-white rounded-lg border ${idx === 0 ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              v{ver.version} - {ver.file_name || (language === 'ja' ? 'アップロード済み' : '업로드됨')}
                            </p>
                            {ver.uploaded_at && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(ver.uploaded_at).toLocaleString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${idx === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            v{ver.version}{idx === 0 ? (language === 'ja' ? ' 最新' : ' 최신') : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 재업로드 영역 */}
                {status !== 'points_paid' && status !== 'completed' && (
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'ja' ? '動画を再アップロード（新しいバージョンとして追加）' : '영상 재업로드 (새 버전으로 추가)'}
                    </p>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileSelect(e, false)}
                      className="hidden"
                    />
                    <div
                      onClick={() => !uploading && videoInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        videoFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-white'
                      }`}
                    >
                      {videoFile ? (
                        <div className="flex items-center justify-center space-x-3">
                          <Film className="w-6 h-6 text-blue-500" />
                          <span className="text-sm text-gray-700">{videoFile.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setVideoFile(null) }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                          {language === 'ja' ? 'クリックして動画を選択 (最大2GB)' : '클릭하여 영상 선택 (최대 2GB)'}
                        </div>
                      )}
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-center text-xs text-gray-500">{uploadProgress}%</p>
                      </div>
                    )}

                    {videoFile && !uploading && (
                      <button
                        onClick={handleVideoUpload}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {language === 'ja'
                          ? `v${getVideoVersion() + 1} 動画をアップロード`
                          : `v${getVideoVersion() + 1} 영상 업로드`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 가이드 모달 - AI 가이드는 ShootingGuideModal, 그 외는 GuideModal */}
      {(() => {
        // personalized_guide 또는 shooting_guide_content에서 AI 가이드 확인
        const parsed = parsePersonalizedGuide(application?.personalized_guide)
        const parsedCampaignGuide = !parsed.isAiGuide
          ? parsePersonalizedGuide(campaign?.shooting_guide_content)
          : { isAiGuide: false, aiData: null }
        const aiGuideData = parsed.isAiGuide ? parsed.aiData : parsedCampaignGuide.isAiGuide ? parsedCampaignGuide.aiData : null

        if (aiGuideData) {
          return (
            <ShootingGuideModal
              isOpen={showGuideModal}
              onClose={() => setShowGuideModal(false)}
              guide={aiGuideData}
              campaignTitle={campaign?.title || ''}
            />
          )
        }
        return (
          <GuideModal
            isOpen={showGuideModal}
            onClose={() => setShowGuideModal(false)}
            campaign={campaign}
            application={application}
            language={language}
            stepNumber={stepNumber}
            campaignType={campaignType}
          />
        )
      })()}
    </>
  )
}

// 캠페인 카드
// 업로드 채널 정보
const CHANNEL_INFO = {
  instagram: { icon: '📸', label: 'Instagram', bgClass: 'bg-pink-100 text-pink-700 border-pink-200' },
  youtube: { icon: '📺', label: 'YouTube', bgClass: 'bg-red-100 text-red-700 border-red-200' },
  tiktok: { icon: '🎵', label: 'TikTok', bgClass: 'bg-gray-100 text-gray-700 border-gray-300' }
}

const CampaignCard = ({ application, campaign, submissions, mainChannel, onUpdate, language, submissionTable = 'campaign_submissions' }) => {
  const [expanded, setExpanded] = useState(true)

  const campaignType = campaign?.campaign_type || 'regular'
  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const videoSteps = campaign?.total_steps || typeInfo.steps
  const snsSteps = typeInfo.snsSteps || videoSteps
  const totalSteps = Math.max(videoSteps, snsSteps)

  const calculateProgress = () => {
    if (!submissions?.length) return 0
    const completed = submissions.filter(s =>
      s.workflow_status === 'completed' || s.workflow_status === 'points_paid'
    ).length
    return Math.round((completed / totalSteps) * 100)
  }

  const progress = calculateProgress()

  // 가장 가까운 마감일 찾기
  const getNextDeadline = () => {
    const now = new Date()
    let nearest = null

    const checkDate = (date, type, step) => {
      if (date && new Date(date) > now) {
        if (!nearest || new Date(date) < new Date(nearest.date)) {
          nearest = { date, type, step }
        }
      }
    }

    // step_deadlines 배열 확인
    if (campaign?.step_deadlines) {
      for (const sd of campaign.step_deadlines) {
        checkDate(sd.video_deadline, 'video', sd.step)
        checkDate(sd.sns_deadline, 'sns', sd.step)
      }
    }

    // 4주 챌린지: week1~4 필드 확인
    if (campaignType === '4week_challenge') {
      for (let w = 1; w <= 4; w++) {
        checkDate(campaign?.[`week${w}_deadline`], 'video', w)
        checkDate(campaign?.[`week${w}_sns_deadline`], 'sns', w)
      }
    }

    // 기본 마감일 (기획형 등)
    if (!nearest) {
      checkDate(campaign?.video_deadline, 'video', 1)
      checkDate(campaign?.sns_deadline, 'sns', 1)
    }

    return nearest
  }

  const nextDeadline = getNextDeadline()

  return (
    <div className={`rounded-xl shadow-sm border-2 overflow-hidden ${typeInfo.bgClass}`}>
      {/* 캠페인 헤더 */}
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{typeInfo.icon}</span>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badgeClass}`}>
                  {language === 'ja' ? typeInfo.labelJa : typeInfo.labelKo}
                </span>
                {totalSteps > 1 && (
                  <span className="text-xs text-gray-500">
                    {totalSteps} {language === 'ja' ? 'ステップ' : '스텝'}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900">
                {campaign?.title || application.campaign_title}
              </h3>

              {/* 업로드 채널 표시 */}
              {mainChannel && CHANNEL_INFO[mainChannel] && (
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CHANNEL_INFO[mainChannel].bgClass}`}>
                    {CHANNEL_INFO[mainChannel].icon} アップロード先: {CHANNEL_INFO[mainChannel].label}
                  </span>
                </div>
              )}

              {/* 다음 마감일 表示 */}
              {nextDeadline && (
                <div className="mt-1 flex items-center text-xs text-orange-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {language === 'ja' ? '次の締切:' : '다음 마감:'}{' '}
                    {nextDeadline.type === 'video'
                      ? (language === 'ja' ? '動画' : '영상')
                      : 'SNS'
                    }
                    {totalSteps > 1 && (
                      campaignType === '4week_challenge'
                        ? ` (Week ${nextDeadline.step})`
                        : campaignType === 'megawari'
                          ? (language === 'ja' ? ` (ステップ${nextDeadline.step})` : ` (${nextDeadline.step}스텝)`)
                          : ''
                    )}
                    {' - '}
                    {new Date(nextDeadline.date).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* 캠페인 설명 + 보수 */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {language === 'ja' ? typeInfo.descJa : typeInfo.descKo}
                </p>
                {campaign?.reward_amount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    💰 ¥{campaign.reward_amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">
                {language === 'ja' ? '進捗率' : '진행률'}
              </p>
              <p className={`text-xl font-bold ${typeInfo.textClass}`}>
                {progress}%
              </p>
            </div>

            {expanded ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-3 w-full bg-white bg-opacity-50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              progress === 100 ? 'bg-green-500' : `bg-${typeInfo.color}-500`
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 전체 마감일 스케줄 */}
        <AllDeadlinesOverview
          campaign={campaign}
          campaignType={campaignType}
          language={language}
        />
      </div>

      {/* 스텝 목록 */}
      {expanded && (
        <div className="p-4 pt-0 space-y-3">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => {
            const submission = submissions?.find(s => s.step_number === stepNumber) || {
              id: `temp-${stepNumber}`,
              step_number: stepNumber,
              workflow_status: 'guide_pending'
            }
            // 메가와리: step 3은 SNS only (영상 2개 + SNS 3개)
            const hasVideoUpload = stepNumber <= videoSteps
            const hasSnsUpload = stepNumber <= snsSteps

            return (
              <StepCard
                key={submission.id}
                stepNumber={stepNumber}
                totalSteps={totalSteps}
                campaignType={campaignType}
                submission={submission}
                campaign={campaign}
                application={application}
                onUpdate={onUpdate}
                language={language}
                hasVideoUpload={hasVideoUpload}
                hasSnsUpload={hasSnsUpload}
                submissionTable={submissionTable}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// 메인 컴포넌트
const MyPageCampaignsTab = ({ applications = [], user }) => {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState({})
  const [submissions, setSubmissions] = useState({})
  const [mainChannels, setMainChannels] = useState({})
  const [filter, setFilter] = useState('all')
  const [submissionTable, setSubmissionTable] = useState('campaign_submissions') // or 'video_submissions' or 'applications'

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const campaignIds = [...new Set(applications.map(a => a.campaign_id).filter(Boolean))]
      let campaignsMap = {}

      if (campaignIds.length > 0) {
        const { data: campaignsData } = await supabase
          .from('campaigns')
          .select('*')
          .in('id', campaignIds)

        if (campaignsData) {
          campaignsData.forEach(c => { campaignsMap[c.id] = c })
          setCampaigns(campaignsMap)
        }
      }

      // main_channel 조회 (기업이 크리에이터 선정 시 저장한 업로드 채널)
      // 1. 먼저 기존 로드된 applications에서 확인
      const channelMap = {}
      applications.forEach(app => {
        if (app.campaign_id && app.main_channel) {
          channelMap[app.campaign_id] = app.main_channel
        }
      })

      // 2. 기존 데이터에 없으면 이메일 기반으로 추가 조회
      if (Object.keys(channelMap).length === 0 && user?.email) {
        try {
          const { data: channelData } = await supabase
            .from('applications')
            .select('campaign_id, main_channel')
            .not('main_channel', 'is', null)
            .or(`applicant_email.eq.${user.email},email.eq.${user.email},creator_email.eq.${user.email}`)
          if (channelData) {
            channelData.forEach(row => {
              if (row.campaign_id && row.main_channel) {
                channelMap[row.campaign_id] = row.main_channel
              }
            })
          }
        } catch (e) {
          // 컬럼이 없을 수 있음 - 무시
        }
      }
      setMainChannels(channelMap)

      const applicationIds = applications.map(a => a.id)

      if (applicationIds.length > 0) {
        let submissionsLoaded = false
        let detectedTable = 'applications' // fallback

        // ── Phase 1: campaign_submissions テーブルを試行 ──
        try {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('campaign_submissions')
            .select('*')
            .in('application_id', applicationIds)
            .order('step_number', { ascending: true })

          if (!submissionsError && submissionsData && submissionsData.length > 0) {
            const submissionsMap = {}
            submissionsData.forEach(s => {
              if (!submissionsMap[s.application_id]) {
                submissionsMap[s.application_id] = []
              }
              submissionsMap[s.application_id].push(s)
            })
            setSubmissions(submissionsMap)
            submissionsLoaded = true
            detectedTable = 'campaign_submissions'
          }

          // campaign_submissions が存在する場合: 未作成分の自動生成
          if (!submissionsError && detectedTable === 'campaign_submissions') {
            const approvedApps = applications.filter(a =>
              ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(a.status)
            )
            for (const app of approvedApps) {
              if (!submissionsLoaded || !submissionsData?.some(s => s.application_id === app.id)) {
                const campaign = campaignsMap?.[app.campaign_id]
                const campaignType = campaign?.campaign_type || 'regular'
                const typeInfoLocal = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
                const videoStepsLocal = campaign?.total_steps || typeInfoLocal.steps
                const snsStepsLocal = typeInfoLocal.snsSteps || videoStepsLocal
                const totalSteps = Math.max(videoStepsLocal, snsStepsLocal)

                for (let step = 1; step <= totalSteps; step++) {
                  const stepLabel = campaignType === '4week_challenge' ? `Week ${step}` :
                    campaignType === 'megawari' ? `Step ${step}` : null
                  try {
                    await supabase
                      .from('campaign_submissions')
                      .upsert({
                        application_id: app.id,
                        user_id: app.user_id,
                        campaign_id: app.campaign_id,
                        step_number: step,
                        step_label: stepLabel,
                        workflow_status: 'guide_pending'
                      }, { onConflict: 'application_id,step_number', ignoreDuplicates: true })
                  } catch (e) { /* ignore */ }
                }
              }
            }

            if (!submissionsLoaded && approvedApps.length > 0) {
              const { data: retryData } = await supabase
                .from('campaign_submissions')
                .select('*')
                .in('application_id', applicationIds)
                .order('step_number', { ascending: true })
              if (retryData && retryData.length > 0) {
                const submissionsMap = {}
                retryData.forEach(s => {
                  if (!submissionsMap[s.application_id]) submissionsMap[s.application_id] = []
                  submissionsMap[s.application_id].push(s)
                })
                setSubmissions(submissionsMap)
                submissionsLoaded = true
              }
            }
          }
        } catch (e) {
          console.warn('campaign_submissions not available:', e.message)
        }

        // ── Phase 2: video_submissions テーブルをフォールバック ──
        if (!submissionsLoaded) {
          try {
            const { data: videoSubData, error: videoSubError } = await supabase
              .from('video_submissions')
              .select('*')
              .in('application_id', applicationIds)
              .order('video_number', { ascending: true })

            if (!videoSubError && videoSubData && videoSubData.length > 0) {
              const submissionsMap = {}
              videoSubData.forEach(vs => {
                const mapped = mapVideoSubToSubmission(vs)
                if (!submissionsMap[mapped.application_id]) {
                  submissionsMap[mapped.application_id] = []
                }
                submissionsMap[mapped.application_id].push(mapped)
              })
              setSubmissions(submissionsMap)
              submissionsLoaded = true
              detectedTable = 'video_submissions'
            }
          } catch (e) {
            console.warn('video_submissions not available:', e.message)
          }
        }

        // ── Phase 3: applications データからフォールバック構築 ──
        if (!submissionsLoaded) {
          const submissionsMap = {}
          const activeApps = applications.filter(a =>
            ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(a.status)
          )
          activeApps.forEach(app => {
            const campaign = campaignsMap?.[app.campaign_id]
            const builtSubs = buildSubmissionsFromApplication(app, campaign)
            if (builtSubs.length > 0) {
              submissionsMap[app.id] = builtSubs
            }
          })
          if (Object.keys(submissionsMap).length > 0) {
            setSubmissions(submissionsMap)
          }
          detectedTable = 'applications'
        }

        setSubmissionTable(detectedTable)
      }
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [applications])

  // 상태별 분류
  // cnecbiz.com 관리자 사용 status: selected(선정), filming(촬영중), approved(승인)
  const approvedStatuses = ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed']
  const knownStatuses = [...approvedStatuses, 'pending', 'virtual_selected', 'rejected']
  const approvedApplications = applications.filter(a => approvedStatuses.includes(a.status))
  const pendingApplications = applications.filter(a => a.status === 'pending' || a.status === 'virtual_selected')
  const rejectedApplications = applications.filter(a => a.status === 'rejected')
  const otherApplications = applications.filter(a => !knownStatuses.includes(a.status))

  // 필터 적용
  const filterByType = (apps) => {
    if (filter === 'all') return apps
    return apps.filter(app => {
      const campaign = campaigns[app.campaign_id]
      return campaign?.campaign_type === filter
    })
  }

  const filteredApproved = filterByType(approvedApplications)
  const filteredPending = filterByType(pendingApplications)
  const filteredRejected = filterByType(rejectedApplications)
  const filteredOther = filterByType(otherApplications)

  const stats = {
    total: applications.length,
    pending: pendingApplications.length,
    approved: approvedApplications.length,
    completed: approvedApplications.filter(app => {
      const subs = submissions[app.id] || []
      const campaign = campaigns[app.campaign_id]
      const typeInfoStat = CAMPAIGN_TYPES[campaign?.campaign_type || 'regular'] || CAMPAIGN_TYPES.regular
      const vSteps = campaign?.total_steps || typeInfoStat.steps
      const sSteps = typeInfoStat.snsSteps || vSteps
      const total = Math.max(vSteps, sSteps)
      return subs.filter(s => s.workflow_status === 'completed' || s.workflow_status === 'points_paid').length >= total
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                {language === 'ja' ? '総応募数' : '총 신청'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                {language === 'ja' ? '審査中' : '심사중'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                {language === 'ja' ? '選定済み' : '선정됨'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <Download className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                {language === 'ja' ? '完了' : '완료'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {language === 'ja' ? 'すべて' : '전체'}
        </button>
        {Object.entries(CAMPAIGN_TYPES).map(([key, type]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? type.badgeClass
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.icon} {language === 'ja' ? type.labelJa : type.labelKo}
          </button>
        ))}
      </div>

      {/* 선정된 캠페인 - 워크플로우 진행 */}
      {filteredApproved.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            {language === 'ja' ? '選定されたキャンペーン' : '선정된 캠페인'}
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-sm rounded-full">
              {filteredApproved.length}
            </span>
          </h3>
          <div className="space-y-4 sm:space-y-6">
            {filteredApproved.map(application => (
              <CampaignCard
                key={application.id}
                application={application}
                campaign={campaigns[application.campaign_id]}
                submissions={submissions[application.id] || []}
                mainChannel={mainChannels[application.campaign_id]}
                onUpdate={() => loadData(true)}
                language={language}
                submissionTable={submissionTable}
              />
            ))}
          </div>
        </div>
      )}

      {/* 지원한 캠페인 - 대기중 */}
      {filteredPending.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            {language === 'ja' ? '審査中のキャンペーン' : '심사중인 캠페인'}
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              {filteredPending.length}
            </span>
          </h3>
          <div className="space-y-3">
            {filteredPending.map(application => {
              const campaign = campaigns[application.campaign_id]
              const typeInfo = CAMPAIGN_TYPES[campaign?.campaign_type || 'regular'] || CAMPAIGN_TYPES.regular

              return (
                <div
                  key={application.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badgeClass}`}>
                            {language === 'ja' ? typeInfo.labelJa : typeInfo.labelKo}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {application.status === 'virtual_selected'
                              ? (language === 'ja' ? '仮選定' : '가선정')
                              : (language === 'ja' ? '審査中' : '심사중')
                            }
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {campaign?.title || application.campaign_title || (language === 'ja' ? 'キャンペーン' : '캠페인')}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'ja' ? '応募日: ' : '신청일: '}
                          {new Date(application.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-yellow-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {language === 'ja' ? '結果待ち' : '결과 대기'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 불합격 캠페인 */}
      {filteredRejected.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <XCircle className="w-5 h-5 mr-2 text-red-500" />
            {language === 'ja' ? '不合格のキャンペーン' : '불합격 캠페인'}
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-sm rounded-full">
              {filteredRejected.length}
            </span>
          </h3>
          <div className="space-y-3">
            {filteredRejected.map(application => {
              const campaign = campaigns[application.campaign_id]
              const typeInfo = CAMPAIGN_TYPES[campaign?.campaign_type || 'regular'] || CAMPAIGN_TYPES.regular

              return (
                <div
                  key={application.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badgeClass}`}>
                            {language === 'ja' ? typeInfo.labelJa : typeInfo.labelKo}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {language === 'ja' ? '不合格' : '불합격'}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {campaign?.title || application.campaign_title || (language === 'ja' ? 'キャンペーン' : '캠페인')}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'ja' ? '応募日: ' : '신청일: '}
                          {new Date(application.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-red-500">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {language === 'ja' ? '不合格' : '불합격'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 기타 상태 캠페인 (알 수 없는 상태) */}
      {filteredOther.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-gray-500" />
            {language === 'ja' ? '応募したキャンペーン' : '응모한 캠페인'}
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-800 text-sm rounded-full">
              {filteredOther.length}
            </span>
          </h3>
          <div className="space-y-3">
            {filteredOther.map(application => {
              const campaign = campaigns[application.campaign_id]
              const typeInfo = CAMPAIGN_TYPES[campaign?.campaign_type || 'regular'] || CAMPAIGN_TYPES.regular

              return (
                <div
                  key={application.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.badgeClass}`}>
                            {language === 'ja' ? typeInfo.labelJa : typeInfo.labelKo}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {language === 'ja' ? '確認中' : '확인중'}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {campaign?.title || application.campaign_title || (language === 'ja' ? 'キャンペーン' : '캠페인')}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {language === 'ja' ? '応募日: ' : '신청일: '}
                          {new Date(application.created_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-gray-500">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {language === 'ja' ? '確認中' : '확인중'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {filteredApproved.length === 0 && filteredPending.length === 0 && filteredRejected.length === 0 && filteredOther.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {applications.length === 0
              ? (language === 'ja' ? '応募したキャンペーンがありません' : '신청한 캠페인이 없습니다')
              : (language === 'ja' ? '該当するキャンペーンがありません' : '해당하는 캠페인이 없습니다')
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default MyPageCampaignsTab
