import React, { useState } from 'react'
import { X, Camera, MessageSquare, Lightbulb, ChevronLeft, ChevronRight, Play, Clock, Sparkles } from 'lucide-react'

const ShootingGuideModal = ({ isOpen, onClose, guide: guideProp, campaignTitle }) => {
  const [currentScene, setCurrentScene] = useState(0)

  if (!isOpen || !guideProp) return null

  // guide가 JSON 문자열인 경우 파싱
  let guide = guideProp
  if (typeof guideProp === 'string') {
    try {
      guide = JSON.parse(guideProp)
    } catch (e) {
      // 파싱 실패 시 빈 가이드
      guide = {}
    }
  }

  const scenes = guide.scenes || []
  const totalScenes = scenes.length

  const handlePrevScene = () => {
    setCurrentScene(prev => (prev > 0 ? prev - 1 : totalScenes - 1))
  }

  const handleNextScene = () => {
    setCurrentScene(prev => (prev < totalScenes - 1 ? prev + 1 : 0))
  }

  const getSceneTypeColor = (sceneType) => {
    if (sceneType?.includes('훅') || sceneType?.includes('フック')) {
      return 'bg-red-100 text-red-800 border-red-200'
    } else if (sceneType?.includes('CTA') || sceneType?.includes('엔딩') || sceneType?.includes('エンディング')) {
      return 'bg-purple-100 text-purple-800 border-purple-200'
    } else if (sceneType?.includes('제품') || sceneType?.includes('商品')) {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const currentSceneData = scenes[currentScene]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-[9999] flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6" />
                撮影ガイド
              </h2>
              <p className="text-sm text-purple-100 mt-1">{campaignTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Guide Info Bar */}
        <div className="bg-purple-50 px-6 py-3 border-b border-purple-100">
          <div className="flex flex-wrap gap-4 text-sm">
            {guide.dialogue_style && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">スタイル:</span>
                <span className="font-medium text-purple-700">
                  {guide.dialogue_style === 'natural' ? 'ナチュラル' :
                   guide.dialogue_style === 'formal' ? 'フォーマル' : guide.dialogue_style}
                </span>
              </div>
            )}
            {guide.tempo && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">テンポ:</span>
                <span className="font-medium text-purple-700">
                  {guide.tempo === 'normal' ? '普通' :
                   guide.tempo === 'fast' ? '速い' :
                   guide.tempo === 'slow' ? 'ゆっくり' : guide.tempo}
                </span>
              </div>
            )}
            {guide.mood && (
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">雰囲気:</span>
                <span className="font-medium text-purple-700">
                  {guide.mood === 'bright' ? '明るい' :
                   guide.mood === 'calm' ? '落ち着いた' :
                   guide.mood === 'energetic' ? 'エネルギッシュ' : guide.mood}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scene Navigation */}
        {totalScenes > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevScene}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">シーン</span>
                <div className="flex gap-1">
                  {scenes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentScene(idx)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        currentScene === idx
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextScene}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Scene Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentSceneData ? (
            <div className="space-y-6">
              {/* Scene Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-xl">
                  {currentSceneData.order || currentScene + 1}
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getSceneTypeColor(currentSceneData.scene_type)}`}>
                    {currentSceneData.scene_type}
                  </span>
                </div>
              </div>

              {/* Scene Description */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">撮影シーン</h4>
                    <p className="text-blue-800 leading-relaxed">
                      {currentSceneData.scene_description_translated || currentSceneData.scene_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dialogue */}
              {(currentSceneData.dialogue_translated || currentSceneData.dialogue) && (
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-2">撮影セリフ</h4>
                      <p className="text-green-800 leading-relaxed italic">
                        "{currentSceneData.dialogue_translated || currentSceneData.dialogue}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shooting Tip */}
              {(currentSceneData.shooting_tip_translated || currentSceneData.shooting_tip) && (
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 mb-2">撮影ヒント</h4>
                      <p className="text-amber-800 leading-relaxed">
                        {currentSceneData.shooting_tip_translated || currentSceneData.shooting_tip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ガイド情報がありません</p>
            </div>
          )}
        </div>

        {/* Required Content Section */}
        {(guide.required_dialogues?.length > 0 || guide.required_scenes?.length > 0) && (
          <div className="px-6 py-4 bg-red-50 border-t border-red-100">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              必須コンテンツ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.required_dialogues?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-800 mb-2">必須セリフ:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {guide.required_dialogues.map((dialogue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>"{dialogue}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {guide.required_scenes?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-800 mb-2">必須シーン:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {guide.required_scenes.map((scene, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>{scene}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {guide.updated_at && `最終更新: ${new Date(guide.updated_at).toLocaleDateString('ja-JP')}`}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShootingGuideModal
