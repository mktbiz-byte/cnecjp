import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import {
  Award, Shield, Download, Filter,
  ChevronDown, ChevronUp, BookOpen, Upload, Link as LinkIcon,
  CheckCircle, Clock, AlertCircle, Film, FileVideo, Share2,
  Loader2, ExternalLink, X, Play
} from 'lucide-react'

// 캠페인 유형 정보
const CAMPAIGN_TYPES = {
  regular: {
    icon: '📹',
    labelKo: '기획형',
    labelJa: '企画型',
    descKo: '1개 영상 제작',
    descJa: '1本の動画制作',
    steps: 1,
    color: 'purple',
    bgClass: 'bg-purple-50 border-purple-200',
    textClass: 'text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-800'
  },
  megawari: {
    icon: '🎯',
    labelKo: '메가와리',
    labelJa: 'メガ割',
    descKo: '2개 영상 (스텝 1/2)',
    descJa: '2本の動画（ステップ1/2）',
    steps: 2,
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
    color: 'blue',
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-800'
  },
  oliveyoung: {
    icon: '🛍️',
    labelKo: '올영세일',
    labelJa: 'オリーブヤング',
    descKo: '올리브영 세일 캠페인',
    descJa: 'オリーブヤングセールキャンペーン',
    steps: 1,
    color: 'green',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-700',
    badgeClass: 'bg-green-100 text-green-800'
  }
}

// 워크플로우 스텝 정보
const WORKFLOW_STEPS = [
  { id: 'guide', labelKo: '가이드 확인', labelJa: 'ガイド確認', icon: BookOpen },
  { id: 'video', labelKo: '영상 업로드', labelJa: '動画提出', icon: Upload },
  { id: 'sns', labelKo: 'SNS 공유', labelJa: 'SNS投稿', icon: Share2 },
  { id: 'complete', labelKo: '포인트 지급', labelJa: 'ポイント支給', icon: Award }
]

