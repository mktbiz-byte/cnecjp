import React, { useState, useEffect } from 'react'
import { database } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'

/**
 * 영상 제출 추적 컴포넌트
 * 캠페인별로 영상 제출 상태를 관리하고 마감일 알림을 제어
 */
const VideoSubmissionTracker = ({ campaignId, applicationId }) => {
  const { user } = useAuth()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (campaignId && applicationId) {
      loadSubmissionStatus()
    }
  }, [campaignId, applicationId])

  const loadSubmissionStatus = async () => {
    try {
      setLoading(true)
      
      // 신청서에서 영상 제출 상태 확인
      const application = await database.applications.getById(applicationId)
      
      if (application) {
        setSubmission({
          id: application.id,
          video_url: application.video_url,
          submission_status: application.submission_status,
          submitted_at: application.submitted_at,
          notes: application.submission_notes
        })
        setVideoUrl(application.video_url || '')
      }
    } catch (error) {
      console.error('제출 상태 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitVideo = async () => {
    if (!videoUrl.trim()) {
      setMessage('영상 URL을 입력해주세요.')
      return
    }

    try {
      setUploading(true)
      setMessage('')

      // 신청서 업데이트
      const updateData = {
        video_url: videoUrl,
        submission_status: 'submitted',
        submitted_at: new Date().toISOString(),
        submission_notes: '영상 제출 완료'
      }

      await database.applications.update(applicationId, updateData)

      // 상태 업데이트
      setSubmission(prev => ({
        ...prev,
        ...updateData
      }))

      setMessage('영상이 성공적으로 제출되었습니다! 이제 마감일 알림을 받지 않습니다.')
      
    } catch (error) {
      console.error('영상 제출 오류:', error)
      setMessage('영상 제출 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = () => {
    if (!submission) return null

    switch (submission.submission_status) {
      case 'submitted':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            제출 완료
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            검토 중
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            미제출
          </Badge>
        )
    }
  }

  const isSubmitted = submission?.submission_status === 'submitted' || submission?.video_url

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2">로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            영상 제출
          </span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          캠페인 영상을 제출하면 마감일 알림을 받지 않습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubmitted ? (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                영상이 제출되었습니다. 마감일 알림을 받지 않습니다.
              </AlertDescription>
            </Alert>
            
            {submission.video_url && (
              <div>
                <label className="text-sm font-medium text-gray-700">제출된 영상 URL:</label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <a 
                    href={submission.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {submission.video_url}
                  </a>
                </div>
              </div>
            )}
            
            {submission.submitted_at && (
              <div className="text-sm text-gray-500">
                제출일: {new Date(submission.submitted_at).toLocaleString('ko-KR')}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
                영상 URL *
              </label>
              <input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... 또는 https://instagram.com/p/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={uploading}
              />
              <p className="mt-1 text-xs text-gray-500">
                YouTube, Instagram, TikTok 등의 영상 링크를 입력해주세요.
              </p>
            </div>

            <Button 
              onClick={handleSubmitVideo}
              disabled={uploading || !videoUrl.trim()}
              className="w-full"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  제출 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  영상 제출하기
                </>
              )}
            </Button>
          </div>
        )}

        {message && (
          <Alert className={message.includes('성공') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className={message.includes('성공') ? 'text-green-800' : 'text-red-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default VideoSubmissionTracker
