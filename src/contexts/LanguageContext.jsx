import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext({})

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// 번역 데이터
const translations = {
  ko: {
    // 공통
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    success: '성공했습니다',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    edit: '편집',
    delete: '삭제',
    create: '생성',
    update: '업데이트',
    
    // 네비게이션
    home: '홈',
    campaigns: '캠페인',
    mypage: '마이페이지',
    login: '로그인',
    register: '회원가입',
    logout: '로그아웃',
    
    // 관리자
    admin: '관리자',
    dashboard: '대시보드',
    campaignManagement: '캠페인 관리',
    creatorManagement: '제작자 관리',
    withdrawalManagement: '출금 관리',
    
    // 캠페인
    campaignTitle: '캠페인 제목',
    brand: '브랜드',
    description: '설명',
    reward: '보상',
    status: '상태',
    active: '활성',
    inactive: '비활성',
    draft: '임시저장',
    completed: '완료',
    
    // 신청
    apply: '신청하기',
    application: '신청',
    applications: '신청 목록',
    applicant: '신청자',
    
    // 통계
    totalCampaigns: '총 캠페인',
    totalApplications: '총 신청',
    totalUsers: '총 사용자',
    totalRewards: '총 보상액',
    
    // 메시지
    loginRequired: '로그인이 필요합니다',
    adminRequired: '관리자 권한이 필요합니다',
    noData: '데이터가 없습니다',
    loadingFailed: '데이터 로딩에 실패했습니다'
  },
  ja: {
    // 공통
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    success: '成功しました',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    edit: '編集',
    delete: '削除',
    create: '作成',
    update: '更新',
    
    // 네비게이션
    home: 'ホーム',
    campaigns: 'キャンペーン',
    mypage: 'マイページ',
    login: 'ログイン',
    register: '新規登録',
    logout: 'ログアウト',
    
    // 관리자
    admin: '管理者',
    dashboard: 'ダッシュボード',
    campaignManagement: 'キャンペーン管理',
    creatorManagement: 'クリエイター管理',
    withdrawalManagement: '出金管理',
    
    // 캠페인
    campaignTitle: 'キャンペーンタイトル',
    brand: 'ブランド',
    description: '説明',
    reward: '報酬',
    status: 'ステータス',
    active: 'アクティブ',
    inactive: '非アクティブ',
    draft: '下書き',
    completed: '完了',
    
    // 신청
    apply: '応募する',
    application: '応募',
    applications: '応募一覧',
    applicant: '応募者',
    
    // 통계
    totalCampaigns: '総キャンペーン数',
    totalApplications: '総応募数',
    totalUsers: '総ユーザー数',
    totalRewards: '総報酬額',
    
    // 메시지
    loginRequired: 'ログインが必要です',
    adminRequired: '管理者権限が必要です',
    noData: 'データがありません',
    loadingFailed: 'データの読み込みに失敗しました'
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ja') // 기본값을 일본어로 설정

  useEffect(() => {
    // 홈페이지와 마이페이지는 항상 일본어로 설정
    setLanguage('ja')
    localStorage.setItem('cnec-language', 'ja')
  }, [])

  const changeLanguage = (newLanguage) => {
    if (['ko', 'ja'].includes(newLanguage)) {
      setLanguage(newLanguage)
      localStorage.setItem('cnec-language', newLanguage)
    }
  }

  const t = (key) => {
    return translations[language][key] || key
  }

  const value = {
    language,
    changeLanguage,
    t,
    isKorean: language === 'ko',
    isJapanese: language === 'ja'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
