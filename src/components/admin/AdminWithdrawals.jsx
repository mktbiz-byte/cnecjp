import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { database, supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, CreditCard, Building, User, MapPin, Phone, Mail, 
  AlertCircle, CheckCircle, Clock, DollarSign, FileText, 
  ArrowRight, Copy, ExternalLink, Download, Eye, Edit,
  Search, Filter, RefreshCw
} from 'lucide-react'

const AdminWithdrawals = () => {
  const { language } = useLanguage()
  
  const [withdrawals, setWithdrawals] = useState([])
  const [bankTransfers, setBankTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [detailModal, setDetailModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [approveModal, setApproveModal] = useState(false)
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  })
  
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 출금 요청 로드
      const withdrawalsData = await database.withdrawals.getAll()
      setWithdrawals(withdrawalsData || [])
      
      // 송금 내역 로드
      const { data: transfersData, error: transfersError } = await supabase
        .from('bank_transfers')
        .select(`
          *,
          withdrawals (
            amount,
            user_id,
            user_profiles (
              name,
              phone
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (transfersError) throw transfersError
      setBankTransfers(transfersData || [])
      
    } catch (error) {
      console.error('Load data error:', error)
      setError(language === 'ko' 
        ? '데이터를 불러올 수 없습니다.'
        : 'データを読み込めません。'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal) return
    
    try {
      setProcessing(true)
      setError('')
      
      await database.withdrawals.approve(selectedWithdrawal.id, adminNotes)
      
      setSuccess(language === 'ko' 
        ? '출금이 승인되었습니다.'
        : '出金が承認されました。'
      )
      setApproveModal(false)
      setAdminNotes('')
      
      // 데이터 새로고침
      await loadData()
      
    } catch (error) {
      console.error('Approve withdrawal error:', error)
      setError(language === 'ko' 
        ? '출금 승인에 실패했습니다.'
        : '出金承認に失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal) return
    
    try {
      setProcessing(true)
      setError('')
      
      await database.withdrawals.updateStatus(
        selectedWithdrawal.id, 
        'rejected', 
        adminNotes
      )
      
      setSuccess(language === 'ko' 
        ? '출금이 거절되었습니다.'
        : '出金が拒否されました。'
      )
      setApproveModal(false)
      setAdminNotes('')
      
      // 데이터 새로고침
      await loadData()
      
    } catch (error) {
      console.error('Reject withdrawal error:', error)
      setError(language === 'ko' 
        ? '출금 거절에 실패했습니다.'
        : '出金拒否に失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateTransferStatus = async (transferId, status, notes = '') => {
    try {
      setProcessing(true)
      setError('')
      
      const { data, error } = await supabase
        .from('bank_transfers')
        .update({
          status,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', transferId)
        .select()
        .single()
      
      if (error) throw error
      
      setSuccess(language === 'ko' 
        ? '송금 상태가 업데이트되었습니다.'
        : '送金状態が更新されました。'
      )
      
      // 데이터 새로고침
      await loadData()
      
    } catch (error) {
      console.error('Update transfer status error:', error)
      setError(language === 'ko' 
        ? '송금 상태 업데이트에 실패했습니다.'
        : '送金状態の更新に失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const exportToExcel = async (type) => {
    try {
      setProcessing(true)
      
      let data = []
      let filename = ''
      
      if (type === 'withdrawals') {
        data = withdrawals.map(w => ({
          'ID': w.id,
          'ユーザー名': w.user_profiles?.name || '',
          '金額': w.amount,
          '状態': w.status,
          '要求日': new Date(w.created_at).toLocaleDateString('ja-JP'),
          '銀行名': w.bank_info?.bank_name || '',
          '口座番号': w.bank_info?.account_number || '',
          '口座名義': w.bank_info?.account_holder_name || ''
        }))
        filename = `withdrawals_${new Date().toISOString().split('T')[0]}.csv`
      } else {
        data = bankTransfers.map(t => ({
          'ID': t.id,
          '出金ID': t.withdrawal_id,
          'ユーザー名': t.withdrawals?.user_profiles?.name || '',
          '金額': t.withdrawals?.amount || '',
          '状態': t.status,
          '作成日': new Date(t.created_at).toLocaleDateString('ja-JP'),
          '銀行名': t.transfer_data?.bankName || '',
          'SWIFT': t.transfer_data?.swiftCode || '',
          '受取人': t.transfer_data?.accountHolderName || ''
        }))
        filename = `bank_transfers_${new Date().toISOString().split('T')[0]}.csv`
      }
      
      // CSV 생성
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n')
      
      // 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      
      setSuccess(language === 'ko' 
        ? 'Excel 파일이 다운로드되었습니다.'
        : 'Excelファイルがダウンロードされました。'
      )
      
    } catch (error) {
      console.error('Export error:', error)
      setError(language === 'ko' 
        ? 'Excel 내보내기에 실패했습니다.'
        : 'Excelエクスポートに失敗しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: language === 'ko' ? '대기중' : '待機中' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: language === 'ko' ? '승인됨' : '承認済み' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: language === 'ko' ? '거절됨' : '拒否' },
      transfer_processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: language === 'ko' ? '송금처리중' : '送金処理中' },
      completed: { bg: 'bg-purple-100', text: 'text-purple-800', label: language === 'ko' ? '완료됨' : '完了' }
    }
    
    const style = statusStyles[status] || statusStyles.pending
    
    return (
      <Badge className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP')
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filters.status !== 'all' && withdrawal.status !== filters.status) return false
    if (filters.search && !withdrawal.user_profiles?.name?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.dateFrom && new Date(withdrawal.created_at) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(withdrawal.created_at) > new Date(filters.dateTo)) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'ko' ? '출금 관리' : '出金管理'}
          </h1>
          <p className="text-gray-600">
            {language === 'ko' 
              ? '사용자 출금 요청과 일본 은행 송금을 관리합니다.'
              : 'ユーザーの出金要求と日本銀行送金を管理します。'
            }
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => exportToExcel('withdrawals')}
            disabled={processing}
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'ko' ? '출금 내역 Excel' : '出金履歴Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToExcel('transfers')}
            disabled={processing}
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'ko' ? '송금 내역 Excel' : '送金履歴Excel'}
          </Button>
          <Button
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'ko' ? '새로고침' : '更新'}
          </Button>
        </div>
      </div>

      {/* 알림 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="withdrawals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="withdrawals" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>{language === 'ko' ? '출금 요청' : '出金要求'}</span>
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>{language === 'ko' ? '은행 송금' : '銀行送金'}</span>
          </TabsTrigger>
        </TabsList>

        {/* 출금 요청 탭 */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>{language === 'ko' ? '출금 요청 관리' : '出金要求管理'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' 
                  ? '사용자의 출금 요청을 검토하고 승인/거절할 수 있습니다.'
                  : 'ユーザーの出金要求を検討し、承認/拒否できます。'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* 필터 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ko' ? '상태' : '状態'}</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === 'ko' ? '전체' : '全て'}</SelectItem>
                        <SelectItem value="pending">{language === 'ko' ? '대기중' : '待機中'}</SelectItem>
                        <SelectItem value="approved">{language === 'ko' ? '승인됨' : '承認済み'}</SelectItem>
                        <SelectItem value="rejected">{language === 'ko' ? '거절됨' : '拒否'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{language === 'ko' ? '검색' : '検索'}</Label>
                    <Input
                      placeholder={language === 'ko' ? '사용자명 검색' : 'ユーザー名検索'}
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{language === 'ko' ? '시작일' : '開始日'}</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{language === 'ko' ? '종료일' : '終了日'}</Label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* 출금 요청 목록 */}
              <div className="space-y-4">
                {filteredWithdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {language === 'ko' ? '출금 요청이 없습니다' : '出金要求はありません'}
                    </h3>
                  </div>
                ) : (
                  filteredWithdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-800">
                                {formatCurrency(withdrawal.amount)}
                              </h4>
                              {getStatusBadge(withdrawal.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                {language === 'ko' ? '사용자:' : 'ユーザー:'} {withdrawal.user_profiles?.name || 'N/A'}
                              </p>
                              <p>
                                {language === 'ko' ? '요청일:' : '要求日:'} {formatDate(withdrawal.created_at)}
                              </p>
                              <p>
                                {language === 'ko' ? '은행:' : '銀行:'} {withdrawal.bank_info?.bank_name || 'N/A'}
                              </p>
                              <p>
                                {language === 'ko' ? '계좌:' : '口座:'} {withdrawal.bank_info?.account_number || 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal)
                                setDetailModal(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {language === 'ko' ? '상세' : '詳細'}
                            </Button>
                            
                            {withdrawal.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setApproveModal(true)
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {language === 'ko' ? '처리' : '処理'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 은행 송금 탭 */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>{language === 'ko' ? '일본 은행 송금 관리' : '日本銀行送金管理'}</span>
              </CardTitle>
              <CardDescription>
                {language === 'ko' 
                  ? '일본 은행으로의 송금 상태를 관리합니다.'
                  : '日本銀行への送金状態を管理します。'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {bankTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {language === 'ko' ? '송금 내역이 없습니다' : '送金履歴はありません'}
                    </h3>
                  </div>
                ) : (
                  bankTransfers.map((transfer) => (
                    <Card key={transfer.id} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-800">
                                {formatCurrency(transfer.withdrawals?.amount)}
                              </h4>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                {language === 'ko' ? '사용자:' : 'ユーザー:'} {transfer.withdrawals?.user_profiles?.name || 'N/A'}
                              </p>
                              <p>
                                {language === 'ko' ? '송금일:' : '送金日:'} {formatDate(transfer.created_at)}
                              </p>
                              <p>
                                {language === 'ko' ? '수취은행:' : '受取銀行:'} {transfer.transfer_data?.bankName || 'N/A'}
                              </p>
                              <p>
                                {language === 'ko' ? '수취인:' : '受取人:'} {transfer.transfer_data?.accountHolderName || 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer)
                                setTransferModal(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {language === 'ko' ? '상세' : '詳細'}
                            </Button>
                            
                            {transfer.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTransferStatus(transfer.id, 'completed')}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {processing ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                {language === 'ko' ? '완료' : '完了'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 출금 상세 모달 */}
      <Dialog open={detailModal} onOpenChange={setDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '출금 요청 상세' : '出金要求詳細'}
            </DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">{language === 'ko' ? '출금 정보' : '出金情報'}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">{language === 'ko' ? '금액:' : '金額:'}</span> {formatCurrency(selectedWithdrawal.amount)}</p>
                    <p><span className="text-gray-600">{language === 'ko' ? '상태:' : '状態:'}</span> {getStatusBadge(selectedWithdrawal.status)}</p>
                    <p><span className="text-gray-600">{language === 'ko' ? '요청일:' : '要求日:'}</span> {formatDate(selectedWithdrawal.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">{language === 'ko' ? '사용자 정보' : 'ユーザー情報'}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">{language === 'ko' ? '이름:' : '名前:'}</span> {selectedWithdrawal.user_profiles?.name}</p>
                    <p><span className="text-gray-600">{language === 'ko' ? '전화:' : '電話:'}</span> {selectedWithdrawal.user_profiles?.phone}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold">{language === 'ko' ? '은행 정보' : '銀行情報'}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <p><span className="text-gray-600">{language === 'ko' ? '은행명:' : '銀行名:'}</span> {selectedWithdrawal.bank_info?.bank_name}</p>
                  <p><span className="text-gray-600">{language === 'ko' ? '지점명:' : '支店名:'}</span> {selectedWithdrawal.bank_info?.branch_name}</p>
                  <p><span className="text-gray-600">{language === 'ko' ? '계좌번호:' : '口座番号:'}</span> {selectedWithdrawal.bank_info?.account_number}</p>
                  <p><span className="text-gray-600">{language === 'ko' ? '예금주:' : '口座名義:'}</span> {selectedWithdrawal.bank_info?.account_holder_name}</p>
                </div>
              </div>
              
              {selectedWithdrawal.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold">{language === 'ko' ? '비고' : '備考'}</h3>
                    <p className="text-sm text-gray-600">{selectedWithdrawal.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 출금 승인/거절 모달 */}
      <Dialog open={approveModal} onOpenChange={setApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '출금 요청 처리' : '出金要求処理'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko' 
                ? '출금 요청을 승인하거나 거절할 수 있습니다.'
                : '出金要求を承認または拒否できます。'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWithdrawal && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{formatCurrency(selectedWithdrawal.amount)}</p>
                <p className="text-sm text-gray-600">{selectedWithdrawal.user_profiles?.name}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">
                {language === 'ko' ? '관리자 메모' : '管理者メモ'}
              </Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={language === 'ko' ? '처리 사유를 입력하세요' : '処理理由を入力してください'}
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleApproveWithdrawal}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {language === 'ko' ? '승인' : '承認'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectWithdrawal}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {language === 'ko' ? '거절' : '拒否'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 송금 상세 모달 */}
      <Dialog open={transferModal} onOpenChange={setTransferModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '송금 상세 정보' : '送金詳細情報'}
            </DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">{language === 'ko' ? '송금 정보' : '送金情報'}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">{language === 'ko' ? '금액:' : '金額:'}</span> {formatCurrency(selectedTransfer.withdrawals?.amount)}</p>
                    <p><span className="text-gray-600">{language === 'ko' ? '상태:' : '状態:'}</span> {getStatusBadge(selectedTransfer.status)}</p>
                    <p><span className="text-gray-600">{language === 'ko' ? '송금일:' : '送金日:'}</span> {formatDate(selectedTransfer.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">{language === 'ko' ? '수취 은행' : '受取銀行'}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">{language === 'ko' ? '은행명:' : '銀行名:'}</span> {selectedTransfer.transfer_data?.bankName}</p>
                    <p><span className="text-gray-600">SWIFT:</span> {selectedTransfer.transfer_data?.swiftCode}</p>
                    <p><span className="text-gray-600">{language === 'ko' ? '지점명:' : '支店名:'}</span> {selectedTransfer.transfer_data?.branchName}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold">{language === 'ko' ? '수취인 정보' : '受取人情報'}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <p><span className="text-gray-600">{language === 'ko' ? '계좌번호:' : '口座番号:'}</span> {selectedTransfer.transfer_data?.accountNumber}</p>
                  <p><span className="text-gray-600">{language === 'ko' ? '예금주:' : '口座名義:'}</span> {selectedTransfer.transfer_data?.accountHolderName}</p>
                  <p><span className="text-gray-600">{language === 'ko' ? '수취인:' : '受取人:'}</span> {selectedTransfer.transfer_data?.recipientName}</p>
                  <p><span className="text-gray-600">{language === 'ko' ? '전화:' : '電話:'}</span> {selectedTransfer.transfer_data?.recipientPhone}</p>
                </div>
                <div className="text-sm">
                  <p><span className="text-gray-600">{language === 'ko' ? '주소:' : '住所:'}</span> {selectedTransfer.transfer_data?.recipientAddress}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold">{language === 'ko' ? '송금 목적' : '送金目的'}</h3>
                <div className="text-sm">
                  <p><span className="text-gray-600">{language === 'ko' ? '목적:' : '目的:'}</span> {selectedTransfer.transfer_data?.purpose}</p>
                  {selectedTransfer.transfer_data?.purposeDescription && (
                    <p><span className="text-gray-600">{language === 'ko' ? '상세:' : '詳細:'}</span> {selectedTransfer.transfer_data?.purposeDescription}</p>
                  )}
                </div>
              </div>
              
              {selectedTransfer.status === 'pending' && (
                <>
                  <Separator />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleUpdateTransferStatus(selectedTransfer.id, 'completed')}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {language === 'ko' ? '송금 완료' : '送金完了'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateTransferStatus(selectedTransfer.id, 'failed', '송금 실패')}
                      disabled={processing}
                      className="flex-1"
                    >
                      {language === 'ko' ? '송금 실패' : '送金失敗'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminWithdrawals
