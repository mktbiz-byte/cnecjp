import React, { useState } from 'react'
import { ExternalLink, Download, FileText, Presentation, File, X } from 'lucide-react'

/**
 * URL 타입을 판별하는 유틸리티
 */
const getUrlType = (url) => {
  if (!url) return 'unknown'
  const lower = url.toLowerCase()
  if (lower.includes('docs.google.com/presentation') || lower.includes('slides.google.com')) {
    return 'google_slides'
  }
  if (lower.includes('docs.google.com/document')) {
    return 'google_docs'
  }
  if (lower.includes('drive.google.com')) {
    return 'google_drive'
  }
  if (lower.endsWith('.pdf') || lower.includes('/pdf')) {
    return 'pdf'
  }
  return 'external_link'
}

/**
 * Google Slides URL을 embed 가능한 URL로 변환
 */
const getEmbedUrl = (url) => {
  if (!url) return null
  // Google Slides: /edit → /embed
  if (url.includes('docs.google.com/presentation')) {
    return url.replace(/\/(edit|pub).*$/, '/embed')
  }
  return null
}

/**
 * ExternalGuideViewer - PDF/Google Slides/Google Docs 가이드 뷰어
 * campaigns.guide_type === 'pdf' && campaigns.guide_pdf_url 인 경우 표시
 */
const ExternalGuideViewer = ({ url, language = 'ja', compact = false }) => {
  const [showPreview, setShowPreview] = useState(false)
  const urlType = getUrlType(url)

  if (!url) return null

  const embedUrl = getEmbedUrl(url)

  // 컴팩트 모드: 버튼만 표시
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {urlType === 'google_slides' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
          >
            <Presentation className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'Google スライドで確認' : 'Google Slides 확인'}
          </a>
        )}
        {urlType === 'google_docs' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-blue-50 border border-blue-300 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'ドキュメントで確認' : '문서 확인'}
          </a>
        )}
        {urlType === 'google_drive' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-green-50 border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            <File className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'Google ドライブで確認' : 'Google Drive 확인'}
          </a>
        )}
        {urlType === 'pdf' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'PDFをダウンロード' : 'PDF 다운로드'}
          </a>
        )}
        {urlType === 'external_link' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-gray-50 border border-gray-300 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'ガイドを開く' : '가이드 열기'}
          </a>
        )}
      </div>
    )
  }

  // フルモード: プレビュー付き
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {urlType === 'google_slides' && <Presentation className="w-5 h-5 text-yellow-600 mr-2" />}
            {urlType === 'google_docs' && <FileText className="w-5 h-5 text-blue-600 mr-2" />}
            {urlType === 'google_drive' && <File className="w-5 h-5 text-green-600 mr-2" />}
            {urlType === 'pdf' && <FileText className="w-5 h-5 text-red-600 mr-2" />}
            {urlType === 'external_link' && <ExternalLink className="w-5 h-5 text-gray-600 mr-2" />}
            <span className="font-medium text-gray-800">
              {language === 'ja' ? '撮影ガイド資料' : '촬영 가이드 자료'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(urlType === 'pdf' || embedUrl) && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {showPreview
                  ? (language === 'ja' ? 'プレビューを閉じる' : '미리보기 닫기')
                  : (language === 'ja' ? 'プレビュー' : '미리보기')
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* プレビュー領域 */}
      {showPreview && (urlType === 'pdf' || embedUrl) && (
        <div className="relative">
          <iframe
            src={embedUrl || url}
            className="w-full h-[400px] border-0"
            title="Guide Preview"
            allowFullScreen
          />
        </div>
      )}

      {/* アクションボタン */}
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {urlType === 'google_slides' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            <Presentation className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'Google スライドで確認' : 'Google Slides 확인'}
          </a>
        )}
        {urlType === 'google_docs' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'ドキュメントで確認' : '문서 확인'}
          </a>
        )}
        {urlType === 'google_drive' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <File className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'Google ドライブで確認' : 'Google Drive 확인'}
          </a>
        )}
        {urlType === 'pdf' && (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {language === 'ja' ? 'ダウンロード' : '다운로드'}
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {language === 'ja' ? '新しいタブで開く' : '새 탭에서 열기'}
            </a>
          </>
        )}
        {urlType === 'external_link' && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {language === 'ja' ? 'ガイドを開く' : '가이드 열기'}
          </a>
        )}
      </div>
    </div>
  )
}

export default ExternalGuideViewer
