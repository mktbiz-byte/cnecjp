/**
 * CNEC Japan - ビューティークリエイター プロフィールオプション定数
 *
 * 日本市場向けにローカライズされたプロフィール選択肢です。
 * value はデータベースに保存される英文キー（変更不可）、
 * label は日本語UI表示用テキストです。
 */

// ─── 単一選択（Single Select）─────────────────────────

/** 肌タイプ */
export const SKIN_TYPES = [
  { value: 'dry', label: '乾燥肌' },
  { value: 'oily', label: '脂性肌' },
  { value: 'combination', label: '混合肌' },
  { value: 'sensitive', label: '敏感肌' },
  { value: 'normal', label: '普通肌' },
]

/** 肌の明るさ（ファンデーション色味基準）
 *  韓国の「号数」体系を日本のファンデーション色味基準に変更
 */
export const SKIN_SHADES = [
  { value: 'very_fair', label: '明るめ（色白）' },
  { value: 'fair', label: 'やや明るめ' },
  { value: 'medium', label: '標準的' },
  { value: 'tan', label: 'やや暗め' },
  { value: 'dark', label: '暗め（健康的な肌色）' },
]

/** パーソナルカラー */
export const PERSONAL_COLORS = [
  { value: 'spring_warm', label: 'イエベ春' },
  { value: 'summer_cool', label: 'ブルベ夏' },
  { value: 'autumn_warm', label: 'イエベ秋' },
  { value: 'winter_cool', label: 'ブルベ冬' },
  { value: 'warm_neutral', label: 'ウォームニュートラル' },
  { value: 'cool_neutral', label: 'クールニュートラル' },
  { value: 'true_neutral', label: 'ニュートラル' },
]

/** ヘアタイプ */
export const HAIR_TYPES = [
  { value: 'dry', label: '乾燥' },
  { value: 'oily', label: '脂性' },
  { value: 'normal', label: '普通' },
]

/** チャンネル主要コンテンツ */
export const PRIMARY_INTERESTS = [
  { value: 'skincare', label: 'スキンケア' },
  { value: 'haircare', label: 'ヘアケア' },
  { value: 'diet_fitness', label: 'ダイエット・フィットネス' },
  { value: 'makeup', label: 'メイクアップ' },
  { value: 'wellness', label: 'ウェルネス' },
  { value: 'fashion', label: 'ファッション' },
  { value: 'travel', label: '旅行' },
  { value: 'parenting', label: '子育て' },
]

/** 編集レベル */
export const EDITING_LEVELS = [
  { value: 'beginner', label: '初級', description: 'CapCut・iMovieなどで簡単な編集' },
  { value: 'intermediate', label: '中級', description: 'Premiere Pro・Final Cut Proで編集' },
  { value: 'expert', label: '上級', description: 'モーショングラフィックス・カラーグレーディング' },
]

/** 撮影レベル */
export const SHOOTING_LEVELS = [
  { value: 'beginner', label: '初級', description: 'スマートフォンで基本撮影' },
  { value: 'intermediate', label: '中級', description: '照明・三脚を使用' },
  { value: 'expert', label: '上級', description: 'ミラーレス・一眼レフ使用' },
]

/** フォロワー規模 */
export const FOLLOWER_RANGES = [
  { value: '1k_10k', label: '1K〜10K' },
  { value: '10k_100k', label: '10K〜100K' },
  { value: '100k_1m', label: '100K〜1M' },
  { value: '1m_plus', label: '1M+' },
]

/** 投稿頻度 */
export const UPLOAD_FREQUENCIES = [
  { value: 'weekly', label: '週1回以上' },
  { value: 'biweekly', label: '月2〜3回' },
  { value: 'monthly', label: '月1回以下' },
]

/** 性別 */
export const GENDERS = [
  { value: 'female', label: '女性' },
  { value: 'male', label: '男性' },
  { value: 'other', label: 'その他' },
  { value: 'prefer_not', label: '回答しない' },
]

/** 職業公開 */
export const JOB_VISIBILITY = [
  { value: 'public', label: '公開する' },
  { value: 'private', label: '非公開' },
]

/** 可否選択（子供出演、家族出演、オフライン撮影、リンクツリー、ミラーリング） */
export const YES_NO_OPTIONS = [
  { value: 'possible', label: '可能' },
  { value: 'impossible', label: '不可' },
]

/** ネイル使用 */
export const NAIL_USAGE = [
  { value: 'always', label: 'いつもしている' },
  { value: 'sometimes', label: 'たまにする' },
  { value: 'never', label: 'していない' },
]

