# Google Drive Modal Z-Index Fix

## 問題の概要
Google Driveモーダル（DriveModal.jsx）が他の管理者ページのモーダルと重なって表示される問題があった。

## 修正内容

### 1. DriveModal.jsx の z-index 調整
- メインコンテナ: `z-[99999]` (最高レベル)
- 背景オーバーレイ: `z-[99998]`
- モーダルコンテンツ: `relative z-[99999]`

### 2. ApplicationsReportSimple_final.jsx の z-index 調整
- 詳細モーダル: `z-[9998]` (DriveModalより低く設定)

### 3. 修正されたファイル
- `/src/components/admin/DriveModal.jsx`
- `/src/components/admin/ApplicationsReportSimple_final.jsx`

## z-index 階層構造
```
99999: DriveModal (最前面)
9998:  ApplicationsReportSimple詳細モーダル
50:    AdminWithdrawalsモーダル
10:    その他の一般的なモーダル
```

## 期待される効果
1. Google Driveモーダルが常に最前面に表示される
2. 他のモーダルとの重なり問題が解決される
3. モーダル間の適切な階層構造が確立される

## テスト項目
- [ ] 管理者ページでDriveModalが正しく表示される
- [ ] 他のモーダルとの重なり問題が解決されている
- [ ] モーダルの背景クリックで正しく閉じる
- [ ] ESCキーでモーダルが閉じる