// 개별 스텝 카드
const StepCard = ({
  stepNumber,
  totalSteps,
  campaignType,
  submission,
  campaign,
  application,
  onUpdate,
  language
}) => {
  const [expanded, setExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [snsUrl, setSnsUrl] = useState(submission?.sns_url || '')
  const [adCode, setAdCode] = useState(submission?.ad_code || '')
  const [submitting, setSubmitting] = useState(false)

  const videoInputRef = useRef(null)
  const cleanVideoInputRef = useRef(null)
  const [videoFile, setVideoFile] = useState(null)
  const [cleanVideoFile, setCleanVideoFile] = useState(null)

  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const status = submission?.workflow_status || 'guide_pending'

  // 스텝 라벨
  const getStepLabel = () => {
    if (campaignType === '4week_challenge') {
      return language === 'ja' ? `Week ${stepNumber}` : `${stepNumber}주차`
    }
    if (campaignType === 'megawari') {
      return language === 'ja' ? `ステップ ${stepNumber}` : `${stepNumber}스텝`
    }
    return null
  }

  // 현재 워크플로우 단계
  const getCurrentStep = () => {
    if (status === 'points_paid' || status === 'completed') return 4
    if (status === 'sns_submitted' || status === 'review_pending') return 3
    if (status === 'video_uploaded' || status === 'sns_pending') return 3
    if (status === 'guide_confirmed' || status === 'video_uploading') return 2
    return 1
  }

  // 가이드 확인 처리
  const handleGuideConfirm = async () => {
    setSubmitting(true)
    try {
      if (!submission?.id || submission.id.startsWith('temp-')) {
        // 새 submission 생성
        const { data, error } = await supabase
          .from('campaign_submissions')
          .insert({
            application_id: application.id,
            user_id: application.user_id,
            campaign_id: application.campaign_id,
            step_number: stepNumber,
            step_label: getStepLabel(),
            workflow_status: 'guide_confirmed'
          })
          .select()
          .single()

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('campaign_submissions')
          .update({
            workflow_status: 'guide_confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.id)

        if (error) throw error
      }
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

    // 파일 크기 검증 (500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert(language === 'ja' ? 'ファイルサイズは500MB以下にしてください' : '파일 크기는 500MB 이하여야 합니다')
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

      // 메인 영상 업로드
      const videoPath = `${userId}/${application.campaign_id}/${submission?.id || 'new'}/${timestamp}_main_${videoFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('campaign-videos')
        .upload(videoPath, videoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress(50)

      // 공개 URL 가져오기
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('campaign-videos')
        .getPublicUrl(videoPath)

      let cleanVideoUrl = null
      let cleanVideoPath = null

      // 클린본 업로드
      if (cleanVideoFile) {
        cleanVideoPath = `${userId}/${application.campaign_id}/${submission?.id || 'new'}/${timestamp}_clean_${cleanVideoFile.name}`

        const { error: cleanError } = await supabase.storage
          .from('campaign-videos')
          .upload(cleanVideoPath, cleanVideoFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (cleanError) throw cleanError

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-videos')
          .getPublicUrl(cleanVideoPath)
        cleanVideoUrl = publicUrl
      }

      setUploadProgress(80)

      // DB 업데이트
      if (!submission?.id || submission.id.startsWith('temp-')) {
        // 새 submission 생성
        const { error } = await supabase
          .from('campaign_submissions')
          .insert({
            application_id: application.id,
            user_id: application.user_id,
            campaign_id: application.campaign_id,
            step_number: stepNumber,
            step_label: getStepLabel(),
            workflow_status: 'video_uploaded',
            video_file_path: videoPath,
            video_file_url: videoUrl,
            video_file_name: videoFile.name,
            video_file_size: videoFile.size,
            video_uploaded_at: new Date().toISOString(),
            clean_video_file_path: cleanVideoPath,
            clean_video_file_url: cleanVideoUrl,
            clean_video_file_name: cleanVideoFile?.name,
            clean_video_uploaded_at: cleanVideoFile ? new Date().toISOString() : null
          })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('campaign_submissions')
          .update({
            workflow_status: 'video_uploaded',
            video_file_path: videoPath,
            video_file_url: videoUrl,
            video_file_name: videoFile.name,
            video_file_size: videoFile.size,
            video_uploaded_at: new Date().toISOString(),
            clean_video_file_path: cleanVideoPath,
            clean_video_file_url: cleanVideoUrl,
            clean_video_file_name: cleanVideoFile?.name,
            clean_video_uploaded_at: cleanVideoFile ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.id)

        if (error) throw error
      }

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

  // SNS URL 제출
  const handleSnsSubmit = async () => {
    if (!snsUrl.trim()) {
      alert(language === 'ja' ? 'SNS URLを入力してください' : 'SNS URL을 입력해주세요')
      return
    }

    setSubmitting(true)
    try {
      // 플랫폼 자동 감지
      let platform = 'other'
      if (snsUrl.includes('instagram.com')) platform = 'instagram'
      else if (snsUrl.includes('tiktok.com')) platform = 'tiktok'
      else if (snsUrl.includes('youtube.com') || snsUrl.includes('youtu.be')) platform = 'youtube'

      const updateData = {
        sns_platform: platform,
        sns_url: snsUrl,
        ad_code: adCode,
        sns_uploaded_at: new Date().toISOString(),
        workflow_status: 'sns_submitted',
        updated_at: new Date().toISOString()
      }

      if (!submission?.id || submission.id.startsWith('temp-')) {
        const { error } = await supabase
          .from('campaign_submissions')
          .insert({
            application_id: application.id,
            user_id: application.user_id,
            campaign_id: application.campaign_id,
            step_number: stepNumber,
            step_label: getStepLabel(),
            ...updateData
          })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('campaign_submissions')
          .update(updateData)
          .eq('id', submission.id)

        if (error) throw error
      }

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

          <div>
            {stepLabel && (
              <span className={`text-sm font-semibold ${typeInfo.textClass}`}>
                {stepLabel}
              </span>
            )}
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'points_paid' ? 'bg-green-100 text-green-800' :
                status === 'completed' ? 'bg-blue-100 text-blue-800' :
                status === 'revision_required' ? 'bg-red-100 text-red-800' :
                status === 'sns_submitted' ? 'bg-indigo-100 text-indigo-800' :
                status === 'video_uploaded' ? 'bg-cyan-100 text-cyan-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'points_paid' ? (language === 'ja' ? 'ポイント支給済み' : '포인트 지급완료') :
                 status === 'completed' ? (language === 'ja' ? '完了' : '완료') :
                 status === 'revision_required' ? (language === 'ja' ? '修正必要' : '수정 필요') :
                 status === 'sns_submitted' ? (language === 'ja' ? 'SNS提出済み' : 'SNS 제출완료') :
                 status === 'video_uploaded' ? (language === 'ja' ? '動画提出済み' : '영상 제출완료') :
                 status === 'guide_confirmed' ? (language === 'ja' ? 'ガイド確認済み' : '가이드 확인완료') :
                 (language === 'ja' ? 'ガイド確認待ち' : '가이드 확인 대기')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 워크플로우 진행률 미니 표시 */}
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
            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = currentStep > idx
              const isCurrent = currentStep === idx + 1
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
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      currentStep > idx + 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Step 1: 가이드 확인 */}
          {currentStep === 1 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                {language === 'ja' ? '撮影ガイドを確認してください' : '촬영 가이드를 확인해주세요'}
              </h4>

              {application?.personalized_guide || campaign?.shooting_guide_url ? (
                <div className="space-y-3">
                  {application?.personalized_guide && (
                    <div className="bg-white p-3 rounded border border-purple-200 text-sm">
                      <p className="whitespace-pre-wrap">{application.personalized_guide}</p>
                    </div>
                  )}
                  {campaign?.shooting_guide_url && (
                    <a
                      href={campaign.shooting_guide_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {language === 'ja' ? '詳細ガイドを見る' : '상세 가이드 보기'}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">
                  {language === 'ja' ? 'ガイドが準備中です。' : '가이드가 준비 중입니다.'}
                </p>
              )}

              <button
                onClick={handleGuideConfirm}
                disabled={submitting}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {language === 'ja' ? 'ガイド確認完了' : '가이드 확인 완료'}
              </button>
            </div>
          )}

          {/* Step 2: 영상 업로드 */}
          {currentStep === 2 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                {language === 'ja' ? '動画をアップロードしてください' : '영상을 업로드해주세요'}
              </h4>

              <div className="space-y-4">
                {/* 메인 영상 */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {language === 'ja' ? 'メイン動画' : '메인 영상'} *
                  </label>
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
                        <Film className="w-8 h-8 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium text-gray-700">{videoFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setVideoFile(null) }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">
                          {language === 'ja' ? 'クリックして動画を選択' : '클릭하여 영상 선택'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {language === 'ja' ? '最大500MB' : '최대 500MB'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 클린본 */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {language === 'ja' ? 'クリーン版（字幕なし）' : '클린본 (자막 없는 버전)'}
                    <span className="text-gray-400 ml-1">
                      ({language === 'ja' ? '任意' : '선택'})
                    </span>
                  </label>
                  <input
                    ref={cleanVideoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e, true)}
                    className="hidden"
                  />
                  <div
                    onClick={() => !uploading && cleanVideoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      cleanVideoFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-400'
                    }`}
                  >
                    {cleanVideoFile ? (
                      <div className="flex items-center justify-center space-x-3">
                        <FileVideo className="w-6 h-6 text-green-500" />
                        <span className="text-sm text-gray-700">{cleanVideoFile.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCleanVideoFile(null) }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <FileVideo className="w-5 h-5" />
                        <span className="text-sm">
                          {language === 'ja' ? 'クリーン版を追加' : '클린본 추가'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 업로드 진행 */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      {language === 'ja' ? 'アップロード中...' : '업로드 중...'} {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* 업로드 버튼 */}
                {videoFile && !uploading && (
                  <button
                    onClick={handleVideoUpload}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'ja' ? '動画をアップロード' : '영상 업로드'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: SNS 공유 */}
          {currentStep === 3 && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-indigo-800 mb-3 flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                {language === 'ja' ? 'SNS投稿情報を入力してください' : 'SNS 공유 정보를 입력해주세요'}
              </h4>

              {submission?.video_file_url && (
                <div className="mb-4 p-3 bg-white rounded border border-indigo-200">
                  <p className="text-xs text-gray-500 mb-1">
                    {language === 'ja' ? '提出済み動画:' : '제출된 영상:'}
                  </p>
                  <p className="text-sm text-gray-700 truncate">{submission.video_file_name}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {language === 'ja' ? 'SNS投稿URL' : 'SNS 게시물 URL'} *
                  </label>
                  <input
                    type="url"
                    value={snsUrl}
                    onChange={(e) => setSnsUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    {language === 'ja' ? '広告コード' : '광고코드'}
                    <span className="text-gray-400 ml-1">
                      ({language === 'ja' ? '任意' : '선택'})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={adCode}
                    onChange={(e) => setAdCode(e.target.value)}
                    placeholder="#AD #PR #협찬"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSnsSubmit}
                  disabled={submitting || !snsUrl.trim()}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  {language === 'ja' ? 'SNS情報を提出' : 'SNS 정보 제출'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: 완료/포인트 */}
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

              {status === 'revision_required' && submission?.revision_notes && (
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
        </div>
      )}
    </div>
  )
}

// 캠페인 카드
const CampaignCard = ({
  application,
  campaign,
  submissions,
  onUpdate,
  language
}) => {
  const [expanded, setExpanded] = useState(true)

  const campaignType = campaign?.campaign_type || 'regular'
  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const totalSteps = campaign?.total_steps || typeInfo.steps

  // 전체 진행률 계산
  const calculateProgress = () => {
    if (!submissions?.length) return 0
    const completed = submissions.filter(s =>
      s.workflow_status === 'completed' || s.workflow_status === 'points_paid'
    ).length
    return Math.round((completed / totalSteps) * 100)
  }

  const progress = calculateProgress()

  return (
    <div className={`rounded-xl shadow-sm border-2 overflow-hidden ${typeInfo.bgClass}`}>
      {/* 캠페인 헤더 */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
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
  const [filter, setFilter] = useState('all')

  // 데이터 로드
  const loadData = async () => {
    setLoading(true)
    try {
      // 캠페인 정보 로드
      const campaignIds = [...new Set(applications.map(a => a.campaign_id).filter(Boolean))]

      if (campaignIds.length > 0) {
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .in('id', campaignIds)

        if (!campaignsError && campaignsData) {
          const campaignsMap = {}
          campaignsData.forEach(c => { campaignsMap[c.id] = c })
          setCampaigns(campaignsMap)
        }
      }

      // submissions 로드
      const applicationIds = applications.map(a => a.id)

      if (applicationIds.length > 0) {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('campaign_submissions')
          .select('*')
          .in('application_id', applicationIds)
          .order('step_number', { ascending: true })

        if (!submissionsError && submissionsData) {
          const submissionsMap = {}
          submissionsData.forEach(s => {
            if (!submissionsMap[s.application_id]) {
              submissionsMap[s.application_id] = []
            }
            submissionsMap[s.application_id].push(s)
          })
          setSubmissions(submissionsMap)
        }
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

  // 승인된 applications만 필터링
  const approvedApplications = applications.filter(a => a.status === 'approved')

  // 필터링
  const filteredApplications = approvedApplications.filter(app => {
    if (filter === 'all') return true
    const campaign = campaigns[app.campaign_id]
    return campaign?.campaign_type === filter
  })

  // 통계 계산
  const stats = {
    total: applications.length,
    approved: approvedApplications.length,
    completed: approvedApplications.filter(app => {
      const subs = submissions[app.id] || []
      const campaign = campaigns[app.campaign_id]
      const totalSteps = campaign?.total_steps || CAMPAIGN_TYPES[campaign?.campaign_type || 'regular']?.steps || 1
      return subs.filter(s => s.workflow_status === 'completed' || s.workflow_status === 'points_paid').length >= totalSteps
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
    <div className="p-6">
      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {language === 'ja' ? '総応募数' : '총 신청'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {language === 'ja' ? '承認済み' : '승인됨'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Download className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {language === 'ja' ? '完了' : '완료'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
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

      {/* 캠페인 목록 */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {approvedApplications.length === 0
              ? (language === 'ja' ? '承認済みのキャンペーンがありません' : '승인된 캠페인이 없습니다')
              : (language === 'ja' ? '該当するキャンペーンがありません' : '해당하는 캠페인이 없습니다')
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map(application => (
            <CampaignCard
              key={application.id}
              application={application}
              campaign={campaigns[application.campaign_id]}
              submissions={submissions[application.id] || []}
              onUpdate={loadData}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPageCampaignsTab
