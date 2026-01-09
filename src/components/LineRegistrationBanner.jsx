import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const LINE_FRIEND_URL = 'https://line.me/R/ti/p/@cnec'

const LineRegistrationBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Check if banner was previously minimized in this session
    const minimized = sessionStorage.getItem('line_banner_minimized')
    if (minimized === 'true') {
      setIsMinimized(true)
    }
    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleMinimize = () => {
    setIsMinimized(true)
    sessionStorage.setItem('line_banner_minimized', 'true')
  }

  const handleExpand = () => {
    setIsMinimized(false)
    sessionStorage.removeItem('line_banner_minimized')
  }

  const handleClick = () => {
    window.open(LINE_FRIEND_URL, '_blank')
  }

  if (!isVisible) return null

  // Minimized state - small floating icon
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleExpand}
          className="bg-[#06C755] rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-200 animate-bounce"
          aria-label="LINE友だち追加"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </button>
        {/* Small tooltip */}
        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          LINE友だち追加
        </div>
      </div>
    )
  }

  // Full banner state
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="relative bg-[#06C755] rounded-2xl shadow-2xl p-4 max-w-xs">
        {/* Minimize button */}
        <button
          onClick={handleMinimize}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="最小化"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3">
          {/* LINE Icon */}
          <div className="flex-shrink-0 bg-white rounded-full p-2">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="#06C755"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1">
            <p className="text-white font-bold text-sm mb-1">
              LINE友だち追加
            </p>
            <p className="text-white/90 text-xs mb-3 leading-relaxed">
              キャンペーン承認通知を<br/>受け取れます！
            </p>
            <button
              onClick={handleClick}
              className="w-full bg-white text-[#06C755] font-bold py-2 px-4 rounded-full text-sm hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1"
            >
              <span>友だち追加</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>

        {/* LINE ID */}
        <p className="text-white/70 text-xs text-center mt-2">
          LINE ID: @cnec
        </p>
      </div>
    </div>
  )
}

// Compact version for inline use
export const LineRegistrationCard = ({ className = '' }) => {
  const handleClick = () => {
    window.open(LINE_FRIEND_URL, '_blank')
  }

  return (
    <div className={`bg-[#06C755] rounded-xl p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        {/* LINE Icon */}
        <div className="flex-shrink-0 bg-white rounded-full p-2">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="#06C755"
          >
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-white font-bold text-sm">
            LINE友だち追加
          </p>
          <p className="text-white/80 text-xs">
            承認通知を受け取る
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleClick}
          className="bg-white text-[#06C755] font-bold py-2 px-4 rounded-full text-sm hover:bg-gray-100 transition-colors"
        >
          追加
        </button>
      </div>
    </div>
  )
}

// Button only version
export const LineAddFriendButton = ({ className = '', size = 'md' }) => {
  const handleClick = () => {
    window.open(LINE_FRIEND_URL, '_blank')
  }

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  }

  return (
    <button
      onClick={handleClick}
      className={`bg-[#06C755] text-white font-bold rounded-full hover:bg-[#05a847] transition-colors flex items-center justify-center space-x-2 ${sizeClasses[size]} ${className}`}
    >
      <svg
        className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
      <span>LINE友だち追加</span>
    </button>
  )
}

export default LineRegistrationBanner
