# CNEC Japan 統合管理者サイト - プロフィール連携プロンプト

> このプロンプトは、CNEC Japan (cnec-jp) の統合管理者サイトで
> クリエイターのプロフィール・出金・住所・応募情報を正しく取得・表示するための
> 実装仕様書です。

---

## 1. アーキテクチャ概要

```
[クリエイターサイト (cnec-jp)]
        │
        ▼
  [Supabase Database]  ← user_profiles テーブル
        │
        ▼
[統合管理者サイト (admin)]
```

- **クリエイターサイト**: React + Vite + Supabase (cnec-jp)
- **統合管理者サイト**: 別プロジェクト（同一 Supabase プロジェクトを参照）
- **データベース**: Supabase PostgreSQL（共有）

---

## 2. user_profiles テーブル 完全フィールドマップ

### A. 基本情報（管理者に常に表示）

| フィールド | 型 | 説明 | 管理者表示 |
|-----------|------|------|-----------|
| `user_id` | UUID | auth.users の ID | ✅ 内部キー |
| `nickname` | TEXT | ニックネーム | ✅ **応募一覧・企業レポートに表示** |
| `name` | TEXT | 実名 | ✅ **選定後のみ企業に公開** |
| `email` | TEXT | メールアドレス | ✅ 管理者のみ |
| `phone` | TEXT | 電話番号 | ✅ **選定後のみ企業に公開** |
| `age` | INTEGER | 年齢 | ✅ |
| `gender` | TEXT | 性別 | ✅ |
| `bio` | TEXT | 自己紹介 | ✅ |
| `profile_image` | TEXT | プロフィール画像URL | ✅ |

### B. SNS情報

| フィールド | 型 | 説明 |
|-----------|------|------|
| `instagram_url` | TEXT | Instagram URL |
| `youtube_url` | TEXT | YouTube URL |
| `tiktok_url` | TEXT | TikTok URL |
| `blog_url` | TEXT | その他SNS/ブログ |
| `instagram_followers` | INTEGER | Instagramフォロワー数 |
| `tiktok_followers` | INTEGER | TikTokフォロワー数 |
| `youtube_subscribers` | INTEGER | YouTube登録者数 |

### C. 住所情報（配送用 → 選定後のみ企業に提供）

| フィールド | 型 | 説明 | 管理者表示 |
|-----------|------|------|-----------|
| `postcode` | TEXT | 郵便番号（7桁） | ✅ 選定後 |
| `prefecture` | TEXT | 都道府県 (value キー) | ✅ 選定後 |
| `address` | TEXT | 市区町村・番地 | ✅ 選定後 |
| `detail_address` | TEXT | 建物名・部屋番号 | ✅ 選定後 |

### D. 銀行口座情報（出金用）

| フィールド | 型 | 説明 | 管理者表示 |
|-----------|------|------|-----------|
| `bank_name` | TEXT | 銀行名 (value キー) | ✅ 出金時 |
| `branch_code` | TEXT | 支店番号（3桁） | ✅ 出金時 |
| `account_type` | TEXT | 口座種別 (futsu/touza) | ✅ 出金時 |
| `account_number` | TEXT | 口座番号 | ✅ 出金時 |
| `account_holder` | TEXT | 口座名義（カタカナ） | ✅ 出金時 |

### E. ビューティープロフィール（単一選択 TEXT）

```
skin_type, skin_shade, personal_color, hair_type,
primary_interest, editing_level, shooting_level,
follower_range, upload_frequency, job_visibility, job,
child_appearance, family_appearance, offline_visit,
linktree_available, nail_usage, circle_lens_usage,
glasses_usage, mirroring_available, review_platform,
video_length_style, shortform_tempo
```

### F. ビューティープロフィール（複数選択 JSONB 配列）

```
skin_concerns, hair_concerns, diet_concerns,
content_formats, collaboration_preferences, video_styles,
children, family_members, offline_locations,
languages, linktree_channels, mirroring_channels
```

---

## 3. 応募一覧でのニックネーム表示

### 重要ルール

