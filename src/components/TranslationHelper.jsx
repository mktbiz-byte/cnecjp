import React, { useState } from 'react'
import { Copy, Languages, ArrowRight, Loader2 } from 'lucide-react'

const TranslationHelper = () => {
  const [koreanText, setKoreanText] = useState('')
  const [japaneseText, setJapaneseText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')

  // OpenAI API를 사용한 번역 함수
  const translateText = async (text) => {
    if (!text.trim()) return

    setIsTranslating(true)
    setError('')

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '당신은 한국어를 자연스러운 일본어로 번역하는 전문 번역가입니다. 마케팅 문구나 캠페인 내용을 번역할 때는 일본 현지 감각에 맞게 자연스럽게 번역해주세요.'
            },
            {
              role: 'user',
              content: `다음 한국어 텍스트를 자연스러운 일본어로 번역해주세요:\n\n${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error('번역 API 호출에 실패했습니다')
      }

      const data = await response.json()
      const translatedText = data.choices[0]?.message?.content?.trim()
      
      if (translatedText) {
        setJapaneseText(translatedText)
      } else {
        throw new Error('번역 결과를 받을 수 없습니다')
      }

    } catch (error) {
      console.error('번역 오류:', error)
      setError('번역 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsTranslating(false)
    }
  }

  // 클립보드에 복사
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // 복사 성공 피드백 (간단한 알림)
      const button = event.target.closest('button')
      const originalText = button.innerHTML
      button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> 복사됨!'
      setTimeout(() => {
        button.innerHTML = originalText
      }, 2000)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center mb-4">
        <Languages className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">한글 → 일본어 번역기</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        캠페인 내용을 한글로 작성하시면 자연스러운 일본어로 번역해드립니다.
      </p>

      <div className="space-y-6">
        {/* 한글 입력 */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">📝</span>
            한국어 입력
          </label>
          <textarea
            value={koreanText}
            onChange={(e) => setKoreanText(e.target.value)}
            placeholder="번역할 한국어 텍스트를 입력하세요..."
            className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
            maxLength={500}
          />
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {koreanText.length} / 500자
            </span>
            <button
              onClick={() => translateText(koreanText)}
              disabled={!koreanText.trim() || isTranslating}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  번역 중...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  번역하기
                </>
              )}
            </button>
          </div>
        </div>

        {/* 일본어 출력 */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🇯🇵</span>
            일본어 번역 결과
          </label>
          <div className="relative">
            <textarea
              value={japaneseText}
              onChange={(e) => setJapaneseText(e.target.value)}
              placeholder="번역 결과가 여기에 표시됩니다..."
              className="w-full h-40 px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-green-50 text-base"
            />
            {japaneseText && (
              <button
                onClick={() => copyToClipboard(japaneseText)}
                className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                title="클립보드에 복사"
              >
                <Copy className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {japaneseText.length}자
            </span>
            {japaneseText && (
              <button
                onClick={() => copyToClipboard(japaneseText)}
                className="inline-flex items-center px-6 py-2.5 border-2 border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                복사하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 사용 팁 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <h4 className="text-sm font-medium text-yellow-800 mb-1">💡 사용 팁</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• 번역 결과는 수정 가능합니다</li>
          <li>• 복사 버튼으로 쉽게 캠페인 폼에 붙여넣기 할 수 있습니다</li>
          <li>• 마케팅 문구는 현지 감각에 맞게 자연스럽게 번역됩니다</li>
        </ul>
      </div>
    </div>
  )
}

export default TranslationHelper
