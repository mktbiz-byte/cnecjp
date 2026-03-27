import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import {
  BookOpen, Upload, Link, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, Film, FileVideo, Share2, Award,
  Loader2, X, ExternalLink
} from 'lucide-react'

// 캠페인 유형 정보
const CAMPAIGN_TYPES = {
  regular: {
    icon: '📹',
    labelKo: '기획형',
    labelJa: '企画型',
    steps: 1,
    color: 'purple'
  },
  megawari: {
    icon: '🎯',
    labelKo: '메가와리',
    labelJa: 'メガ割',
    steps: 2,
    color: 'orange'
  },
  '4week_challenge': {
    icon: '🗓️',
    labelKo: '4주 챌린지',
    labelJa: '4週チャレンジ',
    steps: 4,
    color: 'blue'
  },
  oliveyoung: {
    icon: '🛍️',
    labelKo: '올영세일',
    labelJa: 'オリーブヤング',
    steps: 1,
    color: 'green'
  }
}

// 워크플로우 상태별 정보
const WORKFLOW_STATUSES = {
  guide_pending: { labelKo: '가이드 확인', labelJa: 'ガイド確認', step: 1 },
  guide_confirmed: { labelKo: '가이드 확인완료', labelJa: 'ガイド確認済', step: 1 },
  video_uploading: { labelKo: '영상 업로드 중', labelJa: '動画アップロード中', step: 2 },
  video_uploaded: { labelKo: '영상 업로드 완료', labelJa: '動画アップロード済', step: 2 },
  sns_pending: { labelKo: 'SNS 공유 대기', labelJa: 'SNS投稿待ち', step: 3 },
  sns_submitted: { labelKo: 'SNS 제출 완료', labelJa: 'SNS提出済み', step: 3 },
  review_pending: { labelKo: '검토 대기', labelJa: 'レビュー待ち', step: 4 },
  revision_required: { labelKo: '수정 필요', labelJa: '修正必要', step: 4 },
  completed: { labelKo: '완료', labelJa: '完了', step: 5 },
  points_paid: { labelKo: '포인트 지급완료', labelJa: 'ポイント支給済み', step: 5 }
}

