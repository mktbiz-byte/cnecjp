import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database, supabase } from '../lib/supabase'
import {
  User, Mail, Phone, MapPin, Calendar, Award,
  CreditCard, Download, Settings, LogOut,
  AlertTriangle, Trash2, Shield, Eye, EyeOff, X,
  Camera, Upload, Film, BookOpen, Layers,
  Home, Wallet, ChevronRight, Star, TrendingUp, Menu, MessageSquare, Send
} from 'lucide-react'
import ShootingGuideModal from './ShootingGuideModal'
import ExternalGuideViewer from './ExternalGuideViewer'
import VideoUploadModal from './VideoUploadModal'
import MyPageCampaignsTab from './MyPageCampaignsTab'

// PayPal 정보 추출 헬퍼 함수
const extractPayPalFromDescription = (description) => {
  if (!description) return ''
  
  // "출금 신청: 50000포인트 (PayPal: MKT@HOWLAB.CO.KR)" 형식에서 이메일 추출
  const paypalMatch1 = description.match(/\(PayPal:\s*([^)]+)\)/)
  if (paypalMatch1) {
    return paypalMatch1[1].trim()
  }
  
  // "PayPal: email@example.com" 형식에서 이메일 추출
  const paypalMatch2 = description.match(/PayPal:\s*([^)]+)/)
  if (paypalMatch2) {
    return paypalMatch2[1].trim()
  }
  
  // "출금 신청: 20000 (PayPal: 123)" 형식에서 정보 추출
  const paypalMatch3 = description.match(/\(PayPal:\s*([^)]+)\)/)
  if (paypalMatch3) {
    return paypalMatch3[1].trim()
  }
  
  // 이메일 패턴 직접 추출
  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  if (emailMatch) {
    return emailMatch[1]
  }
  
  return ''
}