/** カラコン使用 */
export const CIRCLE_LENS_USAGE = [
  { value: 'always', label: 'いつもつけている' },
  { value: 'sometimes', label: 'たまにつける' },
  { value: 'never', label: 'つけていない' },
]

/** メガネ着用 */
export const GLASSES_USAGE = [
  { value: 'always', label: 'いつもかけている' },
  { value: 'sometimes', label: 'たまにかける' },
  { value: 'never', label: 'かけていない' },
]

/** 動画の長さスタイル */
export const VIDEO_LENGTH_STYLES = [
  { value: 'longform', label: 'ロング動画' },
  { value: 'shortform', label: 'ショート動画' },
  { value: 'both', label: 'どちらも対応可能' },
]

/** ショート動画テンポ */
export const SHORTFORM_TEMPOS = [
  { value: 'fast', label: 'テンポ速め' },
  { value: 'normal', label: '普通' },
  { value: 'slow', label: 'ゆっくりめ' },
]

/**
 * @cosme / LIPS レビュー作成
 * 韓国の「スマートスtoア購入」を日本の口コミ文化に置き換え
 */
export const REVIEW_PLATFORM_OPTIONS = [
  { value: 'atcosme_possible', label: '@cosmeレビュー可能' },
  { value: 'lips_possible', label: 'LIPSレビュー可能' },
  { value: 'both_possible', label: '両方レビュー可能' },
  { value: 'impossible', label: '対応不可' },
]


// ─── 複数選択（Multi Select）─────────────────────────

/** 肌悩み */
export const SKIN_CONCERNS = [
  { value: 'trouble', label: '肌荒れ' },
  { value: 'acne', label: 'ニキビ' },
  { value: 'pores', label: '毛穴' },
  { value: 'pigmentation', label: 'シミ・そばかす' },
  { value: 'wrinkles', label: 'シワ' },
  { value: 'redness', label: '赤み' },
  { value: 'atopy', label: 'アトピー' },
  { value: 'inner_dryness', label: 'インナードライ' },
  { value: 'oiliness', label: 'テカリ・皮脂' },
]

/** ヘア悩み */
export const HAIR_CONCERNS = [
  { value: 'damaged', label: 'ダメージヘア' },
  { value: 'weak', label: '細毛・薄毛' },
  { value: 'dandruff', label: 'フケ・かゆみ' },
  { value: 'oily_scalp', label: '頭皮のベタつき' },
  { value: 'sensitive_scalp', label: '敏感な頭皮' },
  { value: 'frizzy', label: 'くせ毛・うねり' },
  { value: 'perm_damage', label: 'パーマダメージ' },
  { value: 'bleach_damage', label: 'ブリーチダメージ' },
]

/** ダイエット・ボディ悩み */
export const DIET_CONCERNS = [
  { value: 'overall_weight', label: '全体的な体重減量' },
  { value: 'spot_reduction', label: '部分痩せ' },
  { value: 'weight_maintain', label: '体重維持' },
  { value: 'muscle_gain', label: '筋力アップ' },
  { value: 'cellulite', label: 'セルライト' },
  { value: 'skin_elasticity', label: 'たるみ・ハリ' },
  { value: 'binge_eating', label: '過食・夜食' },
  { value: 'nutrition', label: '栄養バランス' },
  { value: 'digestion', label: '消化トラブル' },
]

/** コンテンツ形式 */
export const CONTENT_FORMATS = [
  { value: 'shorts', label: 'ショート（Shorts / Reels）' },
  { value: 'longform', label: 'ロング（YouTube）' },
  { value: 'feed', label: 'フィード（写真投稿）' },
  { value: 'live', label: 'ライブ配信' },
  { value: 'story', label: 'ストーリーズ' },
  { value: 'group_buy', label: '共同購入（ライブコマース）' },
]

/** コラボレーション希望 */
export const COLLABORATION_PREFERENCES = [
  { value: 'product_review', label: '商品レビュー' },
  { value: 'unboxing', label: '開封動画' },
  { value: 'tutorial', label: 'チュートリアル' },
  { value: 'sponsorship', label: 'スポンサーシップ' },
  { value: 'ambassador', label: 'アンバサダー' },
]

/** 動画スタイル */
export const VIDEO_STYLES = [
  { value: 'emotional', label: 'エモーショナル系' },
  { value: 'review', label: 'レビュー系' },
  { value: 'tutorial', label: 'チュートリアル系' },
  { value: 'vlog', label: 'VLOG' },
  { value: 'unboxing', label: '開封系' },
  { value: 'comparison', label: '比較・ランキング' },
  { value: 'haul', label: '購入品紹介' },
  { value: 'asmr', label: 'ASMR' },
]