// 개별 스텝 카드 컴포넌트
const StepSubmissionCard = ({
  submission,
  stepNumber,
  totalSteps,
  campaignType,
  campaign,
  onGuideConfirm,
  onVideoUpload,
  onSnsSubmit,
  language
}) => {
  const [expanded, setExpanded] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [cleanVideoFile, setCleanVideoFile] = useState(null)
  const [snsUrl, setSnsUrl] = useState(submission?.sns_url || '')
  const [adCode, setAdCode] = useState(submission?.ad_code || '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoInputRef = useRef(null)
  const cleanVideoInputRef = useRef(null)

  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const status = submission?.workflow_status || 'guide_pending'
  const statusInfo = WORKFLOW_STATUSES[status] || WORKFLOW_STATUSES.guide_pending

  // 스텝 라벨 생성
  const getStepLabel = () => {
    if (campaignType === '4week_challenge') {
      return language === 'ja' ? `Week ${stepNumber}` : `${stepNumber}주차`
    }
    if (campaignType === 'megawari') {
      return language === 'ja' ? `ステップ ${stepNumber}` : `${stepNumber}스텝`
    }
    return null
  }

  // 워크플로우 진행률 계산
  const getProgress = () => {
    const statusOrder = [
      'guide_pending', 'guide_confirmed', 'video_uploading', 'video_uploaded',
      'sns_pending', 'sns_submitted', 'review_pending', 'completed', 'points_paid'
    ]
    const currentIndex = statusOrder.indexOf(status)
    return Math.round((currentIndex / (statusOrder.length - 1)) * 100)
  }

  // 영상 파일 선택 핸들러
  const handleVideoSelect = (e, isClean = false) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 검증 (500MB 제한)
      if (file.size > 500 * 1024 * 1024) {
        alert(language === 'ja' ? 'ファイルサイズは500MB以下にしてください。' : '파일 크기는 500MB 이하여야 합니다.')
        return
      }
      if (isClean) {
        setCleanVideoFile(file)
      } else {
        setVideoFile(file)
      }
    }
  }

  // 영상 업로드 처리
  const handleUpload = async () => {
    if (!videoFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      await onVideoUpload(submission.id, videoFile, cleanVideoFile, (progress) => {
        setUploadProgress(progress)
      })
      setVideoFile(null)
      setCleanVideoFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      alert(language === 'ja' ? 'アップロードに失敗しました。' : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // SNS URL 제출 처리
  const handleSnsSubmit = async () => {
    if (!snsUrl.trim()) {
      alert(language === 'ja' ? 'SNS URLを入力してください。' : 'SNS URL을 입력해주세요.')
      return
    }

    try {
      await onSnsSubmit(submission.id, snsUrl, adCode)
    } catch (error) {
      console.error('SNS submit error:', error)
      alert(language === 'ja' ? '提出に失敗しました。' : '제출에 실패했습니다.')
    }
  }

  const stepLabel = getStepLabel()
  const progress = getProgress()

  return (
    <div className={`border rounded-lg ${status === 'points_paid' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} overflow-hidden`}>
      {/* 헤더 */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          {/* 스텝 번호 또는 체크 */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            status === 'points_paid' ? 'bg-green-500 text-white' :
            status === 'completed' ? 'bg-blue-500 text-white' :
            'bg-gray-200 text-gray-600'
          }`}>
            {status === 'points_paid' || status === 'completed' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="font-semibold">{stepNumber}</span>
            )}
          </div>

          <div>
            {stepLabel && (
              <span className={`text-sm font-medium text-${typeInfo.color}-600`}>
                {stepLabel}
              </span>
            )}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'points_paid' ? 'bg-green-100 text-green-800' :
                status === 'completed' ? 'bg-blue-100 text-blue-800' :
                status === 'revision_required' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {language === 'ja' ? statusInfo.labelJa : statusInfo.labelKo}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 진행률 표시 */}
          <div className="hidden sm:block w-24">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  status === 'points_paid' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* 확장된 컨텐츠 */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
          {/* 워크플로우 스텝 */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className={`flex flex-col items-center ${statusInfo.step >= 1 ? 'text-blue-600' : ''}`}>
              <BookOpen className="w-4 h-4 mb-1" />
              <span>{language === 'ja' ? 'ガイド' : '가이드'}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" />
            <div className={`flex flex-col items-center ${statusInfo.step >= 2 ? 'text-blue-600' : ''}`}>
              <Upload className="w-4 h-4 mb-1" />
              <span>{language === 'ja' ? '動画' : '영상'}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" />
            <div className={`flex flex-col items-center ${statusInfo.step >= 3 ? 'text-blue-600' : ''}`}>
              <Share2 className="w-4 h-4 mb-1" />
              <span>SNS</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" />
            <div className={`flex flex-col items-center ${statusInfo.step >= 5 ? 'text-green-600' : ''}`}>
              <Award className="w-4 h-4 mb-1" />
              <span>{language === 'ja' ? 'ポイント' : '포인트'}</span>
            </div>
          </div>

          {/* Step 1: 가이드 확인 */}
          {(status === 'guide_pending' || status === 'guide_confirmed') && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                {language === 'ja' ? '撮影ガイド確認' : '촬영 가이드 확인'}
              </h4>
              {campaign?.shooting_guide_url ? (
                <a
                  href={campaign.shooting_guide_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline text-sm flex items-center"
                >
                  {language === 'ja' ? 'ガイドを見る' : '가이드 보기'}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                <p className="text-sm text-gray-500">
                  {language === 'ja' ? 'ガイドが準備中です。' : '가이드가 준비 중입니다.'}
                </p>
              )}
              {status === 'guide_pending' && (
                <button
                  onClick={() => onGuideConfirm(submission.id)}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  {language === 'ja' ? 'ガイド確認完了' : '가이드 확인 완료'}
                </button>
              )}
            </div>
          )}

          {/* Step 2: 영상 업로드 */}
          {(status === 'guide_confirmed' || status === 'video_uploading' || status === 'video_uploaded') && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                {language === 'ja' ? '動画アップロード' : '영상 업로드'}
              </h4>

              {submission?.video_file_url ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'ja' ? '動画アップロード済み' : '영상 업로드 완료'}
                  </div>
                  {/* 전체 버전 히스토리 표시 */}
                  {(Array.isArray(submission?.video_versions) && submission.video_versions.length > 0
                    ? [...submission.video_versions].sort((a, b) => (b.version || 0) - (a.version || 0))
                    : [{ version: 1, file_name: submission.video_file_name, uploaded_at: submission.video_uploaded_at }]
                  ).map((ver, idx) => (
                    <div key={idx} className={`p-2 rounded border text-xs ${idx === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 truncate">v{ver.version} - {ver.file_name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${idx === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          v{ver.version}{idx === 0 ? (language === 'ja' ? ' 最新' : ' 최신') : ''}
                        </span>
                      </div>
                      {ver.uploaded_at && (
                        <p className="text-gray-400 mt-0.5">{new Date(ver.uploaded_at).toLocaleString(language === 'ja' ? 'ja-JP' : 'ko-KR')}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 메인 영상 */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      {language === 'ja' ? 'メイン動画' : '메인 영상'} *
                    </label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoSelect(e, false)}
                      className="hidden"
                    />
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors"
                    >
                      {videoFile ? (
                        <div className="text-sm">
                          <Film className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                          <span className="text-gray-700">{videoFile.name}</span>
                          <br />
                          <span className="text-gray-400">
                            ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          <Upload className="w-6 h-6 mx-auto mb-1" />
                          {language === 'ja' ? 'クリックして動画を選択' : '클릭하여 영상 선택'}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* 클린본 (자막 없는 버전) */}
                  {campaign?.clean_video_required !== false && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {language === 'ja' ? 'クリーン版（字幕なし）' : '클린본 (자막 없는 버전)'}
                      </label>
                      <input
                        ref={cleanVideoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoSelect(e, true)}
                        className="hidden"
                      />
                      <button
                        onClick={() => cleanVideoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-lg p-3 text-center hover:border-blue-400 transition-colors"
                      >
                        {cleanVideoFile ? (
                          <div className="text-xs">
                            <FileVideo className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                            <span className="text-gray-700">{cleanVideoFile.name}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            <FileVideo className="w-5 h-5 mx-auto mb-1" />
                            {language === 'ja' ? 'クリーン版をアップロード（任意）' : '클린본 업로드 (선택)'}
                          </div>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 업로드 버튼 */}
                  {uploading ? (
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
                  ) : videoFile && (
                    <button
                      onClick={handleUpload}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      {language === 'ja' ? '動画をアップロード' : '영상 업로드'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: SNS URL + 광고코드 */}
          {(status === 'video_uploaded' || status === 'sns_pending' || status === 'sns_submitted') && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                {language === 'ja' ? 'SNS投稿情報' : 'SNS 공유 정보'}
              </h4>

              {submission?.sns_url ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'ja' ? 'SNS投稿済み' : 'SNS 공유 완료'}
                  </div>
                  <a
                    href={submission.sns_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    {submission.sns_url}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  {submission.ad_code && (
                    <p className="text-xs text-gray-500">
                      {language === 'ja' ? '広告コード: ' : '광고코드: '}{submission.ad_code}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* SNS URL 입력 */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      {language === 'ja' ? 'SNS投稿URL' : 'SNS 게시물 URL'} *
                    </label>
                    <input
                      type="text"
                      value={snsUrl}
                      onChange={(e) => setSnsUrl(e.target.value)}
                      placeholder="https://www.instagram.com/p/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* 광고코드 입력 */}
                  {campaign?.ad_code_required !== false && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {language === 'ja' ? '広告コード' : '광고코드'}
                      </label>
                      <input
                        type="text"
                        value={adCode}
                        onChange={(e) => setAdCode(e.target.value)}
                        placeholder="#AD #PR #협찬"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSnsSubmit}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    {language === 'ja' ? 'SNS情報を提出' : 'SNS 정보 제출'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: 검토/수정 */}
          {(status === 'review_pending' || status === 'revision_required') && (
            <div className={`rounded-lg p-4 ${status === 'revision_required' ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <h4 className={`font-medium mb-2 flex items-center ${
                status === 'revision_required' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {status === 'revision_required' ? (
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
              {submission?.revision_notes && (
                <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
                  {submission.revision_notes}
                </p>
              )}
            </div>
          )}

          {/* Step 5: 완료 */}
          {(status === 'completed' || status === 'points_paid') && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                {status === 'points_paid'
                  ? (language === 'ja' ? 'ポイント支給完了' : '포인트 지급 완료')
                  : (language === 'ja' ? '完了' : '완료')
                }
              </h4>
              {submission?.points_amount > 0 && (
                <p className="text-2xl font-bold text-green-600">
                  +{submission.points_amount.toLocaleString()}P
                </p>
              )}
              {submission?.points_paid_at && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(submission.points_paid_at).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'ko-KR')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 메인 캠페인 워크플로우 카드 컴포넌트
const CampaignWorkflowCard = ({
  application,
  campaign,
  submissions = [],
  onRefresh
}) => {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const campaignType = campaign?.campaign_type || 'regular'
  const typeInfo = CAMPAIGN_TYPES[campaignType] || CAMPAIGN_TYPES.regular
  const totalSteps = campaign?.total_steps || typeInfo.steps

  // 가이드 확인 처리
  const handleGuideConfirm = async (submissionId) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('campaign_submissions')
        .update({
          workflow_status: 'guide_confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error
      onRefresh?.()
    } catch (error) {
      console.error('Guide confirm error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 영상 업로드 처리 (버전 관리 포함)
  const handleVideoUpload = async (submissionId, videoFile, cleanVideoFile, onProgress) => {
    const userId = application.user_id
    const timestamp = Date.now()

    // 현재 submission 찾기 (버전 계산)
    const currentSubmission = submissions.find(s => s.id === submissionId)
    const existingVersions = Array.isArray(currentSubmission?.video_versions) ? currentSubmission.video_versions : []
    const currentPath = currentSubmission?.video_file_path || ''
    const pathMatch = currentPath.match(/_v(\d+)_/)
    const currentVersion = pathMatch ? parseInt(pathMatch[1]) : (currentSubmission?.video_file_url ? 1 : 0)
    const nextVersion = currentVersion + 1

    const getExt = (name) => {
      const dot = name.lastIndexOf('.')
      return dot >= 0 ? name.substring(dot) : ''
    }

    // 버전 포함 경로 (v1, v2, v3...)
    const videoPath = `${userId}/${application.campaign_id}/${submissionId}/${timestamp}_v${nextVersion}_main${getExt(videoFile.name)}`

    const { data: videoData, error: videoError } = await supabase.storage
      .from('campaign-videos')
      .upload(videoPath, videoFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (videoError) throw videoError

    // 공개 URL 가져오기
    const { data: { publicUrl: videoUrl } } = supabase.storage
      .from('campaign-videos')
      .getPublicUrl(videoPath)

    onProgress?.(50)

    let cleanVideoUrl = null
    let cleanVideoPath = null

    // 클린본 업로드 (있는 경우)
    if (cleanVideoFile) {
      cleanVideoPath = `${userId}/${application.campaign_id}/${submissionId}/${timestamp}_clean${getExt(cleanVideoFile.name)}`

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

    onProgress?.(80)

    // 버전 히스토리에 새 버전 추가
    const newVersionEntry = {
      version: nextVersion,
      file_path: videoPath,
      file_url: videoUrl,
      file_name: videoFile.name,
      file_size: videoFile.size,
      uploaded_at: new Date().toISOString()
    }
    const updatedVersions = [...existingVersions, newVersionEntry]

    // DB 업데이트 (최신 버전 + 버전 히스토리)
    const updateData = {
      video_file_path: videoPath,
      video_file_url: videoUrl,
      video_file_name: videoFile.name,
      video_file_size: videoFile.size,
      video_uploaded_at: new Date().toISOString(),
      clean_video_file_path: cleanVideoPath,
      clean_video_file_url: cleanVideoUrl,
      clean_video_file_name: cleanVideoFile?.name,
      clean_video_uploaded_at: cleanVideoFile ? new Date().toISOString() : null,
      workflow_status: 'video_uploaded',
      updated_at: new Date().toISOString()
    }

    // video_versions はDBカラムに存在しないため除外して更新
    const { error: updateError } = await supabase
      .from('campaign_submissions')
      .update(updateData)
      .eq('id', submissionId)
    if (updateError) throw updateError

    // applications テーブルも同期
    try {
      const appUpdate = {
        video_file_url: videoUrl,
        video_file_name: videoFile.name,
        video_file_size: videoFile.size,
        video_uploaded_at: new Date().toISOString(),
        video_submitted: true,
        status: 'video_submitted',
        revision_requested: false,
        updated_at: new Date().toISOString()
      }
      if (cleanVideoUrl) {
        appUpdate.clean_video_file_url = cleanVideoUrl
      }
      await supabase.from('applications').update(appUpdate).eq('id', application.id)
    } catch (syncErr) {
      console.warn('Applications sync warning:', syncErr.message)
    }

    onProgress?.(100)
    onRefresh?.()
  }

  // SNS URL 제출 처리
  const handleSnsSubmit = async (submissionId, snsUrl, adCode) => {
    setLoading(true)
    try {
      // SNS 플랫폼 자동 감지
      let platform = 'other'
      if (snsUrl.includes('instagram.com')) platform = 'instagram'
      else if (snsUrl.includes('tiktok.com')) platform = 'tiktok'
      else if (snsUrl.includes('youtube.com') || snsUrl.includes('youtu.be')) platform = 'youtube'

      const { error } = await supabase
        .from('campaign_submissions')
        .update({
          sns_platform: platform,
          sns_url: snsUrl,
          ad_code: adCode,
          sns_uploaded_at: new Date().toISOString(),
          workflow_status: 'sns_submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)

      if (error) throw error
      onRefresh?.()
    } catch (error) {
      console.error('SNS submit error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 전체 진행률 계산
  const calculateOverallProgress = () => {
    if (!submissions.length) return 0
    const completedSteps = submissions.filter(s =>
      s.workflow_status === 'completed' || s.workflow_status === 'points_paid'
    ).length
    return Math.round((completedSteps / totalSteps) * 100)
  }

  const overallProgress = calculateOverallProgress()

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 border-${typeInfo.color}-100 overflow-hidden`}>
      {/* 캠페인 헤더 */}
      <div
        className={`bg-gradient-to-r from-${typeInfo.color}-50 to-white p-4 cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{typeInfo.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                  {language === 'ja' ? typeInfo.labelJa : typeInfo.labelKo}
                </span>
                {totalSteps > 1 && (
                  <span className="text-xs text-gray-500">
                    {totalSteps} {language === 'ja' ? 'ステップ' : '스텝'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mt-1">
                {campaign?.title || application.campaign_title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 전체 진행률 */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">
                {language === 'ja' ? '進捗率' : '진행률'}
              </p>
              <p className={`text-lg font-bold text-${typeInfo.color}-600`}>
                {overallProgress}%
              </p>
            </div>

            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-${typeInfo.color}-500 transition-all duration-500`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 스텝 목록 */}
      {expanded && (
        <div className="p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {/* 각 스텝 렌더링 */}
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => {
            const submission = submissions.find(s => s.step_number === stepNumber) || {
              id: `temp-${stepNumber}`,
              step_number: stepNumber,
              workflow_status: 'guide_pending'
            }

            return (
              <StepSubmissionCard
                key={submission.id}
                submission={submission}
                stepNumber={stepNumber}
                totalSteps={totalSteps}
                campaignType={campaignType}
                campaign={campaign}
                onGuideConfirm={handleGuideConfirm}
                onVideoUpload={handleVideoUpload}
                onSnsSubmit={handleSnsSubmit}
                language={language}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CampaignWorkflowCard