const MyPageWithWithdrawal = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [pointTransactions, setPointTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 문의하기 모달 상태
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({ category: '', subject: '', message: '' })
  const [inquirySubmitting, setInquirySubmitting] = useState(false)
  const [inquirySuccess, setInquirySuccess] = useState(false)

  // 회원 탈퇴 관련 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [withdrawalReason, setWithdrawalReason] = useState('')
  const [withdrawalDetails, setWithdrawalDetails] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 출금 신청 관련 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    paypalEmail: '',
    paypalName: '',
    reason: ''
  })

  // SNS 업로드 및 포인트 신청 관련 상태
  const [showSnsUploadModal, setShowSnsUploadModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [snsUploadForm, setSnsUploadForm] = useState({
    sns_upload_url: '',
    notes: ''
  })

  // 촬영 가이드 및 영상 업로드 관련 상태
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false)
  const [selectedGuideApplication, setSelectedGuideApplication] = useState(null)

  // 프로필 편집 관련 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    nickname: '',
    name: '',
    phone: '',
    bio: '',
    age: '',
    region: '',
    skin_type: '',
    profile_image: '',

    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    other_sns_url: '',
    instagram_followers: '',
    tiktok_followers: '',
    youtube_subscribers: '',

    sms_consent: true,
    email_consent: true
  })

  // 다국어 텍스트
  const texts = {
    ko: {
      title: '마이페이지',
      profile: '프로필',
      applications: '신청 내역',
      withdrawals: '출금 내역',
      points: '포인트 내역',
      accountSettings: '계정 설정',
      personalInfo: '개인정보',
      name: '이름',
      email: '이메일',
      phone: '전화번호',
      address: '주소',
      joinDate: '가입일',
      userRole: '사용자 등급',
      currentPoints: '보유 포인트',
      totalEarned: '총 획득 포인트',
      campaignApplications: '캠페인 신청',
      totalApplications: '총 신청 수',
      approvedApplications: '승인된 신청',
      completedCampaigns: '완료된 캠페인',
      withdrawalHistory: '출금 내역',
      totalWithdrawn: '총 출금액',
      pendingWithdrawals: '출금 대기',
      pointHistory: '포인트 내역',
      transactionType: '거래 유형',
      amount: '금액',
      date: '날짜',
      description: '설명',
      earned: '획득',
      spent: '사용',
      bonus: '보너스',
      withdrawal: '출금',
      withdrawRequest: '출금 신청',
      withdrawRequestTitle: '포인트 출금 신청',
      withdrawAmount: '출금 금액',
      paypalEmail: 'PayPal 이메일',
      paypalName: 'PayPal 계정명',
      withdrawReason: '출금 사유',
      submitWithdrawRequest: '출금 신청하기',
      accountDeletion: '회원 탈퇴',
      deleteAccount: '계정 삭제',
      deleteAccountWarning: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.',
      deleteAccountDescription: '회원 탈퇴를 신청하시면 관리자 검토 후 처리됩니다. 탈퇴 후에는 모든 데이터가 복구 불가능하게 삭제됩니다.',
      withdrawalReason: '탈퇴 사유',
      withdrawalDetails: '상세 내용',
      confirmDeletion: '탈퇴 확인',
      confirmText: '정말로 탈퇴하시겠습니까? 확인하려면 "탈퇴합니다"를 입력하세요.',
      confirmPlaceholder: '탈퇴합니다',
      submitWithdrawal: '탈퇴 신청',
      cancel: '취소',
      processing: '처리 중...',
      logout: '로그아웃',
      goHome: '홈으로 가기',
      noData: '데이터가 없습니다',
      edit: '수정',
      save: '저장',
      skinType: '피부타입',
      postalCode: '우편번호',
      roles: {
        user: '일반 사용자',
        vip: 'VIP 사용자',
        manager: '매니저',
        admin: '관리자'
      },
      reasons: {
        service: '서비스 불만족',
        privacy: '개인정보 우려',
        unused: '서비스 미사용',
        other: '기타'
      },
      snsUpload: 'SNS 업로드',
      snsUploadUrl: 'SNS 업로드 URL',
      pointRequest: '포인트 신청',
      pointRequestTitle: 'SNS 업로드 및 포인트 신청',
      snsUploadDescription: 'SNS에 업로드한 콘텐츠의 URL을 입력하고 포인트를 신청하세요.',
      additionalNotes: '추가 메모',
      submitPointRequest: '포인트 신청하기',
      pointRequestPending: '포인트 신청 대기중',
      pointRequestApproved: '포인트 지급 완료',
      messages: {
        withdrawalSubmitted: '탈퇴 신청이 완료되었습니다. 관리자 검토 후 처리됩니다.',
        error: '오류가 발생했습니다. 다시 시도해주세요.',
        confirmRequired: '탈퇴 확인 문구를 정확히 입력해주세요.',
        reasonRequired: '탈퇴 사유를 선택해주세요.',
        snsUploadSubmitted: 'SNS 업로드 및 포인트 신청이 완료되었습니다.',
        snsUrlRequired: 'SNS 업로드 URL을 입력해주세요.'
      }
    },
    ja: {
      title: 'マイページ',
      profile: 'プロフィール',
      applications: '応募履歴',
      withdrawals: '出金履歴',
      points: 'ポイント履歴',
      accountSettings: 'アカウント設定',
      personalInfo: '個人情報',
      name: '名前',
      email: 'メール',
      phone: '電話番号',
      address: '住所',
      joinDate: '登録日',
      userRole: 'ユーザーランク',
      currentPoints: '保有ポイント',
      totalEarned: '総獲得ポイント',
      campaignApplications: 'キャンペーン応募',
      totalApplications: '総応募数',
      approvedApplications: '承認済み応募',
      completedCampaigns: '完了キャンペーン',
      withdrawalHistory: '出金履歴',
      totalWithdrawn: '総出金額',
      pendingWithdrawals: '出金待ち',
      pointHistory: 'ポイント履歴',
      transactionType: '取引種別',
      amount: '金額',
      date: '日付',
      description: '説明',
      earned: '獲得',
      spent: '使用',
      bonus: 'ボーナス',
      withdrawal: '出金',
      withdrawRequest: '出金申請',
      withdrawRequestTitle: 'ポイント出金申請',
      withdrawAmount: '出金金額',
      paypalEmail: 'PayPal メール',
      paypalName: 'PayPal アカウント名',
      withdrawReason: '出金理由',
      submitWithdrawRequest: '出金申請する',
      accountDeletion: '退会',
      deleteAccount: 'アカウント削除',
      deleteAccountWarning: 'アカウントを削除すると、すべてのデータが永久に削除されます。',
      deleteAccountDescription: '退会申請をすると、管理者の審査後に処理されます。退会後はすべてのデータが復旧不可能に削除されます。',
      withdrawalReason: '退会理由',
      withdrawalDetails: '詳細内容',
      confirmDeletion: '退会確認',
      confirmText: '本当に退会しますか？確認するには「退会します」と入力してください。',
      confirmPlaceholder: '退会します',
      submitWithdrawal: '退会申請',
      cancel: 'キャンセル',
      processing: '処理中...',
      logout: 'ログアウト',
      goHome: 'ホームに戻る',
      noData: 'データがありません',
      edit: '編集',
      save: '保存',
      skinType: '肌タイプ',
      postalCode: '郵便番号',
      age: '年齢',
      region: '地域',
      bio: '自己紹介',
 
      instagramFollowers: 'Instagramフォロワー数',
      tiktokFollowers: 'TikTokフォロワー数',
      youtubeSubscribers: 'YouTube登録者数',
      roles: {
        user: '一般ユーザー',
        vip: 'VIPユーザー',
        manager: 'マネージャー',
        admin: '管理者'
      },
      reasons: {
        service: 'サービス不満',
        privacy: 'プライバシー懸念',
        unused: 'サービス未使用',
        other: 'その他'
      },
      snsUpload: 'SNS投稿',
      snsUploadUrl: 'SNS投稿URL',
      pointRequest: 'ポイント申請',
      pointRequestTitle: 'SNS投稿およびポイント申請',
      snsUploadDescription: 'SNSに投稿したコンテンツのURLを入力してポイントを申請してください。',
      additionalNotes: '追加メモ',
      submitPointRequest: 'ポイント申請する',
      pointRequestPending: 'ポイント申請待ち',
      pointRequestApproved: 'ポイント支給完了',
      messages: {
        withdrawalSubmitted: '退会申請が完了しました。管理者の審査後に処理されます。',
        error: 'エラーが発生しました。再度お試しください。',
        confirmRequired: '退会確認文を正確に入力してください。',
        reasonRequired: '退会理由を選択してください。',
        snsUploadSubmitted: 'SNS投稿およびポイント申請が完了しました。',
        snsUrlRequired: 'SNS投稿URLを入力してください。'
      }
    }
  }

  const t = texts[language] || texts.ko

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // 프로필 정보 로드
      const profileData = await database.userProfiles.get(user.id)
      setProfile(profileData)
      
      // 편집 폼 초기화 (실제 테이블 구조에 맞게)
      if (profileData) {
        setEditForm({
          nickname: profileData.nickname || '',
          name: profileData.name || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          age: profileData.age || '',
          region: profileData.region || '',
          skin_type: profileData.skin_type || '',
          profile_image: profileData.profile_image || '',

          instagram_url: profileData.instagram_url || '',
          tiktok_url: profileData.tiktok_url || '',
          youtube_url: profileData.youtube_url || '',
          other_sns_url: profileData.other_sns_url || '',
          instagram_followers: profileData.instagram_followers || '',
          tiktok_followers: profileData.tiktok_followers || '',
          youtube_subscribers: profileData.youtube_subscribers || '',

          sms_consent: profileData.sms_consent !== undefined ? profileData.sms_consent : true,
          email_consent: profileData.email_consent !== undefined ? profileData.email_consent : true
        })
      }
      
      // 신청 내역 로드
      const applicationsData = await database.applications.getByUser(user.id)
      setApplications(applicationsData || [])
      
      // 출금 내역 로딩 (point_transactions 테이블에서 직접 가져오기)
      try {
        const { data: pointWithdrawals, error: pointError } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .lt('amount', 0) // 음수 금액 (출금)
          .order('created_at', { ascending: false })
        
        if (pointError) {
          console.warn('point_transactions에서 출금 데이터 로드 실패:', pointError)
          setWithdrawals([])
        } else {
          // point_transactions 데이터를 withdrawal_requests 형식으로 변환
          const formattedWithdrawals = (pointWithdrawals || []).map(item => {
            // description에서 상태 추출
            let status = 'pending'
            if (item.description?.includes('[상태:승인됨]') || item.description?.includes('[状態:承認済み]')) {
              status = 'approved'
            } else if (item.description?.includes('[상태:완료됨]') || item.description?.includes('[状態:完了]')) {
              status = 'completed'
            } else if (item.description?.includes('[상태:거부됨]') || item.description?.includes('[状態:拒否済み]')) {
              status = 'rejected'
            }
            
            return {
              id: item.id,
              user_id: item.user_id,
              amount: Math.abs(item.amount),
              status: status,
              withdrawal_method: 'paypal',
              paypal_email: extractPayPalFromDescription(item.description),
              paypal_name: extractPayPalFromDescription(item.description),
              reason: item.description,
              created_at: item.created_at,
              updated_at: item.updated_at
            }
          })
          
          // 중복 제거: 같은 사용자, 같은 금액, 같은 날짜의 출금 신청을 하나로 합침
          const uniqueWithdrawals = []
          const seen = new Set()
          
          for (const withdrawal of formattedWithdrawals) {
            const key = `${withdrawal.user_id}-${withdrawal.amount}-${withdrawal.created_at.split('T')[0]}`
            if (!seen.has(key)) {
              seen.add(key)
              uniqueWithdrawals.push(withdrawal)
            }
          }
          
          setWithdrawals(uniqueWithdrawals)
          // 출금 내역 로딩 완료
        }
      } catch (withdrawErr) {
        console.warn('출금 내역 로딩 실패:', withdrawErr)
        setWithdrawals([])
      }
      
      // 포인트 거래 내역 로딩 (모든 포인트 거래 표시)
      try {
        const { data: pointData, error: pointError } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (pointError) {
          console.warn('포인트 거래 내역 로딩 오류:', pointError)
          setPointTransactions([])
        } else {
          // 포인트 내역에서도 중복 제거: 같은 사용자, 같은 금액, 같은 날짜의 거래를 하나로 합침
          const uniquePointTransactions = []
          const seen = new Set()
          
          for (const transaction of (pointData || [])) {
            const key = `${transaction.user_id}-${transaction.amount}-${transaction.created_at.split('T')[0]}-${transaction.description || ''}`
            if (!seen.has(key)) {
              seen.add(key)
              uniquePointTransactions.push(transaction)
            }
          }
          
          setPointTransactions(uniquePointTransactions)
          // 포인트 거래 내역 로딩 완료
        }
      } catch (pointErr) {
        console.warn('포인트 거래 내역 로딩 실패:', pointErr)
        setPointTransactions([])
      }
      
      // 프로필의 points 컬럼을 그대로 사용 (이미 profileData에 포함됨)
      // 별도의 포인트 계산 없이 데이터베이스의 points 값을 신뢰
      
    } catch (error) {
      console.error('사용자 데이터 로드 오류')
      // 프로필 데이터가 없어도 페이지는 표시되도록 함
      if (!profile) {
        setProfile({
          name: user?.user_metadata?.full_name || user?.email || '',
          email: user?.email || '',
          phone_number: '',
          address: '',
          created_at: new Date().toISOString(),
          user_role: 'user',
          points: 0
        })
      }
      // 오류 메시지는 콘솔에만 표시하고 UI에는 표시하지 않음
      console.warn('일부 데이터 로드에 실패했지만 페이지는 계속 표시됩니다.')
      setError('') // 오류 상태 초기화
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    try {
      setProcessing(true)
      setError('')
      
      // 숫자 필드 유효성 검사
  const validateNumber = (value, fieldName) => {
    // 빈 값이나 undefined는 null로 처리 (허용)
    if (!value || value === '' || value === undefined) {
      return null
    }
    
    // 숫자로 변환 시도
    const numValue = Number(value)
    if (isNaN(numValue)) {
      throw new Error(language === 'ja' ? `${fieldName}は数値で入力してください。` : `${fieldName}은(는) 숫자로 입력해주세요.`)
    }
    
    // 음수는 허용하지 않음 (나이, 팔로워 수 등)
    if (numValue < 0) {
      throw new Error(language === 'ja' ? `${fieldName}は0以上の数値で入力してください。` : `${fieldName}은(는) 0 이상의 숫자로 입력해주세요.`)
    }
    
    return numValue
  }

      // 업데이트할 데이터 준비 (실제 테이블 구조에 맞게, 빈 값도 허용)
      // 안전한 프로필 업데이트 데이터 생성 (존재하는 컬럼만 포함)
      const updateData = {}
      
      // 기본 정보 필드들 (안전하게 추가)
      if (editForm.nickname !== undefined) updateData.nickname = editForm.nickname?.trim() || null
      if (editForm.name !== undefined) updateData.name = editForm.name?.trim() || null
      if (editForm.phone !== undefined) updateData.phone = editForm.phone?.trim() || null
      if (editForm.bio !== undefined) updateData.bio = editForm.bio?.trim() || null
      if (editForm.region !== undefined) updateData.region = editForm.region?.trim() || null
      if (editForm.skin_type !== undefined) updateData.skin_type = editForm.skin_type?.trim() || null
      
      // 나이 필드 (숫자 검증)
      if (editForm.age !== undefined) {
        try {
          updateData.age = validateNumber(editForm.age, language === 'ja' ? '年齢' : '나이')
        } catch (err) {
          console.warn('나이 필드 검증 실패:', err.message)
          updateData.age = null
        }
      }
      
      // SNS URL 필드들 (빈 값 허용)
      if (editForm.instagram_url !== undefined) updateData.instagram_url = editForm.instagram_url?.trim() || null
      if (editForm.tiktok_url !== undefined) updateData.tiktok_url = editForm.tiktok_url?.trim() || null
      if (editForm.youtube_url !== undefined) updateData.youtube_url = editForm.youtube_url?.trim() || null
      if (editForm.other_sns_url !== undefined) updateData.other_sns_url = editForm.other_sns_url?.trim() || null
      
      // SNS 팔로워 수 필드들 (숫자 검증, 빈 값 허용)
      if (editForm.instagram_followers !== undefined) {
        try {
          updateData.instagram_followers = validateNumber(editForm.instagram_followers, 'Instagram ' + (language === 'ja' ? 'フォロワー数' : '팔로워 수'))
        } catch (err) {
          console.warn('Instagram 팔로워 수 검증 실패:', err.message)
          updateData.instagram_followers = null
        }
      }
      
      if (editForm.tiktok_followers !== undefined) {
        try {
          updateData.tiktok_followers = validateNumber(editForm.tiktok_followers, 'TikTok ' + (language === 'ja' ? 'フォロワー数' : '팔로워 수'))
        } catch (err) {
          console.warn('TikTok 팔로워 수 검증 실패:', err.message)
          updateData.tiktok_followers = null
        }
      }
      
      if (editForm.youtube_subscribers !== undefined) {
        try {
          updateData.youtube_subscribers = validateNumber(editForm.youtube_subscribers, 'YouTube ' + (language === 'ja' ? '登録者数' : '구독자 수'))
        } catch (err) {
          console.warn('YouTube 구독자 수 검증 실패:', err.message)
          updateData.youtube_subscribers = null
        }
      }
      
      // 프로필 사진
      if (editForm.profile_image !== undefined) updateData.profile_image = editForm.profile_image || null

      // 마케팅 수신 동의
      if (editForm.sms_consent !== undefined) updateData.sms_consent = editForm.sms_consent
      if (editForm.email_consent !== undefined) updateData.email_consent = editForm.email_consent
      
      // 업데이트 시간 추가
      updateData.updated_at = new Date().toISOString()

      // 프로필 업데이트
      
      // Supabase 직접 업데이트 사용
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
      
      if (updateError) {
        console.error('프로필 업데이트 오류')
        throw new Error(updateError.message)
      }

      // 성공
      
      // 로컬 상태 업데이트
      setProfile(prev => ({ ...prev, ...updateData }))
      
      setSuccess(language === 'ja' ? 'プロフィールが正常に更新されました。' : '프로필이 성공적으로 업데이트되었습니다.')
      setIsEditing(false)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      setError(error.message || (language === 'ja' ? 'プロフィールの更新に失敗しました。' : '프로필 업데이트에 실패했습니다.'))
    } finally {
      setProcessing(false)
    }
  }

  // 프로필 사진 업로드 핸들러
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      setError(language === 'ja' ? '画像ファイルを選択してください' : '이미지 파일을 선택해주세요')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(language === 'ja' ? 'ファイルサイズは5MB以下にしてください' : '파일 크기는 5MB 이하로 해주세요')
      return
    }

    try {
      setProcessing(true)
      setError('')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) {
        // 버킷이 없으면 campaign-images 버킷으로 폴백
        const { error: fallbackError } = await supabase.storage
          .from('campaign-images')
          .upload(`profiles/${fileName}`, file, { cacheControl: '3600', upsert: true })

        if (fallbackError) throw fallbackError

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-images')
          .getPublicUrl(`profiles/${fileName}`)

        // DB 업데이트
        await supabase.from('user_profiles').update({ profile_image: publicUrl, updated_at: new Date().toISOString() }).eq('user_id', user.id)
        setProfile(prev => ({ ...prev, profile_image: publicUrl }))
        setEditForm(prev => ({ ...prev, profile_image: publicUrl }))
        setSuccess(language === 'ja' ? 'プロフィール写真を更新しました' : '프로필 사진이 업데이트되었습니다')
        setTimeout(() => setSuccess(''), 3000)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      // DB 업데이트
      await supabase.from('user_profiles').update({ profile_image: publicUrl, updated_at: new Date().toISOString() }).eq('user_id', user.id)
      setProfile(prev => ({ ...prev, profile_image: publicUrl }))
      setEditForm(prev => ({ ...prev, profile_image: publicUrl }))
      setSuccess(language === 'ja' ? 'プロフィール写真を更新しました' : '프로필 사진이 업데이트되었습니다')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Profile image upload error:', err)
      setError(language === 'ja' ? '写真のアップロードに失敗しました' : '사진 업로드에 실패했습니다')
    } finally {
      setProcessing(false)
    }
  }

  // 출금 신청 처리 함수
  const handleWithdrawSubmit = async () => {
    if (!withdrawForm.amount || !withdrawForm.paypalEmail || !withdrawForm.paypalName) {
      setError(language === 'ja' ? 'すべての必須項目を入力してください。' : '모든 필수 항목을 입력해주세요.')
      return
    }

    const requestAmount = parseInt(withdrawForm.amount)
    const currentPoints = profile?.points || 0

    if (requestAmount > currentPoints) {
      setError(language === 'ja' ? '保有ポイントより多い金額は出金できません。' : '보유 포인트보다 많은 금액을 출금할 수 없습니다.')
      return
    }

    if (requestAmount < 1000) {
      setError(language === 'ja' ? '最小出金額は1,000ポイントです。' : '최소 출금 금액은 1,000포인트입니다.')
      return
    }

    try {
      setProcessing(true)
      setError('')

      // withdrawal_requests 테이블에 출금 신청 기록
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          user_id: user.id,
          amount: requestAmount,
          withdrawal_method: 'paypal',
          paypal_email: withdrawForm.paypalEmail,
          paypal_name: withdrawForm.paypalName,
          reason: withdrawForm.reason || (language === 'ja' ? 'ポイント出金申請' : '포인트 출금 신청'),
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()

      if (withdrawalError) {
        console.error('출금 신청 오류:', withdrawalError)
        throw new Error(withdrawalError.message)
      }

      // 출금 신청 완료

      // 실제 사용자 프로필의 포인트 차감
      const newPoints = currentPoints - requestAmount
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ points: newPoints })
        .eq('user_id', user.id)

      if (profileUpdateError) {
        console.error('프로필 포인트 업데이트 오류:', profileUpdateError)
        throw new Error('포인트 차감에 실패했습니다.')
      }

      // 포인트 차감 기록을 point_transactions에 추가 (출금 신청이 아닌 포인트 사용으로 기록)
      const { error: pointError } = await supabase
        .from('point_transactions')
        .insert([{
          user_id: user.id,
          amount: -requestAmount,
          transaction_type: 'spent',
          description: language === 'ja' ? `ポイント使用: 出金申請` : `포인트 사용: 출금 신청`,
          created_at: new Date().toISOString()
        }])

      if (pointError) {
        console.warn('포인트 차감 기록 실패:', pointError)
        // 포인트 기록 실패는 치명적이지 않으므로 계속 진행
      }
      
      setSuccess(language === 'ja' ? '出金申請が完了しました。管理者の審査後に処理されます。' : '출금 신청이 완료되었습니다. 관리자 검토 후 처리됩니다.')
      setShowWithdrawModal(false)
      setWithdrawForm({
        amount: '',
        paypalEmail: '',
        paypalName: '',
        reason: ''
      })
      
      // 데이터를 다시 로드하여 최신 상태 반영
      await loadUserData()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('출금 신청 오류:', error)
      setError(error.message || (language === 'ja' ? '出金申請中にエラーが発生しました。再度お試しください。' : '출금 신청 중 오류가 발생했습니다. 다시 시도해주세요.'))
    } finally {
      setProcessing(false)
    }
  }



  // SNS 업로드 모달에서 제출 처리
  const handleSnsUploadSubmit = async () => {
    try {
      if (!snsUploadForm.sns_upload_url || typeof snsUploadForm.sns_upload_url !== 'string' || !snsUploadForm.sns_upload_url.trim()) {
        setError(t.messages?.snsUrlRequired || (language === 'ja' ? 'SNS投稿URLを入力してください。' : 'SNS 업로드 URL을 입력해주세요.'))
        return
      }

      if (!selectedApplication) {
        setError(language === 'ja' ? '選択されたアプリケーションが見つかりません。' : '선택된 신청을 찾을 수 없습니다.')
        return
      }
      
      setProcessing(true)
      setError('')
      
      // URL 유효성 검사
      try {
        new URL(snsUploadForm.sns_upload_url)
      } catch (urlError) {
        setError(language === 'ja' ? '有効なURLを入力してください。' : '유효한 URL을 입력해주세요.')
        setProcessing(false)
        return
      }
      
      // applications 테이블의 기존 컬럼 활용
      const updateData = {
        video_links: snsUploadForm.sns_upload_url, // SNS URL을 video_links에 저장
        additional_info: snsUploadForm.notes, // 추가 메모를 additional_info에 저장
        updated_at: new Date().toISOString()
      }
      
      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', selectedApplication.id)
        .eq('user_id', user.id) // 보안을 위해 user_id도 확인
      
      if (updateError) {
        console.error('Application update error:', updateError)
        throw new Error(language === 'ja' ? 'SNS投稿の更新に失敗しました。' : 'SNS 업로드 업데이트에 실패했습니다.')
      }
      
      // point_transactions 테이블에 포인트 신청 기록 추가
      try {
        const { error: pointError } = await supabase
          .from('point_transactions')
          .insert({
            user_id: user.id,
            campaign_id: selectedApplication.campaign_id,
            application_id: selectedApplication.id,
            transaction_type: 'pending',
            amount: 0, // 승인 전이므로 0
            description: `SNS 업로드 포인트 신청: ${snsUploadForm.sns_upload_url}`,
            created_at: new Date().toISOString()
          })
        
        if (pointError) {
          console.warn('포인트 신청 기록 추가 실패:', pointError)
          // 포인트 기록 실패는 치명적이지 않으므로 계속 진행
        }
      } catch (pointInsertError) {
        console.warn('Point transaction insert failed:', pointInsertError)
        // 포인트 기록 실패는 치명적이지 않으므로 계속 진행
      }
      
      setSuccess(t.messages?.snsUploadSubmitted || (language === 'ja' ? 'SNS投稿およびポイント申請が完了しました。' : 'SNS 업로드 및 포인트 신청이 완료되었습니다.'))
      setShowSnsUploadModal(false)
      setSnsUploadForm({ sns_upload_url: '', notes: '' })
      setSelectedApplication(null)
      
      // 데이터 새로고침
      await loadUserData()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('SNS 업로드 오류:', error)
      setError(error.message || (language === 'ja' ? 'エラーが発生しました。再試行してください。' : '오류가 발생했습니다. 다시 시도해주세요.'))
    } finally {
      setProcessing(false)
    }
  }

  const openSnsUploadModal = (application) => {
    try {
      // 에러 상태 초기화
      setError('')
      setSuccess('')
      
      if (!application) {
        setError(language === 'ja' ? 'アプリケーション情報が見つかりません。' : '신청 정보를 찾을 수 없습니다.')
        return
      }

      setSelectedApplication(application)
      setSnsUploadForm({
        sns_upload_url: application.video_links || '',
        notes: application.additional_info || ''
      })
      setShowSnsUploadModal(true)
      
      // SNS 업로드 모달 열림
    } catch (error) {
      console.error('SNS 업로드 모달 열기 오류:', error)
      setError(language === 'ja' ? 'モーダルを開けませんでした。' : '모달을 열 수 없습니다.')
    }
  }

  const handleWithdrawalSubmit = async () => {
    if (!withdrawalReason) {
      setError(t.messages.reasonRequired)
      return
    }
    
    if (confirmText !== (language === 'ja' ? '退会します' : '탈퇴합니다')) {
      setError(t.messages.confirmRequired)
      return
    }
    
    try {
      setProcessing(true)
      setError('')
      
      const { error } = await database.supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          reason: withdrawalReason,
          additional_info: withdrawalDetails,
          status: 'pending'
        })
      
      if (error) throw error
      
      setSuccess(t.messages.withdrawalSubmitted)
      setShowWithdrawalModal(false)
      setWithdrawalReason('')
      setWithdrawalDetails('')
      setConfirmText('')
      
      setTimeout(() => setSuccess(''), 5000)
      
    } catch (error) {
      console.error('탈퇴 신청 오류:', error)
      setError(t.messages.error)
    } finally {
      setProcessing(false)
    }
  }

  // 문의하기 제출
  const handleInquirySubmit = async () => {
    if (!inquiryForm.category || !inquiryForm.subject || !inquiryForm.message) {
      setError(language === 'ja' ? 'すべての項目を入力してください' : '모든 항목을 입력해주세요')
      return
    }
    try {
      setInquirySubmitting(true)
      setError('')

      // mailto로 메일 클라이언트 열기
      const mailSubject = encodeURIComponent(`[CNEC問い合わせ] ${inquiryForm.category}: ${inquiryForm.subject}`)
      const mailBody = encodeURIComponent(
        `差出人: ${profile?.name || ''} (${profile?.email || user?.email})\n` +
        `カテゴリ: ${inquiryForm.category}\n` +
        `件名: ${inquiryForm.subject}\n\n` +
        `${inquiryForm.message}`
      )
      const mailtoLink = `mailto:mkt@cnecbiz.com?subject=${mailSubject}&body=${mailBody}`

      // 앵커 태그로 mailto 실행 (가장 안정적)
      const a = document.createElement('a')
      a.href = mailtoLink
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Supabase에도 저장 시도 (DB 백업용)
      try {
        await supabase
          .from('support_inquiries')
          .insert({
            user_id: user.id,
            user_email: profile?.email || user?.email,
            user_name: profile?.name || '',
            category: inquiryForm.category,
            subject: inquiryForm.subject,
            message: inquiryForm.message,
            status: 'pending'
          })
      } catch (dbErr) {
        console.log('DB backup skipped:', dbErr.message)
      }

      setInquirySuccess(true)
      setInquiryForm({ category: '', subject: '', message: '' })
      setTimeout(() => {
        setShowInquiryModal(false)
        setInquirySuccess(false)
      }, 2500)
    } catch (err) {
      console.error('Inquiry submit error:', err)
      // 최종 폴백
      window.location.href = `mailto:mkt@cnecbiz.com?subject=${encodeURIComponent(`[CNEC] ${inquiryForm.subject}`)}&body=${encodeURIComponent(inquiryForm.message)}`
      setShowInquiryModal(false)
    } finally {
      setInquirySubmitting(false)
    }
  }

  const LINE_SUPPORT_URL = 'https://line.me/R/ti/p/@cnec'

  const getRoleBadge = (role) => {
    const badges = {
      user: 'bg-gray-100 text-gray-800',
      vip: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role] || badges.user}`}>
        {t.roles[role] || t.roles.user}
      </span>
    )
  }

  const getTransactionTypeColor = (type) => {
    const colors = {
      earn: 'text-green-600',
      bonus: 'text-blue-600',
      admin_add: 'text-purple-600',
      spend: 'text-red-600',
      admin_subtract: 'text-red-600'
    }
    return colors[type] || 'text-gray-600'
  }

  const getTransactionTypeText = (type) => {
    const types = {
      earn: t.earned,
      earned: t.earned,
      bonus: t.bonus,
      admin_add: t.bonus,
      spend: t.spent,
      spent: t.spent,
      admin_subtract: t.spent,
      pending: language === 'ja' ? '申請中' : '신청중',
      approved: language === 'ja' ? '承認済み' : '승인됨',
      rejected: language === 'ja' ? '拒否済み' : '거부됨',
      completed: language === 'ja' ? '完了' : '완료',
      reward: language === 'ja' ? '報酬' : '보상'
    }
    return types[type] || type
  }

  // Tab configuration for navigation
  const tabItems = [
    { id: 'dashboard', label: language === 'ja' ? 'ダッシュボード' : '대시보드', icon: Layers, mobileLabel: language === 'ja' ? 'ホーム' : '홈' },
    { id: 'applications', label: t.applications, icon: Award, mobileLabel: language === 'ja' ? 'キャンペーン' : '캠페인' },
    { id: 'profile', label: t.profile, icon: User, mobileLabel: language === 'ja' ? 'プロフィール' : '프로필' },
    { id: 'points', label: t.points, icon: TrendingUp, mobileLabel: language === 'ja' ? 'ポイント' : '포인트' },
    { id: 'settings', label: t.accountSettings, icon: Settings, mobileLabel: language === 'ja' ? '設定' : '설정' }
  ]

  // Dashboard helper: get SNS connection status
  const getSnsConnections = () => [
    { name: 'Instagram', url: profile?.instagram_url, followers: profile?.instagram_followers, color: 'from-pink-500 to-purple-500' },
    { name: 'TikTok', url: profile?.tiktok_url, followers: profile?.tiktok_followers, color: 'from-slate-800 to-slate-900' },
    { name: 'YouTube', url: profile?.youtube_url, followers: profile?.youtube_subscribers, color: 'from-red-500 to-red-600' }
  ]

  // Dashboard helper: calculate performance
  const getPerformance = () => {
    const total = applications.length
    const approved = applications.filter(a => ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(a.status)).length
    const completed = applications.filter(a => a.status === 'completed' || a.submission_status === 'submitted').length
    return {
      successRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      completionRate: approved > 0 ? Math.round((completed / approved) * 100) : 0,
      total,
      approved,
      completed
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-slate-400 text-sm">{language === 'ja' ? '読み込み中...' : '로딩중...'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ========== Shared Header Navigation ========== */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-[12px] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/25">C</div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">CNEC Japan</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 tracking-wide">K-Beauty Creator Network</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/" className="text-slate-500 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-all text-sm">ホーム</Link>
              <Link to="/mypage" className="text-blue-600 bg-blue-50 font-medium px-4 py-2 rounded-full text-sm">マイページ</Link>
              <button onClick={signOut} className="text-slate-500 hover:text-blue-600 font-medium px-4 py-2 rounded-full hover:bg-blue-50 transition-all text-sm">ログアウト</button>
            </nav>

            <button
              className="md:hidden p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-100">
              <div className="flex flex-col space-y-1 pt-4">
                <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all">ホーム</Link>
                <Link to="/mypage" className="text-blue-600 bg-blue-50 font-medium py-3 px-4 rounded-2xl">マイページ</Link>
                <button onClick={signOut} className="text-slate-600 hover:text-blue-600 font-medium py-3 px-4 rounded-2xl hover:bg-blue-50 transition-all text-left">ログアウト</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========== PC Layout: Sidebar + Main ========== */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 lg:px-8 py-8 gap-8">
        {/* --- PC Sidebar --- */}
        <aside className="w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-5">
            {/* Instagram-style Profile Card */}
            <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 p-6">
              <div className="text-center mb-5">
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg border-2 border-white" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
                    <span className="text-white text-2xl font-bold">
                      {(profile?.name || user?.email || '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-lg font-bold text-slate-800">{profile?.nickname || profile?.name || user?.email}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{profile?.email || user?.email}</p>
                <div className="mt-2">{getRoleBadge(profile?.user_role)}</div>
              </div>
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{applications.length}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ja' ? '応募' : '신청'}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{(profile?.points || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ja' ? 'ポイント' : '포인트'}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{withdrawals.length}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ja' ? '出金' : '출금'}</div>
                </div>
              </div>
              {/* Withdraw Button */}
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-lg shadow-blue-600/20"
              >
                {t.withdrawRequest}
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="bg-white rounded-[24px] shadow-lg shadow-slate-100/50 border border-slate-100/80 overflow-hidden">
              {tabItems.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{tab.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-300'}`} />
                  </button>
                )
              })}
            </div>

            {/* Sidebar is now lighter - nav actions moved to header */}
          </div>
        </aside>

        {/* --- PC Main Content --- */}
        <main className="flex-1 min-w-0">
          {/* Alert Messages */}
          {error && error !== t.messages?.error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-emerald-800">{success}</p>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 p-6 lg:p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    {profile?.profile_image ? (
                      <img src={profile.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25 flex-shrink-0">
                        <span className="text-white text-2xl font-bold">{(profile?.name || user?.email || '?')[0]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h2 className="text-xl font-bold text-slate-800">{profile?.nickname || profile?.name || user?.email}</h2>
                        {getRoleBadge(profile?.user_role)}
                      </div>
                      <p className="text-sm text-slate-400">{profile?.email || user?.email}</p>
                      {profile?.instagram_url && (
                        <p className="text-xs text-slate-400 mt-0.5">@{profile.instagram_url.split('/').pop() || 'instagram'}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Link to="/profile-beauty" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                          {language === 'ja' ? 'ビューティープロフィール' : '뷰티 프로필'}
                        </Link>
                        <button onClick={() => setActiveTab('profile')} className="px-4 py-2 bg-white text-slate-600 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-50 transition-all">
                          {language === 'ja' ? '基本プロフィール' : '기본 프로필'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex gap-4">
                    <div className="text-center px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{language === 'ja' ? 'ランク' : '등급'}</div>
                      <div className="text-lg font-bold text-slate-800 mt-0.5">{(profile?.user_role || 'user').toUpperCase()}</div>
                    </div>
                    <div className="text-center px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{language === 'ja' ? '登録' : '가입'}</div>
                      <div className="text-lg font-bold text-slate-800 mt-0.5">{profile?.created_at ? new Date(profile.created_at).getFullYear() : '-'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Points Balance Card */}
                  <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-[24px] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">{language === 'ja' ? '保有ポイント' : '보유 포인트'}</span>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          1P = ¥1
                        </span>
                      </div>
                      <div className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                        ¥ {(profile?.points || 0).toLocaleString()}<span className="text-lg text-slate-400">.00</span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setShowWithdrawModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-full transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                          <Wallet className="w-4 h-4" />
                          {t.withdrawRequest}
                        </button>
                        <button onClick={() => setActiveTab('points')} className="flex-1 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white text-sm font-semibold py-3 rounded-full transition-all border border-white/10 flex items-center justify-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          {language === 'ja' ? '収益履歴' : '수익 내역'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Card */}
                  <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-bold text-slate-800">{t.personalInfo}</h3>
                      <button onClick={() => { setActiveTab('profile'); setIsEditing(true); }} className="text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors">
                        {language === 'ja' ? '情報を更新' : '정보 수정'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{t.name}</div>
                        <div className="text-sm font-medium text-slate-800">{profile?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{t.email}</div>
                        <div className="text-sm font-medium text-slate-800 truncate">{profile?.email || user?.email}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{t.phone}</div>
                        <div className="text-sm font-medium text-slate-800">{profile?.phone || (language === 'ja' ? '未登録' : '미등록')}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{language === 'ja' ? '地域' : '지역'}</div>
                        <div className="text-sm font-medium text-slate-800">{profile?.region || (language === 'ja' ? '未設定' : '미설정')}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{t.skinType}</div>
                        <div className="text-sm font-medium text-slate-800">{profile?.skin_type || (language === 'ja' ? '未設定' : '미설정')}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-1">{language === 'ja' ? '自己紹介' : '자기소개'}</div>
                        <div className="text-sm font-medium text-slate-800 line-clamp-2">{profile?.bio || (language === 'ja' ? '未設定' : '미설정')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Active Campaigns Card */}
                  <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-bold text-slate-800">{language === 'ja' ? '参加中のキャンペーン' : '참여중인 캠페인'}</h3>
                      <button onClick={() => setActiveTab('applications')} className="text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors">
                        {language === 'ja' ? 'すべて表示' : '전체 보기'}
                      </button>
                    </div>
                    {applications.filter(a => ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'pending'].includes(a.status)).length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">{language === 'ja' ? '参加中のキャンペーンはありません' : '참여중인 캠페인이 없습니다'}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {applications.filter(a => ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'pending'].includes(a.status)).slice(0, 5).map((app) => (
                          <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100/80 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 text-xs font-bold">K</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800 truncate">{app.campaign_title || (language === 'ja' ? 'キャンペーン' : '캠페인')}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                                  {app.status === 'pending' ? (language === 'ja' ? '審査中' : '심사중') :
                                   app.status === 'approved' || app.status === 'selected' ? (language === 'ja' ? '進行中' : '진행중') :
                                   app.status === 'filming' ? (language === 'ja' ? '撮影中' : '촬영중') :
                                   app.status === 'video_submitted' ? (language === 'ja' ? '動画提出済み' : '영상 제출') :
                                   app.status === 'sns_submitted' ? (language === 'ja' ? 'SNS投稿済み' : 'SNS 제출') :
                                   app.status}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">¥{(app.campaign_reward || 0).toLocaleString()}</span>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Connected Accounts */}
                  <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-4">{language === 'ja' ? '連携アカウント' : '연결된 계정'}</h3>
                    <div className="space-y-3">
                      {getSnsConnections().map((sns) => (
                        sns.url ? (
                          <a key={sns.name} href={sns.url.startsWith('http') ? sns.url : `https://${sns.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 bg-gradient-to-br ${sns.color} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-[10px] font-bold">{sns.name[0]}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{sns.name}</div>
                                {sns.followers ? (
                                  <div className="text-[10px] text-slate-400">{sns.followers.toLocaleString()} {language === 'ja' ? 'フォロワー' : '팔로워'}</div>
                                ) : (
                                  <div className="text-[10px] text-slate-400">{language === 'ja' ? '連携済み' : '연결됨'}</div>
                                )}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-all">ACTIVE ↗</span>
                          </a>
                        ) : (
                          <div key={sns.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 bg-gradient-to-br ${sns.color} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-[10px] font-bold">{sns.name[0]}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-700">{sns.name}</div>
                                <div className="text-[10px] text-slate-400"></div>
                              </div>
                            </div>
                            <button onClick={() => { setActiveTab('profile'); setIsEditing(true); }} className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-all">LINK</button>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      {language === 'ja' ? 'パフォーマンス' : '실적'}
                    </h3>
                    {(() => {
                      const perf = getPerformance()
                      return (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-slate-500">{language === 'ja' ? 'キャンペーン採択率' : '캠페인 채택률'}</span>
                              <span className="text-sm font-bold text-blue-600">{perf.successRate}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{width: `${Math.min(perf.successRate, 100)}%`}} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-slate-500">{language === 'ja' ? '完了率' : '완료율'}</span>
                              <span className="text-sm font-bold text-emerald-600">{perf.completionRate}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{width: `${Math.min(perf.completionRate, 100)}%`}} />
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs text-blue-700 italic leading-relaxed">
                              {perf.total > 0
                                ? (language === 'ja' ? `${perf.approved}件のキャンペーンに参加中です。素晴らしい活躍です！` : `${perf.approved}개의 캠페인에 참여중입니다. 훌륭한 활약이에요!`)
                                : (language === 'ja' ? 'キャンペーンに応募して収益化を開始しましょう！' : '캠페인에 응모하여 수익화를 시작하세요!')}
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Need Help */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[24px] border border-blue-200/50 p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-1 text-center">{language === 'ja' ? 'サポート' : '도움이 필요하세요?'}</h3>
                    <p className="text-xs text-slate-500 mb-4 text-center">{language === 'ja' ? 'LINEまたはお問い合わせフォームでご連絡ください' : 'LINE 또는 문의 폼으로 연락하세요'}</p>
                    <div className="space-y-2.5">
                      <a href={LINE_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#06C755] text-white text-xs font-semibold rounded-full hover:bg-[#05b34d] transition-all shadow-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                        LINE {language === 'ja' ? 'で問い合わせ' : '문의'}
                      </a>
                      <button onClick={() => { setShowInquiryModal(true); setInquirySuccess(false); setInquiryForm({ category: '', subject: '', message: '' }); }} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-blue-600 text-xs font-semibold rounded-full border border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {language === 'ja' ? 'お問い合わせフォーム' : '문의하기'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100/80 ${activeTab === 'dashboard' ? 'hidden' : ''}`}>
          {activeTab === 'profile' && (
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{t.personalInfo}</h2>
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleProfileSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  disabled={processing}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:opacity-50 font-medium transition-all shadow-lg shadow-blue-600/20"
                >
                  {processing ? t.processing : (isEditing ? t.save : t.edit)}
                </button>
              </div>

              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-emerald-800 text-sm">{success}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* プロフィール写真 */}
              <div className="mb-6 flex items-center gap-5">
                <div className="relative group">
                  {(profile?.profile_image || editForm.profile_image) ? (
                    <img src={profile?.profile_image || editForm.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-white" />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">{(profile?.name || user?.email || '?')[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">{language === 'ja' ? 'プロフィール写真' : '프로필 사진'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{language === 'ja' ? 'クリックして変更（5MB以下）' : '클릭하여 변경 (5MB 이하)'}</p>
                  <label className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload className="w-3 h-3" />
                    {language === 'ja' ? '写真を変更' : '사진 변경'}
                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* ビューティープロフィールへのリンク */}
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{language === 'ja' ? 'ビューティープロフィールを充実させましょう' : '뷰티 프로필을 완성해보세요'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{language === 'ja' ? '肌タイプ、コンテンツスタイル、コラボ希望など詳細情報を入力するとキャンペーン採用率がアップします' : '피부 타입, 콘텐츠 스타일, 협업 희망 등 상세 정보를 입력하면 캠페인 채택률이 올라갑니다'}</p>
                  </div>
                  <Link to="/profile-beauty" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-all whitespace-nowrap shadow-lg shadow-blue-600/20">
                    {language === 'ja' ? '設定する' : '설정하기'}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* ニックネーム */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      {language === 'ja' ? 'ニックネーム' : '닉네임'}
                      <span className="text-xs text-blue-500 ml-1">({language === 'ja' ? '企業に表示' : '기업에 표시'})</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.nickname}
                        onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={language === 'ja' ? '例: みーちゃん' : '예: 뷰티러버'}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.nickname || (language === 'ja' ? '未設定' : '미설정')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      {t.name}
                      <span className="text-xs text-slate-400 ml-1">({language === 'ja' ? '選定後のみ公開' : '선정 후에만 공개'})</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.name || (language === 'ja' ? '名前未設定' : '이름 없음')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.email}</label>
                    <p className="mt-1 text-sm text-slate-800">{profile?.email || user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      {t.phone}
                      <span className="text-xs text-gray-500 ml-1">({language === 'ja' ? '任意' : '선택사항'})</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="080-1234-5678"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.phone || (language === 'ja' ? '未登録' : '등록되지 않음')}</p>
                    )}
                  </div>
                  
                  {/* プライバシー通知 */}
                  {isEditing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 col-span-full">
                      <p className="text-xs text-blue-700">
                        {language === 'ja'
                          ? '💡 企業にはニックネームのみが表示されます。実名・住所・連絡先は選定後に該当企業のみに提供されます。'
                          : '💡 기업에는 닉네임만 표시됩니다. 실명·주소·연락처는 선정 후 해당 기업에만 제공됩니다.'}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.skinType}</label>
                    {isEditing ? (
                      <select
                        value={editForm.skin_type}
                        onChange={(e) => setEditForm({...editForm, skin_type: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">選択してください</option>
                        <option value="乾燥肌">乾燥肌</option>
                        <option value="脂性肌">脂性肌</option>
                        <option value="混合肌">混合肌</option>
                        <option value="敏感肌">敏感肌</option>
                        <option value="普通肌">普通肌</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.skin_type || '未設定'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      {t.age}
                      <span className="text-xs text-gray-500 ml-1">({language === 'ja' ? '任意' : '선택사항'})</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.age || ''}
                        onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="25"
                        min="1"
                        max="100"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.age || (language === 'ja' ? '未設定' : '미설정')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      {t.region}
                      <span className="text-xs text-gray-500 ml-1">({language === 'ja' ? '任意' : '선택사항'})</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.region || ''}
                        onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={language === 'ja' ? '東京都' : '서울특별시'}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.region || (language === 'ja' ? '未設定' : '미설정')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      {t.bio}
                      <span className="text-xs text-gray-500 ml-1">({language === 'ja' ? '任意' : '선택사항'})</span>
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows="2"
                        placeholder={language === 'ja' ? '自己紹介を入力してください...' : '자기소개를 입력하세요...'}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">{profile?.bio || (language === 'ja' ? '未設定' : '미설정')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.joinDate}</label>
                    <p className="mt-1 text-sm text-slate-800">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP') : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.userRole}</label>
                    <div className="mt-1">{getRoleBadge(profile?.user_role)}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.currentPoints}</label>
                    <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                      <p className="text-lg font-bold text-blue-600">
                        {profile?.points?.toLocaleString() || 0}P
                      </p>
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors min-h-[44px]"
                      >
                        {t.withdrawRequest}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SNS 주소 섹션 */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-700 mb-4">
                  {language === 'ko' ? 'SNS 주소' : 'SNSアドレス'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">Instagram</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.instagram_url}
                        onChange={(e) => setEditForm({...editForm, instagram_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="https://instagram.com/username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.instagram_url ? (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.instagram_url}
                          </a>
                        ) : (language === 'ja' ? '未登録' : '등록되지 않음')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">TikTok</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.tiktok_url}
                        onChange={(e) => setEditForm({...editForm, tiktok_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="https://tiktok.com/@username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.tiktok_url ? (
                          <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.tiktok_url}
                          </a>
                        ) : (language === 'ja' ? '未登録' : '등록되지 않음')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">YouTube</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.youtube_url}
                        onChange={(e) => setEditForm({...editForm, youtube_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="https://youtube.com/@username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.youtube_url ? (
                          <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.youtube_url}
                          </a>
                        ) : (language === 'ja' ? '未登録' : '등록되지 않음')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{language === 'ja' ? 'その他のSNS' : '기타 SNS'}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.other_sns_url}
                        onChange={(e) => setEditForm({...editForm, other_sns_url: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="https://other-sns.com/username"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.other_sns_url ? (
                          <a href={profile.other_sns_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.other_sns_url}
                          </a>
                        ) : (language === 'ja' ? '未登録' : '등록되지 않음')}
                      </p>
                    )}
                  </div>
                </div>
              </div>



              {/* SNS 팔로워 수 섹션 */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-700 mb-4">
                  {language === 'ja' ? 'SNSフォロワー数' : 'SNS 팔로워 수'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.instagramFollowers}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.instagram_followers}
                        onChange={(e) => setEditForm({...editForm, instagram_followers: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="1000"
                        min="0"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.instagram_followers ? profile.instagram_followers.toLocaleString() : (language === 'ja' ? '未設定' : '설정되지 않음')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.tiktokFollowers}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.tiktok_followers}
                        onChange={(e) => setEditForm({...editForm, tiktok_followers: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="1000"
                        min="0"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.tiktok_followers ? profile.tiktok_followers.toLocaleString() : (language === 'ja' ? '未設定' : '설정되지 않음')}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-500">{t.youtubeSubscribers}</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.youtube_subscribers}
                        onChange={(e) => setEditForm({...editForm, youtube_subscribers: e.target.value})}
                        className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="1000"
                        min="0"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-800">
                        {profile?.youtube_subscribers ? profile.youtube_subscribers.toLocaleString() : (language === 'ja' ? '未設定' : '설정되지 않음')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 마케팅 수신 동의 */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-700 mb-4">
                  {language === 'ja' ? 'マーケティング受信同意' : '마케팅 수신 동의'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sms_consent"
                      checked={editForm.sms_consent}
                      onChange={(e) => setEditForm({...editForm, sms_consent: e.target.checked})}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label htmlFor="sms_consent" className="ml-2 block text-sm text-gray-700">
                      {language === 'ja' ? 'SMS受信同意' : 'SMS 수신 동의'}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email_consent"
                      checked={editForm.email_consent}
                      onChange={(e) => setEditForm({...editForm, email_consent: e.target.checked})}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label htmlFor="email_consent" className="ml-2 block text-sm text-gray-700">
                      {language === 'ja' ? 'メール受信同意' : '이메일 수신 동의'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <MyPageCampaignsTab applications={applications} user={user} />
          )}

          {/* 기존 신청 내역 탭 (숨김) - 백업용 */}
          {activeTab === 'applications_old' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t.campaignApplications}</h2>

              {/* 신청 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.totalApplications}</p>
                      <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.approvedApplications}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(a => ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(a.status)).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Download className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{t.completedCampaigns}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(a => a.submission_status === 'submitted').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 신청 목록 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ko' ? '캠페인' : 'キャンペーン'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ko' ? '상태' : 'ステータス'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ko' ? '신청일' : '応募日'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ko' ? '가이드' : '撮影ガイド'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'ko' ? '자료' : '資料'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          {t.noData}
                        </td>
                      </tr>
                    ) : (
                      applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {application.campaign_title || (language === 'ko' ? '캠페인 정보 없음' : 'キャンペーン情報なし')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(application.status) ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status === 'video_submitted' ? (language === 'ko' ? '영상 제출' : '動画提出済み') :
                               application.status === 'sns_submitted' ? (language === 'ko' ? 'SNS 제출' : 'SNS提出済み') :
                               application.status === 'completed' ? (language === 'ko' ? '완료' : '完了') :
                               application.status === 'selected' ? (language === 'ko' ? '선정됨' : '選定済み') :
                               application.status === 'filming' ? (language === 'ko' ? '촬영중' : '撮影中') :
                               application.status === 'approved' ? (language === 'ko' ? '승인됨' : '承認済み') :
                               application.status === 'rejected' ? (language === 'ko' ? '거절됨' : '拒否済み') :
                               (language === 'ko' ? '대기중' : '待機中')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(application.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}
                          </td>
                          {/* 가이드 열 */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(application.status) && application.campaign_guide_type === 'pdf' && application.campaign_guide_pdf_url ? (
                              <div className="space-y-2">
                                {/* 외부 가이드 (PDF/Google Slides) */}
                                <ExternalGuideViewer
                                  url={application.campaign_guide_pdf_url}
                                  language={language}
                                  compact
                                />

                                {/* 영상 업로드 버튼 */}
                                {application.submission_status !== 'submitted' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedGuideApplication(application)
                                      setShowVideoUploadModal(true)
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                  >
                                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                                    {language === 'ko' ? '영상 업로드' : '動画提出'}
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    <Film className="w-3.5 h-3.5 mr-1.5" />
                                    {language === 'ko' ? '제출완료' : '提出済み'}
                                  </span>
                                )}
                              </div>
                            ) : ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(application.status) && application.personalized_guide ? (
                              <div className="space-y-2">
                                {/* AI 가이드 보기 버튼 */}
                                <button
                                  onClick={() => {
                                    setSelectedGuideApplication(application)
                                    setShowGuideModal(true)
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                                >
                                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                  {language === 'ko' ? '가이드 보기' : 'ガイド表示'}
                                </button>

                                {/* 영상 업로드 버튼 */}
                                {application.submission_status !== 'submitted' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedGuideApplication(application)
                                      setShowVideoUploadModal(true)
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors ml-2"
                                  >
                                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                                    {language === 'ko' ? '영상 업로드' : '動画提出'}
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-800 ml-2">
                                    <Film className="w-3.5 h-3.5 mr-1.5" />
                                    {language === 'ko' ? '제출완료' : '提出済み'}
                                  </span>
                                )}

                                {/* 가이드 발송 상태 표시 */}
                                {application.guide_sent && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {language === 'ko' ? '이메일 발송됨' : 'メール送信済み'}
                                    {application.guide_sent_at && (
                                      <span className="ml-1">
                                        ({new Date(application.guide_sent_at).toLocaleDateString('ja-JP')})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(application.status) ? (
                              <span className="text-xs text-gray-400">
                                {language === 'ko' ? '가이드 준비중' : 'ガイド準備中'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'completed'].includes(application.status) ? (
                              <div className="space-y-2">
                                {/* 송장번호 및 가이드 URL */}
                                {(application.tracking_number || application.guide_url) && (
                                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                    {application.tracking_number && (
                                      <div className="text-xs mb-2">
                                        <span className="font-medium text-gray-700">
                                          {language === 'ko' ? '송장번호:' : '追跡番号:'}
                                        </span>
                                        <span className="ml-2 text-gray-900">{application.tracking_number}</span>
                                      </div>
                                    )}
                                    {application.shipping_date && (
                                      <div className="text-xs mb-2">
                                        <span className="font-medium text-gray-700">
                                          {language === 'ko' ? '발송일:' : '発送日:'}
                                        </span>
                                        <span className="ml-2 text-gray-900">
                                          {new Date(application.shipping_date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}
                                        </span>
                                      </div>
                                    )}
                                    {application.guide_url && (
                                      <div className="text-xs">
                                        <a
                                          href={application.guide_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                          📖 {language === 'ko' ? '가이드 보기' : 'ガイドを見る'}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-2">
                                  {application.google_drive_url && (
                                    <a
                                      href={application.google_drive_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                    >
                                      📁 {language === 'ko' ? '구글 드라이브' : 'Google Drive'}
                                    </a>
                                  )}
                                  {application.google_slides_url && (
                                    <a
                                      href={application.google_slides_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                    >
                                      📊 {language === 'ko' ? '구글 슬라이드' : 'Google Slides'}
                                    </a>
                                  )}
                                </div>
                                
                                {/* SNS 업로드 및 포인트 신청 버튼 */}
                                <div className="mt-2">
                                  {/* video_links가 있고 point_transactions에 승인된 기록이 있으면 완료 상태 */}
                                  {application.video_links && pointTransactions.some(pt => 
                                    pt.application_id === application.id && pt.transaction_type === 'reward'
                                  ) ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                      ✅ {t.pointRequestApproved}
                                    </span>
                                  ) : application.video_links && pointTransactions.some(pt => 
                                    pt.application_id === application.id && pt.transaction_type === 'pending'
                                  ) ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⏳ {t.pointRequestPending}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        openSnsUploadModal(application)
                                      }}
                                      type="button"
                                      className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                    >
                                      📱 {t.snsUpload}
                                    </button>
                                  )}
                                </div>
                                
                                {(!application.google_drive_url && !application.google_slides_url) && (
                                  <span className="text-xs text-gray-400">
                                    {language === 'ko' ? '자료 준비 중' : '資料準備中'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* SNS 업로드 경고 메시지 */}
              {applications.some(app => ['approved', 'selected', 'filming'].includes(app.status)) && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        {language === 'ko' ? '⚠️ SNS 업로드 주의사항' : '⚠️ SNS投稿注意事項'}
                      </p>
                      <p>
                        {language === 'ko' 
                          ? 'SNS 업로드는 영상이 1회 수정된 후 업로드 해주세요. 절대 바로 올리지 마세요.' 
                          : 'SNS投稿は動画を1回修正してからアップロードしてください。絶対にそのまま投稿しないでください。'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{t.withdrawalHistory}</h2>

              {withdrawals.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Wallet className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>{t.noData}</p>
                </div>
              ) : (
                <>
                  {/* Mobile card view */}
                  <div className="sm:hidden space-y-3">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {withdrawal.withdrawal_method === 'paypal' ? 'PayPal' :
                             withdrawal.withdrawal_method === 'bank' ? (language === 'ko' ? '은행 송금' : '銀行振込') :
                             withdrawal.withdrawal_method || 'PayPal'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                            withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {withdrawal.status === 'completed' ? (language === 'ko' ? '완료' : '完了') :
                             withdrawal.status === 'approved' ? (language === 'ko' ? '승인됨' : '承認済み') :
                             withdrawal.status === 'rejected' ? (language === 'ko' ? '거절됨' : '拒否済み') :
                             (language === 'ko' ? '대기중' : '待機中')}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mb-2">¥{withdrawal.amount?.toLocaleString() || '0'}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{language === 'ko' ? '신청일' : '申請日'}: {new Date(withdrawal.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}</span>
                          <span>{withdrawal.processed_at ? `${language === 'ko' ? '처리일' : '処理日'}: ${new Date(withdrawal.processed_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop table view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ko' ? '출금 방법' : '出金方法'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ko' ? '금액' : '金額'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ko' ? '상태' : 'ステータス'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ko' ? '신청일' : '申請日'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'ko' ? '처리일' : '処理日'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {withdrawal.withdrawal_method === 'paypal' ? 'PayPal' :
                               withdrawal.withdrawal_method === 'bank' ? (language === 'ko' ? '은행 송금' : '銀行振込') :
                               withdrawal.withdrawal_method || 'PayPal'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ¥{withdrawal.amount?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {withdrawal.status === 'completed' ? (language === 'ko' ? '완료' : '完了') :
                                 withdrawal.status === 'approved' ? (language === 'ko' ? '승인됨' : '承認済み') :
                                 withdrawal.status === 'rejected' ? (language === 'ko' ? '거절됨' : '拒否済み') :
                                 (language === 'ko' ? '대기중' : '待機中')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(withdrawal.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {withdrawal.processed_at ?
                                new Date(withdrawal.processed_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP') :
                                '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{t.pointHistory}</h2>

              {pointTransactions.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <TrendingUp className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p>{t.noData}</p>
                </div>
              ) : (
                <>
                  {/* Mobile card view */}
                  <div className="sm:hidden space-y-3">
                    {pointTransactions.map((transaction) => (
                      <div key={transaction.id} className="border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                            {getTransactionTypeText(transaction.transaction_type)}
                          </span>
                          <span className={`text-base font-bold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{transaction.description}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Desktop table view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.transactionType}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.amount}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.description}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t.date}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pointTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                                {getTransactionTypeText(transaction.transaction_type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {transaction.description || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              
              {/* SNS 업로드 경고 메시지 */}
              {applications.some(app => ['approved', 'selected', 'filming'].includes(app.status)) && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        {language === 'ko' ? '⚠️ SNS 업로드 주의사항' : '⚠️ SNS投稿注意事項'}
                      </p>
                      <p>
                        {language === 'ko' 
                          ? 'SNS 업로드는 영상이 1회 수정된 후 업로드 해주세요. 절대 바로 올리지 마세요.' 
                          : 'SNS投稿は動画を1回修正してからアップロードしてください。絶対にそのまま投稿しないでください。'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{t.accountSettings}</h2>

              <div className="space-y-6">
                <div className="border border-red-200 rounded-2xl p-6 bg-red-50">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-red-800">{t.accountDeletion}</h3>
                      <p className="mt-2 text-sm text-red-600">{t.deleteAccountWarning}</p>
                      <p className="mt-1 text-sm text-red-600">{t.deleteAccountDescription}</p>
                      <div className="mt-4">
                        <button
                          onClick={() => setShowWithdrawalModal(true)}
                          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-all"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t.deleteAccount}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* ========== Mobile Layout ========== */}
      <div className="md:hidden pb-24">
        {/* Mobile Profile Card (Instagram-style) - hidden on dashboard */}
        <div className={`px-4 pt-5 pb-3 ${activeTab === 'dashboard' ? 'hidden' : ''}`}>
          <div className="bg-white rounded-[24px] shadow-lg shadow-slate-100/50 border border-slate-100/80 p-5">
            <div className="flex items-center gap-4 mb-4">
              {profile?.profile_image ? (
                <img src={profile.profile_image} alt="Profile" className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25 flex-shrink-0">
                  <span className="text-white text-xl font-bold">
                    {(profile?.name || user?.email || '?')[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-800 truncate">{profile?.nickname || profile?.name || user?.email}</h2>
                <p className="text-xs text-slate-400 truncate">{profile?.email || user?.email}</p>
                <div className="mt-1">{getRoleBadge(profile?.user_role)}</div>
              </div>
            </div>
            {/* Mobile Stats Row */}
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100">
              <div className="text-center">
                <div className="text-base font-bold text-slate-800">{applications.length}</div>
                <div className="text-[10px] text-slate-400">{language === 'ja' ? '応募' : '신청'}</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-blue-600">{(profile?.points || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">{language === 'ja' ? 'ポイント' : '포인트'}</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-slate-800">{withdrawals.length}</div>
                <div className="text-[10px] text-slate-400">{language === 'ja' ? '出金' : '출금'}</div>
              </div>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-lg shadow-blue-600/20"
            >
              {t.withdrawRequest}
            </button>
          </div>
        </div>

        {/* Mobile Alert Messages */}
        <div className="px-4">
          {error && error !== t.messages?.error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-800">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-800">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Tab Content */}
        <div className="px-4 mt-2">
          {/* Mobile Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Points Balance Card - Mobile */}
              <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-[24px] p-5 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-300 text-[10px] font-semibold uppercase tracking-wider">{language === 'ja' ? '保有ポイント' : '보유 포인트'}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-semibold">1P = ¥1</span>
                  </div>
                  <div className="text-3xl font-bold mb-4 tracking-tight">
                    ¥ {(profile?.points || 0).toLocaleString()}<span className="text-sm text-slate-400">.00</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowWithdrawModal(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-full transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" />
                      {t.withdrawRequest}
                    </button>
                    <button onClick={() => setActiveTab('points')} className="flex-1 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 rounded-full transition-all border border-white/10 flex items-center justify-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {language === 'ja' ? '収益履歴' : '수익 내역'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected Accounts - Mobile */}
              <div className="bg-white rounded-[24px] shadow-lg shadow-slate-100/50 border border-slate-100/80 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">{language === 'ja' ? '連携アカウント' : '연결된 계정'}</h3>
                <div className="space-y-2">
                  {getSnsConnections().map((sns) => (
                    sns.url ? (
                      <a key={sns.name} href={sns.url.startsWith('http') ? sns.url : `https://${sns.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all group">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 bg-gradient-to-br ${sns.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-[9px] font-bold">{sns.name[0]}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{sns.name}</span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-all">ACTIVE ↗</span>
                      </a>
                    ) : (
                      <div key={sns.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 bg-gradient-to-br ${sns.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-[9px] font-bold">{sns.name[0]}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-700">{sns.name}</span>
                        </div>
                        <button onClick={() => { setActiveTab('profile'); setIsEditing(true); }} className="px-2 py-0.5 text-[9px] font-semibold rounded-full bg-slate-200 text-slate-500">LINK</button>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Performance - Mobile */}
              <div className="bg-white rounded-[24px] shadow-lg shadow-slate-100/50 border border-slate-100/80 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  {language === 'ja' ? 'パフォーマンス' : '실적'}
                </h3>
                {(() => {
                  const perf = getPerformance()
                  return (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-slate-500">{language === 'ja' ? 'キャンペーン採択率' : '캠페인 채택률'}</span>
                          <span className="text-xs font-bold text-blue-600">{perf.successRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${Math.min(perf.successRate, 100)}%`}} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-slate-500">{language === 'ja' ? '完了率' : '완료율'}</span>
                          <span className="text-xs font-bold text-emerald-600">{perf.completionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: `${Math.min(perf.completionRate, 100)}%`}} />
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Active Campaigns - Mobile */}
              <div className="bg-white rounded-[24px] shadow-lg shadow-slate-100/50 border border-slate-100/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">{language === 'ja' ? '参加中のキャンペーン' : '참여중인 캠페인'}</h3>
                  <button onClick={() => setActiveTab('applications')} className="text-blue-600 text-[10px] font-semibold">{language === 'ja' ? 'すべて表示' : '전체 보기'}</button>
                </div>
                {applications.filter(a => ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'pending'].includes(a.status)).length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                    <p className="text-xs">{language === 'ja' ? 'キャンペーンなし' : '캠페인 없음'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications.filter(a => ['approved', 'selected', 'filming', 'video_submitted', 'sns_submitted', 'pending'].includes(a.status)).slice(0, 4).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-[9px] font-bold">K</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-800 truncate">{app.campaign_title || 'Campaign'}</div>
                            <div className="text-[9px] text-slate-400 uppercase">{app.status === 'pending' ? (language === 'ja' ? '審査中' : '심사중') : (language === 'ja' ? '進行中' : '진행중')}</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-800">¥{(app.campaign_reward || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support - Mobile */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[24px] border border-blue-200/50 p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-0.5 text-center">{language === 'ja' ? 'サポート' : '도움이 필요하세요?'}</h3>
                <p className="text-[10px] text-slate-500 mb-3 text-center">{language === 'ja' ? 'LINEまたはお問い合わせフォームでご連絡ください' : 'LINE 또는 문의 폼으로 연락하세요'}</p>
                <div className="flex gap-2">
                  <a href={LINE_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#06C755] text-white text-[10px] font-semibold rounded-full">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                    LINE
                  </a>
                  <button onClick={() => { setShowInquiryModal(true); setInquirySuccess(false); setInquiryForm({ category: '', subject: '', message: '' }); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-blue-600 text-[10px] font-semibold rounded-full border border-blue-200 shadow-sm">
                    <MessageSquare className="w-3 h-3" />
                    {language === 'ja' ? '問い合わせ' : '문의하기'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`bg-white rounded-[24px] shadow-lg shadow-slate-100/50 border border-slate-100/80 ${activeTab === 'dashboard' ? 'hidden' : ''}`}>
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">{t.personalInfo}</h2>
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleProfileSave()
                    } else {
                      setIsEditing(true)
                    }
                  }}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {processing ? t.processing : (isEditing ? t.save : t.edit)}
                </button>
              </div>

              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-emerald-800 text-sm">{success}</p>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* プロフィール写真 - Mobile */}
              <div className="mb-5 flex items-center gap-4">
                <div className="relative group">
                  {(profile?.profile_image || editForm.profile_image) ? (
                    <img src={profile?.profile_image || editForm.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">{(profile?.name || user?.email || '?')[0].toUpperCase()}</span>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">{language === 'ja' ? 'プロフィール写真' : '프로필 사진'}</h3>
                  <label className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full cursor-pointer hover:bg-blue-100 transition-all">
                    <Upload className="w-3 h-3" />
                    {language === 'ja' ? '写真を変更' : '사진 변경'}
                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.name}</label>
                  {isEditing ? (
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  ) : (
                    <p className="text-sm text-slate-800 py-2">{profile?.name || (language === 'ja' ? '名前未設定' : '이름 없음')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.email}</label>
                  <p className="text-sm text-slate-800 py-2">{profile?.email || user?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.phone}</label>
                  {isEditing ? (
                    <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="080-1234-5678" />
                  ) : (
                    <p className="text-sm text-slate-800 py-2">{profile?.phone || (language === 'ja' ? '未登録' : '등록되지 않음')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.skinType}</label>
                  {isEditing ? (
                    <select value={editForm.skin_type} onChange={(e) => setEditForm({...editForm, skin_type: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="">選択してください</option>
                      <option value="乾燥肌">乾燥肌</option>
                      <option value="脂性肌">脂性肌</option>
                      <option value="混合肌">混合肌</option>
                      <option value="敏感肌">敏感肌</option>
                      <option value="普通肌">普通肌</option>
                    </select>
                  ) : (
                    <p className="text-sm text-slate-800 py-2">{profile?.skin_type || '未設定'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.age}</label>
                    {isEditing ? (
                      <input type="number" value={editForm.age || ''} onChange={(e) => setEditForm({...editForm, age: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="25" min="1" max="100" />
                    ) : (
                      <p className="text-sm text-slate-800 py-2">{profile?.age || (language === 'ja' ? '未設定' : '미설정')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.region}</label>
                    {isEditing ? (
                      <input type="text" value={editForm.region || ''} onChange={(e) => setEditForm({...editForm, region: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder={language === 'ja' ? '東京都' : '서울특별시'} />
                    ) : (
                      <p className="text-sm text-slate-800 py-2">{profile?.region || (language === 'ja' ? '未設定' : '미설정')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.bio}</label>
                  {isEditing ? (
                    <textarea value={editForm.bio || ''} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows="2" placeholder={language === 'ja' ? '自己紹介を入力してください...' : '자기소개를 입력하세요...'} />
                  ) : (
                    <p className="text-sm text-slate-800 py-2">{profile?.bio || (language === 'ja' ? '未設定' : '미설정')}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.joinDate}</label>
                    <p className="text-sm text-slate-800 py-2">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP') : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t.userRole}</label>
                    <div className="py-2">{getRoleBadge(profile?.user_role)}</div>
                  </div>
                </div>
              </div>

              {/* SNS - Mobile */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{language === 'ko' ? 'SNS 주소' : 'SNSアドレス'}</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Instagram', key: 'instagram_url', placeholder: 'https://instagram.com/username' },
                    { label: 'TikTok', key: 'tiktok_url', placeholder: 'https://tiktok.com/@username' },
                    { label: 'YouTube', key: 'youtube_url', placeholder: 'https://youtube.com/@username' },
                    { label: language === 'ja' ? 'その他' : '기타', key: 'other_sns_url', placeholder: 'https://...' }
                  ].map(sns => (
                    <div key={sns.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{sns.label}</label>
                      {isEditing ? (
                        <input type="text" value={editForm[sns.key]} onChange={(e) => setEditForm({...editForm, [sns.key]: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder={sns.placeholder} />
                      ) : (
                        <p className="text-sm text-slate-800 py-1 truncate">
                          {profile?.[sns.key] ? <a href={profile[sns.key]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile[sns.key]}</a> : (language === 'ja' ? '未登録' : '등록되지 않음')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Followers - Mobile */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{language === 'ja' ? 'SNSフォロワー数' : 'SNS 팔로워 수'}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Instagram', key: 'instagram_followers', display: profile?.instagram_followers },
                    { label: 'TikTok', key: 'tiktok_followers', display: profile?.tiktok_followers },
                    { label: 'YouTube', key: 'youtube_subscribers', display: profile?.youtube_subscribers }
                  ].map(item => (
                    <div key={item.key}>
                      <label className="block text-[10px] font-medium text-slate-400 mb-1">{item.label}</label>
                      {isEditing ? (
                        <input type="number" value={editForm[item.key]} onChange={(e) => setEditForm({...editForm, [item.key]: e.target.value})} className="w-full px-2 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="0" min="0" />
                      ) : (
                        <p className="text-xs font-medium text-slate-700">{item.display ? item.display.toLocaleString() : (language === 'ja' ? '未設定' : '미설정')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing Consent - Mobile */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{language === 'ja' ? 'マーケティング受信同意' : '마케팅 수신 동의'}</h3>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editForm.sms_consent} onChange={(e) => setEditForm({...editForm, sms_consent: e.target.checked})} disabled={!isEditing} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50" />
                    <span className="text-sm text-slate-700">{language === 'ja' ? 'SMS受信同意' : 'SMS 수신 동의'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editForm.email_consent} onChange={(e) => setEditForm({...editForm, email_consent: e.target.checked})} disabled={!isEditing} className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50" />
                    <span className="text-sm text-slate-700">{language === 'ja' ? 'メール受信同意' : '이메일 수신 동의'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <MyPageCampaignsTab applications={applications} user={user} />
          )}

          {activeTab === 'applications_old' && (
            <div className="p-4 text-center text-slate-400 text-sm py-12">{t.noData}</div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-4">{t.withdrawalHistory}</h2>
              {withdrawals.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Wallet className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm">{t.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {w.withdrawal_method === 'paypal' ? 'PayPal' : w.withdrawal_method === 'bank' ? (language === 'ko' ? '은행 송금' : '銀行振込') : w.withdrawal_method || 'PayPal'}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${w.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : w.status === 'approved' ? 'bg-blue-100 text-blue-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {w.status === 'completed' ? (language === 'ko' ? '완료' : '完了') : w.status === 'approved' ? (language === 'ko' ? '승인됨' : '承認済み') : w.status === 'rejected' ? (language === 'ko' ? '거절됨' : '拒否済み') : (language === 'ko' ? '대기중' : '待機中')}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-slate-800">¥{w.amount?.toLocaleString() || '0'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(w.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div className="p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-4">{t.pointHistory}</h2>
              {pointTransactions.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <TrendingUp className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm">{t.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pointTransactions.map((tx) => (
                    <div key={tx.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${getTransactionTypeColor(tx.transaction_type)}`}>{getTransactionTypeText(tx.transaction_type)}</span>
                        <span className={`text-base font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}P
                        </span>
                      </div>
                      {tx.description && <p className="text-[10px] text-slate-500 line-clamp-1">{tx.description}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(tx.created_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-4">{t.accountSettings}</h2>
              <div className="border border-red-200 rounded-2xl p-4 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">{t.accountDeletion}</h3>
                    <p className="mt-1 text-xs text-red-600">{t.deleteAccountWarning}</p>
                    <button
                      onClick={() => setShowWithdrawalModal(true)}
                      className="mt-3 inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-full"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {t.deleteAccount}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <nav className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
            {tabItems.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all min-w-[56px] ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-slate-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                  <span className={`text-[9px] font-medium leading-tight ${activeTab === tab.id ? 'text-blue-600' : ''}`}>{tab.mobileLabel}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ========== Modals (shared between PC and Mobile) ========== */}

      {/* 출금 신청 모달 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] px-4">
          <div className="relative top-10 sm:top-20 mx-auto p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl rounded-[24px] bg-white mb-10 border border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800">{t.withdrawRequestTitle}</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                  </div>
                )}
                
                {/* 포인트 가치 안내 */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    💰 {language === 'ja' ? '1ポイント = 1円です' : '1포인트 = 1엔입니다'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {language === 'ja' ? 'PayPalで日本円として出金されます' : 'PayPal로 일본 엔화로 출금됩니다'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawAmount} *
                    </label>
                    <input
                      type="number"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                      placeholder={language === 'ja' ? '出金するポイント数' : '출금할 포인트 수'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      max={profile?.points || 0}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'ja' ? '保有ポイント' : '보유 포인트'}: {profile?.points?.toLocaleString() || 0}P
                      {withdrawForm.amount && (
                        <span className="ml-2 text-green-600 font-medium">
                          (≈ ¥{parseInt(withdrawForm.amount || 0).toLocaleString()})
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.paypalEmail} *
                    </label>
                    <input
                      type="email"
                      value={withdrawForm.paypalEmail}
                      onChange={(e) => setWithdrawForm({...withdrawForm, paypalEmail: e.target.value})}
                      placeholder={language === 'ja' ? 'PayPal アカウントメール' : 'PayPal 계정 이메일'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.paypalName} *
                    </label>
                    <input
                      type="text"
                      value={withdrawForm.paypalName}
                      onChange={(e) => setWithdrawForm({...withdrawForm, paypalName: e.target.value})}
                      placeholder={language === 'ja' ? 'PayPal アカウント名（実名）' : 'PayPal 계정명 (실명)'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.withdrawReason}
                    </label>
                    <textarea
                      value={withdrawForm.reason}
                      onChange={(e) => setWithdrawForm({...withdrawForm, reason: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={language === 'ja' ? '出金理由（任意）' : '출금 사유 (선택사항)'}
                    />
                  </div>
                </div>
                
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowWithdrawModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 text-sm font-medium transition-all">
                  {t.cancel}
                </button>
                <button onClick={handleWithdrawSubmit} disabled={processing} className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
                  {processing ? t.processing : t.submitWithdrawRequest}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 모달 */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 px-4">
          <div className="relative top-10 sm:top-20 mx-auto p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl rounded-[24px] bg-white mb-10 border border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800">{t.accountDeletion}</h3>
                <button onClick={() => setShowWithdrawalModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.withdrawalReason} *</label>
                  <select value={withdrawalReason} onChange={(e) => setWithdrawalReason(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                    <option value="">{language === 'ja' ? '理由を選択してください' : '사유를 선택하세요'}</option>
                    <option value="service">{t.reasons.service}</option>
                    <option value="privacy">{t.reasons.privacy}</option>
                    <option value="unused">{t.reasons.unused}</option>
                    <option value="other">{t.reasons.other}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.withdrawalDetails}</label>
                  <textarea value={withdrawalDetails} onChange={(e) => setWithdrawalDetails(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder={language === 'ja' ? '追加説明がある場合は入力してください' : '추가 설명이 있으시면 입력해주세요'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.confirmDeletion} *</label>
                  <p className="text-sm text-slate-500 mb-2">{t.confirmText}</p>
                  <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={t.confirmPlaceholder} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowWithdrawalModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 text-sm font-medium transition-all">
                  {t.cancel}
                </button>
                <button onClick={handleWithdrawalSubmit} disabled={processing} className="px-5 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition-all">
                  {processing ? t.processing : t.submitWithdrawal}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SNS 업로드 및 포인트 신청 모달 */}
      {showSnsUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 px-4">
          <div className="relative top-10 sm:top-20 mx-auto p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl rounded-[24px] bg-white mb-10 border border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800">{t.pointRequestTitle}</h3>
                <button onClick={() => setShowSnsUploadModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">{t.snsUploadDescription}</p>
                {selectedApplication && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">{language === 'ja' ? 'キャンペーン' : '캠페인'}: {selectedApplication.campaign_title}</p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-800">{success}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.snsUploadUrl} *</label>
                  <input type="text" value={snsUploadForm.sns_upload_url} onChange={(e) => setSnsUploadForm({...snsUploadForm, sns_upload_url: e.target.value})} placeholder={language === 'ja' ? 'https://instagram.com/p/...' : 'https://instagram.com/p/...'} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <p className="mt-1 text-xs text-slate-400">{language === 'ja' ? 'Instagram、TikTok、YouTubeなどのSNS投稿URLを入力してください' : 'Instagram, TikTok, YouTube 등의 SNS 게시물 URL을 입력해주세요'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.additionalNotes}</label>
                  <textarea value={snsUploadForm.notes} onChange={(e) => setSnsUploadForm({...snsUploadForm, notes: e.target.value})} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder={language === 'ja' ? '追加情報があれば入力してください' : '추가 정보가 있으면 입력해주세요'} />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowSnsUploadModal(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 text-sm font-medium transition-all">
                  {t.cancel}
                </button>
                <button onClick={handleSnsUploadSubmit} disabled={processing || !snsUploadForm.sns_upload_url || typeof snsUploadForm.sns_upload_url !== 'string' || !snsUploadForm.sns_upload_url.trim()} className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
                  {processing ? t.processing : t.submitPointRequest}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 문의하기 모달 */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[9999] px-4">
          <div className="relative top-10 sm:top-20 mx-auto p-5 sm:p-6 w-full max-w-sm sm:max-w-md shadow-2xl rounded-[24px] bg-white mb-10 border border-slate-100">
            {inquirySuccess ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{language === 'ja' ? '送信完了' : '전송 완료'}</h3>
                <p className="text-sm text-slate-500">{language === 'ja' ? 'お問い合わせを受け付けました。担当者が確認後ご連絡いたします。' : '문의가 접수되었습니다. 담당자 확인 후 연락드리겠습니다.'}</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-800">{language === 'ja' ? 'お問い合わせ' : '문의하기'}</h3>
                  <button onClick={() => setShowInquiryModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{language === 'ja' ? 'カテゴリ' : '카테고리'} *</label>
                    <select value={inquiryForm.category} onChange={(e) => setInquiryForm({...inquiryForm, category: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                      <option value="">{language === 'ja' ? '選択してください' : '선택하세요'}</option>
                      <option value="campaign">{language === 'ja' ? 'キャンペーンについて' : '캠페인 관련'}</option>
                      <option value="payment">{language === 'ja' ? '出金・ポイントについて' : '출금/포인트 관련'}</option>
                      <option value="account">{language === 'ja' ? 'アカウントについて' : '계정 관련'}</option>
                      <option value="technical">{language === 'ja' ? '技術的な問題' : '기술적 문제'}</option>
                      <option value="other">{language === 'ja' ? 'その他' : '기타'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{language === 'ja' ? '件名' : '제목'} *</label>
                    <input type="text" value={inquiryForm.subject} onChange={(e) => setInquiryForm({...inquiryForm, subject: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder={language === 'ja' ? 'お問い合わせ件名を入力' : '문의 제목을 입력하세요'} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{language === 'ja' ? 'お問い合わせ内容' : '문의 내용'} *</label>
                    <textarea value={inquiryForm.message} onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} rows={5} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder={language === 'ja' ? '詳細を入力してください...' : '상세 내용을 입력하세요...'} />
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setShowInquiryModal(false)} className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 text-sm font-medium transition-all">
                    {t.cancel}
                  </button>
                  <button onClick={handleInquirySubmit} disabled={inquirySubmitting || !inquiryForm.category || !inquiryForm.subject || !inquiryForm.message} className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    {inquirySubmitting ? (language === 'ja' ? '送信中...' : '전송중...') : (language === 'ja' ? '送信する' : '전송')}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 mb-2">{language === 'ja' ? 'または、LINEで直接お問い合わせ' : '또는 LINE으로 직접 문의'}</p>
                  <a href={LINE_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06C755] text-white text-xs font-semibold rounded-full hover:bg-[#05b34d] transition-all">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                    LINE {language === 'ja' ? 'で問い合わせ' : '문의'}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 촬영 가이드 모달 */}
      <ShootingGuideModal
        isOpen={showGuideModal}
        onClose={() => {
          setShowGuideModal(false)
          setSelectedGuideApplication(null)
        }}
        guide={selectedGuideApplication?.personalized_guide}
        campaignTitle={selectedGuideApplication?.campaign_title}
      />

      {/* 영상 업로드 모달 */}
      <VideoUploadModal
        isOpen={showVideoUploadModal}
        onClose={() => {
          setShowVideoUploadModal(false)
          setSelectedGuideApplication(null)
        }}
        application={selectedGuideApplication}
        onSuccess={loadUserData}
      />
    </div>
  )
}

export default MyPageWithWithdrawal