/** 対応言語 */
export const LANGUAGES = [
  { value: 'japanese', label: '日本語' },
  { value: 'english', label: '英語' },
  { value: 'korean', label: '韓国語' },
  { value: 'chinese', label: '中国語' },
]

/** オフラインロケーション（日本市場向け） */
export const OFFLINE_LOCATIONS = [
  { value: 'popup', label: 'ポップアップストア' },
  { value: 'drugstore', label: 'ドラッグストア（マツキヨ等）' },
  { value: 'atcosme_store', label: '@cosme STORE' },
  { value: 'loft', label: 'ロフト' },
  { value: 'donki', label: 'ドン・キホーテ' },
  { value: 'department', label: '百貨店' },
  { value: 'other', label: 'その他' },
]

/** 家族メンバー */
export const FAMILY_MEMBERS = [
  { value: 'husband', label: '夫' },
  { value: 'wife', label: '妻' },
  { value: 'parents', label: '親' },
]

/** リンクツリーチャンネル */
export const LINKTREE_CHANNELS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
]

/** ミラーリングチャンネル（他プラットフォーム同時投稿） */
export const MIRRORING_CHANNELS = [
  { value: 'line_voom', label: 'LINE VOOM' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
]


// ─── 日本特化：銀行リスト ─────────────────────────

/** 日本の主要銀行リスト */
export const JAPAN_BANKS = [
  { value: 'yucho', label: 'ゆうちょ銀行' },
  { value: 'mufg', label: '三菱UFJ銀行' },
  { value: 'smbc', label: '三井住友銀行' },
  { value: 'mizuho', label: 'みずほ銀行' },
  { value: 'resona', label: 'りそな銀行' },
  { value: 'rakuten', label: '楽天銀行' },
  { value: 'paypay', label: 'PayPay銀行' },
  { value: 'sbi', label: '住信SBIネット銀行' },
  { value: 'aeon', label: 'イオン銀行' },
  { value: 'sony', label: 'ソニー銀行' },
  { value: 'au_jibun', label: 'auじぶん銀行' },
  { value: 'seven', label: 'セブン銀行' },
  { value: 'other', label: 'その他' },
]

/** 口座種別 */
export const ACCOUNT_TYPES = [
  { value: 'futsu', label: '普通' },
  { value: 'touza', label: '当座' },
]


// ─── 日本特化：都道府県リスト ─────────────────────────

/** 47都道府県 */
export const PREFECTURES = [
  { value: 'hokkaido', label: '北海道' },
  { value: 'aomori', label: '青森県' },
  { value: 'iwate', label: '岩手県' },
  { value: 'miyagi', label: '宮城県' },
  { value: 'akita', label: '秋田県' },
  { value: 'yamagata', label: '山形県' },
  { value: 'fukushima', label: '福島県' },
  { value: 'ibaraki', label: '茨城県' },
  { value: 'tochigi', label: '栃木県' },
  { value: 'gunma', label: '群馬県' },
  { value: 'saitama', label: '埼玉県' },
  { value: 'chiba', label: '千葉県' },
  { value: 'tokyo', label: '東京都' },
  { value: 'kanagawa', label: '神奈川県' },
  { value: 'niigata', label: '新潟県' },
  { value: 'toyama', label: '富山県' },
  { value: 'ishikawa', label: '石川県' },
  { value: 'fukui', label: '福井県' },
  { value: 'yamanashi', label: '山梨県' },
  { value: 'nagano', label: '長野県' },
  { value: 'gifu', label: '岐阜県' },
  { value: 'shizuoka', label: '静岡県' },
  { value: 'aichi', label: '愛知県' },
  { value: 'mie', label: '三重県' },
  { value: 'shiga', label: '滋賀県' },
  { value: 'kyoto', label: '京都府' },
  { value: 'osaka', label: '大阪府' },
  { value: 'hyogo', label: '兵庫県' },
  { value: 'nara', label: '奈良県' },
  { value: 'wakayama', label: '和歌山県' },
  { value: 'tottori', label: '鳥取県' },
  { value: 'shimane', label: '島根県' },
  { value: 'okayama', label: '岡山県' },
  { value: 'hiroshima', label: '広島県' },
  { value: 'yamaguchi', label: '山口県' },
  { value: 'tokushima', label: '徳島県' },
  { value: 'kagawa', label: '香川県' },
  { value: 'ehime', label: '愛媛県' },
  { value: 'kochi', label: '高知県' },
  { value: 'fukuoka', label: '福岡県' },
  { value: 'saga', label: '佐賀県' },
  { value: 'nagasaki', label: '長崎県' },
  { value: 'kumamoto', label: '熊本県' },
  { value: 'oita', label: '大分県' },
  { value: 'miyazaki', label: '宮崎県' },
  { value: 'kagoshima', label: '鹿児島県' },
  { value: 'okinawa', label: '沖縄県' },
]


// ─── 等級システム（共通） ─────────────────────────

export const GRADE_LEVELS = {
  1: { name: 'FRESH', label: 'フレッシュクリエイター', description: '始まったばかりのクリエイター' },
  2: { name: 'GLOW', label: 'グロウクリエイター', description: '輝き始めたクリエイター' },
  3: { name: 'BLOOM', label: 'ブルームクリエイター', description: '本格的に花開くクリエイター' },
  4: { name: 'ICONIC', label: 'アイコニッククリエイター', description: 'ブランドから指名されるクリエイター' },
  5: { name: 'MUSE', label: 'ミューズクリエイター', description: 'CNEC Japan代表ミューズ' },
}


// ─── キャンペーンタイプ（日本向け） ─────────────────────────

export const CAMPAIGN_TYPES = {
  regular: { label: '通常キャンペーン', description: '基本的な商品PR・レビューキャンペーン' },
  review_challenge: { label: 'レビューチャレンジ', description: '@cosme / LIPS連動レビューキャンペーン' },
  drugstore: { label: 'ドラッグストアキャンペーン', description: '店舗連動型キャンペーン（マツキヨ・ウエルシア等）' },
  cnec_plus: { label: 'CNEC Plus', description: '長期アンバサダープログラム' },
}


// ─── プロフィール完成度フィールド ─────────────────────────

export const PROFILE_COMPLETION_FIELDS = {
  basic: [
    'nickname', 'name', 'age', 'gender', 'phone', 'bio',
    'instagram_url', 'youtube_url', 'tiktok_url',
  ],
  appearance: [
    'skin_type', 'skin_shade', 'personal_color',
    'hair_type', 'skin_concerns', 'hair_concerns',
    'nail_usage', 'circle_lens_usage', 'glasses_usage',
  ],
  content: [
    'primary_interest', 'editing_level', 'shooting_level',
    'follower_range', 'upload_frequency', 'video_styles',
    'video_length_style', 'shortform_tempo',
  ],
  preferences: [
    'content_formats', 'collaboration_preferences',
    'offline_visit', 'review_platform',
    'mirroring_available', 'mirroring_channels',
    'languages',
  ],
  family: [
    'child_appearance', 'family_appearance',
  ],
  account: [
    'postcode', 'prefecture', 'address', 'detail_address',
    'bank_name', 'branch_code', 'account_type',
    'account_number', 'account_holder',
  ],
}


// ─── デフォルトエクスポート ─────────────────────────

const beautyProfileOptions = {
  // Single Select
  SKIN_TYPES,
  SKIN_SHADES,
  PERSONAL_COLORS,
  HAIR_TYPES,
  PRIMARY_INTERESTS,
  EDITING_LEVELS,
  SHOOTING_LEVELS,
  FOLLOWER_RANGES,
  UPLOAD_FREQUENCIES,
  GENDERS,
  JOB_VISIBILITY,
  YES_NO_OPTIONS,
  NAIL_USAGE,
  CIRCLE_LENS_USAGE,
  GLASSES_USAGE,
  VIDEO_LENGTH_STYLES,
  SHORTFORM_TEMPOS,
  REVIEW_PLATFORM_OPTIONS,

  // Multi Select
  SKIN_CONCERNS,
  HAIR_CONCERNS,
  DIET_CONCERNS,
  CONTENT_FORMATS,
  COLLABORATION_PREFERENCES,
  VIDEO_STYLES,
  LANGUAGES,
  OFFLINE_LOCATIONS,
  FAMILY_MEMBERS,
  LINKTREE_CHANNELS,
  MIRRORING_CHANNELS,

  // Japan-specific
  JAPAN_BANKS,
  ACCOUNT_TYPES,
  PREFECTURES,

  // System
  GRADE_LEVELS,
  CAMPAIGN_TYPES,
  PROFILE_COMPLETION_FIELDS,
}

export default beautyProfileOptions
