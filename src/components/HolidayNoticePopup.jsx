import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, PhoneOff, CheckCircle, Mail, X } from 'lucide-react'

const HolidayNoticePopup = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 2月13日〜2月18日の間のみ表示（日本時間基準）
    const now = new Date()
    const jstOffset = 9 * 60 // UTC+9
    const localOffset = now.getTimezoneOffset()
    const jstTime = new Date(now.getTime() + (localOffset + jstOffset) * 60000)

    const startDate = new Date(2026, 1, 13, 0, 0, 0) // 2月13日
    const endDate = new Date(2026, 1, 18, 23, 59, 59)   // 2月18日

    if (jstTime < startDate || jstTime > endDate) return

    // セッション中に閉じた場合は再表示しない
    const dismissed = sessionStorage.getItem('holiday_notice_dismissed')
    if (dismissed === 'true') return

    setOpen(true)
  }, [])

  const handleClose = () => {
    setOpen(false)
    sessionStorage.setItem('holiday_notice_dismissed', 'true')
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose() }}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)] rounded-[24px] p-0 overflow-hidden border-slate-200">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 sm:px-7 py-5 sm:py-6">
          <DialogHeader>
            <DialogTitle className="text-white text-lg sm:text-xl font-bold text-center leading-snug">
              休業のお知らせ
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-xs sm:text-sm text-center mt-1.5">
              2月13日（金）〜 2月18日（水）
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* コンテンツ */}
        <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-3.5 sm:space-y-4">
          {/* 短縮営業 */}
          <div className="flex items-start gap-3 sm:gap-3.5 bg-amber-50 border border-amber-100 rounded-2xl p-3.5 sm:p-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-800">2月13日（金）短縮営業</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                カスタマーサポート <span className="font-semibold text-amber-700">16:00（日本時間）</span> 業務終了
              </p>
            </div>
          </div>

          {/* 休業期間 */}
          <div className="flex items-start gap-3 sm:gap-3.5 bg-red-50 border border-red-100 rounded-2xl p-3.5 sm:p-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-800">2月14日（土）〜 18日（水）休業</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                カスタマーサポート休業 — お問い合わせ対応・メール返信停止
              </p>
            </div>
          </div>

          {/* システム正常稼働 */}
          <div className="flex items-start gap-3 sm:gap-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 sm:p-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-800">システム正常稼働</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                動画アップロード・チャンネル・キャンペーン機能はスケジュール通り進行
              </p>
            </div>
          </div>

          {/* 連休後対応 */}
          <div className="flex items-start gap-3 sm:gap-3.5 bg-blue-50 border border-blue-100 rounded-2xl p-3.5 sm:p-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm sm:text-[15px] font-bold text-slate-800">連休後のご対応</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                <span className="font-semibold text-blue-700">2月19日（木）</span>より順次対応いたします
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-5 sm:px-7 pb-5 sm:pb-7">
          <Button
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-3.5 rounded-full shadow-lg shadow-blue-600/20 transition-all text-sm sm:text-base"
          >
            確認しました
          </Button>
          <p className="text-[11px] text-slate-400 text-center mt-3">
            ご不便をおかけし、大変申し訳ございません。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HolidayNoticePopup
