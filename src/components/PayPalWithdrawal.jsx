import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { database } from '../lib/supabase'
import { 
  CreditCard, DollarSign, Clock, CheckCircle, XCircle, 
  AlertTriangle, Loader2, ArrowRight, RefreshCw
} from 'lucide-react'

const PayPalWithdrawal = () => {
  const { user } = useAuth()
  const { language } = useLanguage()
  
  const [userPoints, setUserPoints] = useState(0)
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 출금 신청 폼 상태
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    paypal_email: '',
    paypal_name: '',
    confirm_email: ''
  })

  // 다국어 텍스트
  const texts = {
    ko: {
      title: 'PayPal 출금',
      currentPoints: '현재 포인트',
      minimumWithdrawal: '최소 출금 금액: 1,000P',
      withdrawalHistory: '출금 내역',
      requestWithdrawal: '출금 신청',
      amount: '출금 금액',
      paypalEmail: 'PayPal 이메일',
      paypalName: 'PayPal 계정 이름',
      confirmEmail: 'PayPal 이메일 확인',
      submit: '출금 신청',
      cancel: '취소',
      status: {
        pending: '대기 중',
        processing: '처리 중',
        completed: '완료',
        rejected: '거절됨'
      },
      errors: {
        insufficientPoints: '포인트가 부족합니다',
        minimumAmount: '최소 출금 금액은 1,000P입니다',
        emailMismatch: 'PayPal 이메일이 일치하지 않습니다',
        invalidEmail: '유효한 이메일 주소를 입력하세요',
        required: '필수 입력 항목입니다'
      },
      success: {
        withdrawalRequested: '출금 신청이 완료되었습니다. 처리까지 1-3일 소요됩니다.'
      }
    },
    ja: {
      title: 'PayPal出金',
      currentPoints: '現在のポイント',
      minimumWithdrawal: '最小出金額：1,000P',
      withdrawalHistory: '出金履歴',
      requestWithdrawal: '出金申請',
      amount: '出金額',
      paypalEmail: 'PayPalメール',
      paypalName: 'PayPalアカウント名',
      confirmEmail: 'PayPalメール確認',
      submit: '出金申請',
      cancel: 'キャンセル',
      status: {
        pending: '待機中',
        processing: '処理中',
        completed: '完了',
        rejected: '拒否'
      },
      errors: {
        insufficientPoints: 'ポイントが不足しています',
        minimumAmount: '最小出金額は1,000Pです',
        emailMismatch: 'PayPalメールが一致しません',
        invalidEmail: '有効なメールアドレスを入力してください',
        required: '必須入力項目です'
      },
      success: {
        withdrawalRequested: '出金申請が完了しました。処理まで1-3日かかります。'
      }
    }
  }

  const t = texts[language] || texts.ko

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 사용자 포인트 조회
      const points = await database.userPoints.getUserTotalPoints(user.id)
      setUserPoints(points)
      
      // 출금 내역 조회
      const withdrawalHistory = await database.withdrawals.getByUser(user.id)
      setWithdrawals(withdrawalHistory)
      
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const { amount, paypal_email, paypal_name, confirm_email } = withdrawalForm
    
    if (!amount || !paypal_email || !paypal_name || !confirm_email) {
      setError(t.errors.required)
      return false
    }
    
    const amountNum = parseInt(amount)
    if (amountNum < 1000) {
      setError(t.errors.minimumAmount)
      return false
    }
    
    if (amountNum > userPoints) {
      setError(t.errors.insufficientPoints)
      return false
    }
    
    if (paypal_email !== confirm_email) {
      setError(t.errors.emailMismatch)
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(paypal_email)) {
      setError(t.errors.invalidEmail)
      return false
    }
    
    return true
  }

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setProcessing(true)
      setError('')
      
      // 출금 신청 생성
      await database.withdrawals.create({
        user_id: user.id,
        amount: parseInt(withdrawalForm.amount),
        paypal_email: withdrawalForm.paypal_email,
        paypal_name: withdrawalForm.paypal_name
      })
      
      // 포인트 차감
      await database.userPoints.deductPoints(
        user.id, 
        parseInt(withdrawalForm.amount),
        `PayPal 출금 신청 - ${withdrawalForm.paypal_email}`
      )
      
      setSuccess(t.success.withdrawalRequested)
      setShowWithdrawalForm(false)
      setWithdrawalForm({
        amount: '',
        paypal_email: '',
        paypal_name: '',
        confirm_email: ''
      })
      
      // 데이터 다시 로드
      setTimeout(() => {
        loadData()
      }, 1000)
      
    } catch (error) {
      console.error('출금 신청 오류:', error)
      setError(`출금 신청에 실패했습니다: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </button>
          </div>
        </div>

        {/* 에러 및 성공 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-400">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* 현재 포인트 및 출금 신청 버튼 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.currentPoints}</h3>
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mr-2" />
                  <span className="text-3xl font-bold text-blue-600">
                    {userPoints.toLocaleString()}P
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{t.minimumWithdrawal}</p>
              </div>
              <button
                onClick={() => setShowWithdrawalForm(true)}
                disabled={userPoints < 1000}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {t.requestWithdrawal}
              </button>
            </div>
          </div>

          {/* 출금 신청 폼 */}
          {showWithdrawalForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.requestWithdrawal}</h3>
              <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.amount}
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max={userPoints}
                    value={withdrawalForm.amount}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.paypalEmail}
                  </label>
                  <input
                    type="email"
                    value={withdrawalForm.paypal_email}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, paypal_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="paypal@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.paypalName}
                  </label>
                  <input
                    type="text"
                    value={withdrawalForm.paypal_name}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, paypal_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="홍길동"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.confirmEmail}
                  </label>
                  <input
                    type="email"
                    value={withdrawalForm.confirm_email}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, confirm_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="paypal@example.com"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawalForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {t.submit}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 출금 내역 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.withdrawalHistory}</h3>
            {withdrawals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>출금 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(withdrawal.status)}
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {withdrawal.amount.toLocaleString()}P
                          </p>
                          <p className="text-sm text-gray-600">
                            {withdrawal.bank_info?.paypal_email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(withdrawal.requested_at)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                        {t.status[withdrawal.status]}
                      </span>
                    </div>
                    {withdrawal.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{withdrawal.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PayPalWithdrawal