1. **応募一覧（企業向けレポート）**: `nickname` を表示する
2. **選定前**: `nickname` + `age` + `skin_type` + SNS URL のみ表示
3. **選定後**: `name` + `phone` + `address` を追加表示
4. **管理者ダッシュボード**: 全フィールド表示可能

### 実装コード（応募一覧取得）

```javascript
// 応募一覧でクリエイター情報を取得する
const getApplicationsWithCreators = async (campaignId) => {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // クリエイターのプロフィール情報を取得
  const userIds = [...new Set(applications.map(a => a.user_id).filter(Boolean))]

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', userIds)

  // データ結合
  return applications.map(app => {
    const profile = profiles?.find(p => p.user_id === app.user_id)

    return {
      ...app,
      // ★ ニックネームを優先表示（企業向け）
      display_name: profile?.nickname || profile?.name || app.applicant_name || '-',
      // ★ 実名は選定後のみ
      real_name: profile?.name || '-',
      // その他プロフィール情報
      age: profile?.age || app.age || '-',
      skin_type: profile?.skin_type || app.skin_type || '-',
      gender: profile?.gender || '-',
      instagram_url: profile?.instagram_url || app.instagram_url || '',
      tiktok_url: profile?.tiktok_url || app.tiktok_url || '',
      youtube_url: profile?.youtube_url || app.youtube_url || '',
      // フォロワー数
      instagram_followers: profile?.instagram_followers || null,
      tiktok_followers: profile?.tiktok_followers || null,
      youtube_subscribers: profile?.youtube_subscribers || null,
      // ビューティープロフィール
      skin_shade: profile?.skin_shade || '-',
      personal_color: profile?.personal_color || '-',
      primary_interest: profile?.primary_interest || '-',
      follower_range: profile?.follower_range || '-',
      // プロフィール完成度
      profile_completed: profile?.profile_completed || false,
      // 全プロフィール（管理者用）
      user_profile: profile,
    }
  })
}
```

### 企業向けレポートでの表示分岐

```javascript
// 企業向けレポートのクリエイター情報表示
const CreatorInfoDisplay = ({ application, isConfirmed }) => {
  const profile = application.user_profile

  return (
    <div>
      {/* 常に表示: ニックネーム */}
      <h3>{application.display_name}</h3>

      {/* 常に表示: 基本情報 */}
      <p>年齢: {application.age}</p>
      <p>肌タイプ: {application.skin_type}</p>
      <p>SNS: {application.instagram_url}</p>

      {/* ★ 選定後のみ表示: 実名・連絡先・住所 */}
      {isConfirmed && (
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-slate-500">以下は選定後にのみ表示されます</p>
          <p>実名: {profile?.name}</p>
          <p>電話番号: {profile?.phone}</p>
          <p>住所: 〒{profile?.postcode} {getPrefectureLabel(profile?.prefecture)} {profile?.address} {profile?.detail_address}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 4. 出金処理フロー

### 出金申請取得（管理者用）

```javascript
const getWithdrawalRequests = async () => {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select(`
      *,
      user_profiles!withdrawal_requests_user_id_fkey(
        nickname, name, email, phone,
        bank_name, branch_code, account_type,
        account_number, account_holder,
        postcode, prefecture, address, detail_address
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### 銀行名の表示変換

```javascript
// value キー → 日本語表示ラベル
const BANK_LABELS = {
  yucho: 'ゆうちょ銀行',
  mufg: '三菱UFJ銀行',
  smbc: '三井住友銀行',
  mizuho: 'みずほ銀行',
  resona: 'りそな銀行',
  rakuten: '楽天銀行',
  paypay: 'PayPay銀行',
  sbi: '住信SBIネット銀行',
  aeon: 'イオン銀行',
  sony: 'ソニー銀行',
  au_jibun: 'auじぶん銀行',
  seven: 'セブン銀行',
  other: 'その他',
}

const ACCOUNT_TYPE_LABELS = {
  futsu: '普通',
  touza: '当座',
}

// 表示用フォーマット
const formatBankInfo = (profile) => {
  if (!profile?.bank_name) return '未登録'
  const bankLabel = BANK_LABELS[profile.bank_name] || profile.bank_name
  const typeLabel = ACCOUNT_TYPE_LABELS[profile.account_type] || ''
  return `${bankLabel} (支店: ${profile.branch_code || '-'}) ${typeLabel} ${profile.account_number || '-'} ${profile.account_holder || '-'}`
}
```

### 都道府県の表示変換

```javascript
const PREFECTURE_LABELS = {
  hokkaido: '北海道', aomori: '青森県', iwate: '岩手県',
  miyagi: '宮城県', akita: '秋田県', yamagata: '山形県',
  fukushima: '福島県', ibaraki: '茨城県', tochigi: '栃木県',
  gunma: '群馬県', saitama: '埼玉県', chiba: '千葉県',
  tokyo: '東京都', kanagawa: '神奈川県', niigata: '新潟県',
  toyama: '富山県', ishikawa: '石川県', fukui: '福井県',
  yamanashi: '山梨県', nagano: '長野県', gifu: '岐阜県',
  shizuoka: '静岡県', aichi: '愛知県', mie: '三重県',
  shiga: '滋賀県', kyoto: '京都府', osaka: '大阪府',
  hyogo: '兵庫県', nara: '奈良県', wakayama: '和歌山県',
  tottori: '鳥取県', shimane: '島根県', okayama: '岡山県',
  hiroshima: '広島県', yamaguchi: '山口県', tokushima: '徳島県',
  kagawa: '香川県', ehime: '愛媛県', kochi: '高知県',
  fukuoka: '福岡県', saga: '佐賀県', nagasaki: '長崎県',
  kumamoto: '熊本県', oita: '大分県', miyazaki: '宮崎県',
  kagoshima: '鹿児島県', okinawa: '沖縄県',
}

const formatAddress = (profile) => {
  if (!profile?.postcode) return '未登録'
  const pref = PREFECTURE_LABELS[profile.prefecture] || ''
  return `〒${profile.postcode} ${pref}${profile.address || ''} ${profile.detail_address || ''}`
}
```

---

## 5. 配送先住所の管理者向け表示

### 確定クリエイター一覧での住所表示

```javascript
// ConfirmedCreatorsReport で配送先を表示
const ShippingInfoCard = ({ profile }) => (
  <div className="bg-slate-50 rounded-xl p-4">
    <h4 className="text-sm font-semibold text-slate-700 mb-2">配送先情報</h4>

    {/* 受取人名（実名） */}
    <div className="text-sm">
      <span className="text-slate-500">受取人: </span>
      <span className="font-medium">{profile?.name || '未設定'}</span>
    </div>

    {/* 電話番号 */}
    <div className="text-sm mt-1">
      <span className="text-slate-500">電話番号: </span>
      <span>{profile?.phone || '未設定'}</span>
    </div>

    {/* 住所 */}
    <div className="text-sm mt-1">
      <span className="text-slate-500">住所: </span>
      <span>{formatAddress(profile)}</span>
    </div>
  </div>
)
```

---

## 6. ビューティープロフィールの管理者向け表示

### value → label 変換ヘルパー

```javascript
// beautyProfileOptions.js からインポートした定数を使用
import {
  SKIN_TYPES, SKIN_SHADES, PERSONAL_COLORS, HAIR_TYPES,
  PRIMARY_INTERESTS, EDITING_LEVELS, SHOOTING_LEVELS,
  FOLLOWER_RANGES, UPLOAD_FREQUENCIES, GENDERS,
  REVIEW_PLATFORM_OPTIONS, JAPAN_BANKS, ACCOUNT_TYPES, PREFECTURES
} from '../constants/beautyProfileOptions'

// value → label を変換するユーティリティ
const getLabel = (options, value) => {
  const opt = options.find(o => o.value === value)
  return opt ? opt.label : value || '未設定'
}

// 使用例
getLabel(SKIN_TYPES, 'dry')         // → '乾燥肌'
getLabel(SKIN_SHADES, 'very_fair')  // → '明るめ（色白）'
getLabel(JAPAN_BANKS, 'mufg')       // → '三菱UFJ銀行'
getLabel(PREFECTURES, 'tokyo')      // → '東京都'
```

### プロフィール詳細パネル（管理者ダッシュボード用）

```javascript
const CreatorDetailPanel = ({ profile }) => (
  <div className="space-y-6">
    {/* 基本情報 */}
    <section>
      <h3>基本情報</h3>
      <p>ニックネーム: {profile.nickname}</p>
      <p>実名: {profile.name}</p>
      <p>年齢: {profile.age}</p>
      <p>性別: {getLabel(GENDERS, profile.gender)}</p>
    </section>

    {/* 外見 */}
    <section>
      <h3>外見・肌情報</h3>
      <p>肌タイプ: {getLabel(SKIN_TYPES, profile.skin_type)}</p>
      <p>肌の明るさ: {getLabel(SKIN_SHADES, profile.skin_shade)}</p>
      <p>パーソナルカラー: {getLabel(PERSONAL_COLORS, profile.personal_color)}</p>
      <p>肌悩み: {(profile.skin_concerns || []).map(v => getLabel(SKIN_CONCERNS, v)).join(', ')}</p>
    </section>

    {/* コンテンツ */}
    <section>
      <h3>コンテンツ情報</h3>
      <p>主要コンテンツ: {getLabel(PRIMARY_INTERESTS, profile.primary_interest)}</p>
      <p>編集レベル: {getLabel(EDITING_LEVELS, profile.editing_level)}</p>
      <p>撮影レベル: {getLabel(SHOOTING_LEVELS, profile.shooting_level)}</p>
      <p>フォロワー規模: {getLabel(FOLLOWER_RANGES, profile.follower_range)}</p>
    </section>

    {/* 口コミ対応 */}
    <section>
      <h3>口コミ・レビュー</h3>
      <p>{getLabel(REVIEW_PLATFORM_OPTIONS, profile.review_platform)}</p>
    </section>
  </div>
)
```

---

## 7. エラー防止チェックリスト

### 既存キャンペーンとの互換性

- [x] `applicant_name` フィールドは引き続きフォールバックとして使用
- [x] `other_sns_url` は `blog_url` にマッピング（レガシー互換）
- [x] 新フィールドはすべて `NULL` デフォルト（既存レコード影響なし）
- [x] JSONB フィールドは `'[]'::jsonb` デフォルト
- [x] `user_profiles` テーブルの `user_id` でリレーション（変更なし）

### 管理者クエリでの注意点

```javascript
// ★ nickname が null の場合は name にフォールバック
const displayName = profile.nickname || profile.name || application.applicant_name || '-'

// ★ JSONB 配列フィールドは必ず配列チェック
const concerns = Array.isArray(profile.skin_concerns) ? profile.skin_concerns : []

// ★ 銀行名・都道府県は value キーで保存されている → ラベル変換が必要
const bankLabel = getLabel(JAPAN_BANKS, profile.bank_name)
const prefLabel = getLabel(PREFECTURES, profile.prefecture)
```

### withdrawal_requests テーブルとの連携

```sql
-- 出金申請時に銀行情報を user_profiles から参照
-- withdrawal_requests テーブル自体には銀行情報を重複保存しない
-- → user_profiles.bank_name, branch_code, account_type, account_number, account_holder を参照
```

---

## 8. CSV/Excel エクスポート用フォーマット

### 確定クリエイター一覧エクスポート

```
ニックネーム | 実名 | 年齢 | 電話番号 | 〒 | 都道府県 | 住所 | 建物名 | Instagram | フォロワー数 | 肌タイプ | 銀行名 | 支店番号 | 口座種別 | 口座番号 | 口座名義
```

### 応募一覧エクスポート（企業向け → 実名なし）

```
ニックネーム | 年齢 | 性別 | 肌タイプ | 肌の明るさ | パーソナルカラー | Instagram | フォロワー数 | 主要コンテンツ | フォロワー規模 | 口コミ対応
```
