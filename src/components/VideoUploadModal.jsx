import React, { useState } from 'react'
import { X, Upload, Link, AlertTriangle, CheckCircle, Film, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'

const VideoUploadModal = ({ isOpen, onClose, application, onSuccess }) => {
  const [videoUrl, setVideoUrl] = useState(application?.submitted_video_url || '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmRevision, setConfirmRevision] = useState(false)

  if (!isOpen || !application) return null

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!videoUrl.trim()) {
      setError('動画URLを入力してください。')
      return
    }

    if (!validateUrl(videoUrl)) {
      setError('有効なURLを入力してください。')
      return
    }

    if (!confirmRevision) {
      setError('修正確認にチェックを入れてください。')
      return
    }

    try {
      setLoading(true)

      // Update application with video submission
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          submitted_video_url: videoUrl,
          submission_notes: notes,
          submission_status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id)

      if (updateError) {
        console.error('Video submission error:', updateError)
        throw new Error('動画提出に失敗しました。')
      }

      setSuccess('動画が正常に提出されました！')

      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)

    } catch (err) {
      console.error('Submission error:', err)
      setError(err.message || '提出中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">動画提出</h2>
                <p className="text-sm text-blue-100">{application.campaign_title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 mb-1">
                SNS投稿前の重要な注意事項
              </p>
              <ul className="text-amber-700 space-y-1">
                <li>• 動画は必ず1回以上の修正を経てから提出してください</li>
                <li>• 修正なしでそのまま投稿すると報酬が支払われない場合があります</li>
                <li>• 担当者の承認後にSNSへ投稿してください</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Video URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              動画URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://drive.google.com/... または YouTube URL"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Google Drive, YouTube, Dropboxなどのリンクを入力してください
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              追加メモ（任意）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="撮影に関するコメントや質問があればご記入ください..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Revision Confirmation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmRevision}
                onChange={(e) => setConfirmRevision(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="text-sm">
                <span className="font-medium text-gray-900">修正確認</span>
                <p className="text-gray-600 mt-1">
                  この動画は1回以上の修正を経ており、SNS投稿前の最終確認用であることを確認します。
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !confirmRevision}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  提出中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  動画を提出
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Link */}
        {application.guide_url && (
          <div className="px-6 pb-4">
            <a
              href={application.guide_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              ガイドを確認する
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoUploadModal
