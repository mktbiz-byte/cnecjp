import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { database } from '../../lib/supabase'
import AdminNavigation from './AdminNavigation'
import googleDriveHelper from '../../lib/googleDriveHelper_enhanced'
import { 
  Loader2, Save, AlertCircle, CheckCircle, Key, 
  RefreshCw, Upload, Download, FileText, Settings,
  Lock, Shield, Database, Cloud, Mail
} from 'lucide-react'

const SystemSettings = () => {
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    google_drive_credentials: '',
    email_api_key: '',
    email_service_id: '',
    email_template_id: '',
    system_email: '',
    admin_email: ''
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [apiStatus, setApiStatus] = useState({
    googleDrive: { initialized: false, error: null }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 시스템 설정 로드
      const systemSettings = await database.system.getSettings()
      
      if (systemSettings) {
        setSettings({
          google_drive_credentials: systemSettings.google_drive_credentials || '',
          email_api_key: systemSettings.email_api_key || '',
          email_service_id: systemSettings.email_service_id || '',
          email_template_id: systemSettings.email_template_id || '',
          system_email: systemSettings.system_email || '',
          admin_email: systemSettings.admin_email || ''
        })
      }
      
      // API 상태 확인
      checkApiStatus()
      
    } catch (error) {
      console.error('설정 로드 오류:', error)
      setError('설정을 로드하는 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkApiStatus = async () => {
    try {
      // 구글 드라이브 API 상태 확인
      const googleDriveStatus = await googleDriveHelper.checkGoogleDriveApiStatus()
      
      setApiStatus(prev => ({
        ...prev,
        googleDrive: googleDriveStatus
      }))
    } catch (error) {
      console.error('API 상태 확인 오류:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      // 구글 드라이브 인증 정보 유효성 검사
      if (settings.google_drive_credentials) {
        try {
          // JSON 형식 검증
          JSON.parse(settings.google_drive_credentials)
        } catch (error) {
          setError('구글 드라이브 인증 정보가 올바른 JSON 형식이 아닙니다.')
          setSaving(false)
          return
        }
      }
      
      // 설정 저장
      await database.system.updateSettings(settings)
      
      setSuccess('설정이 성공적으로 저장되었습니다.')
      
      // API 상태 다시 확인
      await checkApiStatus()
      
    } catch (error) {
      console.error('설정 저장 오류:', error)
      setError('설정을 저장하는 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const testGoogleDriveApi = async () => {
    try {
      setError('')
      setSuccess('')
      
      // 구글 드라이브 API 초기화
      const initialized = await googleDriveHelper.initializeFromSystemSettings()
      
      if (!initialized) {
        setError('구글 드라이브 API 초기화에 실패했습니다. 인증 정보를 확인하세요.')
        return
      }
      
      setSuccess('구글 드라이브 API 연결 테스트에 성공했습니다.')
      
      // API 상태 다시 확인
      await checkApiStatus()
      
    } catch (error) {
      console.error('구글 드라이브 API 테스트 오류:', error)
      setError('구글 드라이브 API 테스트 중 오류가 발생했습니다: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>설정을 로드하는 중...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
              <p className="text-gray-600 mt-2">시스템 설정 및 API 연동 관리</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={loadSettings}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* API 상태 카드 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Cloud className={`h-8 w-8 ${apiStatus.googleDrive.initialized ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">구글 드라이브 API 상태</dt>
                    <dd className="flex items-center mt-1">
                      {apiStatus.googleDrive.initialized ? (
                        <span className="text-sm text-green-600 font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          연결됨
                        </span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          연결되지 않음
                        </span>
                      )}
                    </dd>
                    {apiStatus.googleDrive.error && (
                      <dd className="mt-1 text-xs text-red-600">{apiStatus.googleDrive.error}</dd>
                    )}
                  </dl>
                </div>
                <div>
                  <button
                    onClick={testGoogleDriveApi}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    테스트
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">이메일 API 상태</dt>
                    <dd className="flex items-center mt-1">
                      <span className="text-sm text-gray-600 font-medium">
                        설정됨
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 설정 폼 */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">구글 드라이브 API 설정</h3>
              <p className="mt-1 text-sm text-gray-500">
                구글 드라이브 API 연동을 위한 서비스 계정 인증 정보를 설정합니다.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-6">
                <div>
                  <label htmlFor="google_drive_credentials" className="block text-sm font-medium text-gray-700">
                    서비스 계정 인증 정보 (JSON)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="google_drive_credentials"
                      name="google_drive_credentials"
                      rows={8}
                      value={settings.google_drive_credentials}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder='{"type": "service_account", "project_id": "...", ...}'
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    구글 클라우드 콘솔에서 생성한 서비스 계정 키(JSON)를 붙여넣으세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">이메일 설정</h3>
              <p className="mt-1 text-sm text-gray-500">
                이메일 발송을 위한 API 키 및 템플릿 설정입니다.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email_api_key" className="block text-sm font-medium text-gray-700">
                    이메일 API 키
                  </label>
                  <input
                    type="password"
                    name="email_api_key"
                    id="email_api_key"
                    value={settings.email_api_key}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email_service_id" className="block text-sm font-medium text-gray-700">
                    이메일 서비스 ID
                  </label>
                  <input
                    type="text"
                    name="email_service_id"
                    id="email_service_id"
                    value={settings.email_service_id}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="email_template_id" className="block text-sm font-medium text-gray-700">
                    이메일 템플릿 ID
                  </label>
                  <input
                    type="text"
                    name="email_template_id"
                    id="email_template_id"
                    value={settings.email_template_id}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="system_email" className="block text-sm font-medium text-gray-700">
                    시스템 이메일
                  </label>
                  <input
                    type="email"
                    name="system_email"
                    id="system_email"
                    value={settings.system_email}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">
                    관리자 이메일
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    id="admin_email"
                    value={settings.admin_email}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            설정 저장
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings
