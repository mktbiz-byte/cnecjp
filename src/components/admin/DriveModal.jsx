import React, { useState, useEffect } from 'react';
import { 
  Loader2, Save, X, Copy, ExternalLink, 
  FolderOpen, Presentation, AlertCircle, CheckCircle
} from 'lucide-react';

/**
 * 구글 드라이브 및 슬라이드 URL 관리 모달 컴포넌트
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Object} props.application - 선택된 신청서 데이터
 * @param {Object} props.campaign - 선택된 캠페인 데이터
 * @param {Function} props.onSave - 저장 함수
 * @param {boolean} props.processing - 처리 중 상태
 * @param {string} props.error - 에러 메시지
 * @param {string} props.success - 성공 메시지
 * @param {Object} props.texts - 다국어 텍스트
 */
const DriveModal = ({ 
  isOpen, 
  onClose, 
  application, 
  campaign,
  onSave, 
  processing, 
  error, 
  success,
  texts
}) => {
  const [formData, setFormData] = useState({
    google_drive_url: '',
    google_slides_url: '',
    notes: ''
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState({
    drive: false,
    slides: false
  });
  
  // 선택된 신청서가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (application) {
      setFormData({
        google_drive_url: application.google_drive_url || '',
        google_slides_url: application.google_slides_url || '',
        notes: application.additional_info || ''
      });
      setPreviewMode(!!application.google_drive_url || !!application.google_slides_url);
    }
  }, [application]);
  
  // URL 생성은 관리자가 직접 입력하는 방식으로 변경됨
  
  // URL 복사 함수
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    });
  };
  
  // 저장 함수
  const handleSave = () => {
    onSave(formData);
  };
  
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen || !application) return null;
  
  const t = texts || {};
  
  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div className="fixed inset-0 z-[99998] transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* 모달 센터링을 위한 트릭 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* 모달 컨텐츠 */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-[99999]">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t.driveAccessTitle || '구글 드라이브 및 슬라이드 제공'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* 설명 */}
          <p className="text-sm text-gray-500 mb-4">
            {t.driveAccessDescription || '승인된 참가자에게 구글 드라이브(영상 업로드용)와 구글 슬라이드(가이드)를 제공합니다.'}
          </p>
          
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 성공 메시지 */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 직접 입력 안내 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              {t.manualInputDescription || '구글 드라이브와 슬라이드 URL을 직접 입력해주세요. 참가자에게 공유할 링크입니다.'}
            </p>
          </div>

          {/* 폼 필드 */}
          <div className="space-y-5">
            {/* 구글 드라이브 URL */}
            <div>
              <label htmlFor="google_drive_url" className="block text-sm font-medium text-gray-700 mb-1">
                {t.googleDriveUrl || '구글 드라이브 URL (영상 업로드용)'}
              </label>
              
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="google_drive_url"
                  value={formData.google_drive_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_drive_url: e.target.value }))}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-20 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://drive.google.com/..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <div className="flex space-x-1 mr-2">
                    {formData.google_drive_url && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(formData.google_drive_url, 'drive')}
                          className="inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-600"
                          title="URL 복사"
                        >
                          {copied.drive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={formData.google_drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-600"
                          title="새 탭에서 열기"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {previewMode && formData.google_drive_url && (
                <div className="mt-2 flex items-center p-3 bg-blue-50 rounded-md">
                  <FolderOpen className="h-5 w-5 text-blue-500 mr-2" />
                  <a 
                    href={formData.google_drive_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex-1 truncate"
                  >
                    {formData.google_drive_url}
                  </a>
                </div>
              )}
            </div>
            
            {/* 구글 슬라이드 URL */}
            <div>
              <label htmlFor="google_slides_url" className="block text-sm font-medium text-gray-700 mb-1">
                {t.googleSlidesUrl || '구글 슬라이드 URL (가이드)'}
              </label>
              
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="google_slides_url"
                  value={formData.google_slides_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_slides_url: e.target.value }))}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-20 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://docs.google.com/presentation/..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <div className="flex space-x-1 mr-2">
                    {formData.google_slides_url && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(formData.google_slides_url, 'slides')}
                          className="inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-600"
                          title="URL 복사"
                        >
                          {copied.slides ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={formData.google_slides_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center p-1 border border-transparent rounded-md text-gray-400 hover:text-gray-600"
                          title="새 탭에서 열기"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {previewMode && formData.google_slides_url && (
                <div className="mt-2 flex items-center p-3 bg-purple-50 rounded-md">
                  <Presentation className="h-5 w-5 text-purple-500 mr-2" />
                  <a 
                    href={formData.google_slides_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline flex-1 truncate"
                  >
                    {formData.google_slides_url}
                  </a>
                </div>
              )}
            </div>
            
            {/* 추가 메모 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                {t.notes || '추가 메모'}
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="추가 안내사항이나 메모를 입력하세요..."
                rows={3}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t.cancel || '취소'}
            </button>
            <button
              onClick={handleSave}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t.save || '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveModal;
