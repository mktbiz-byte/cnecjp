/**
 * ProfileSettingsBeauty.jsx
 * 日本向けビューティークリエイター プロフィール設定（拡張版 v4）
 *
 * タブ構成:
 *   1. 基本情報 - ニックネーム・名前・年齢・性別・SNSリンク
 *   2. 外見・肌 - 肌タイプ、肌色、ヘア、ネイル、カラコン
 *   3. コンテンツ - チャンネル、編集・撮影レベル、動画スタイル
 *   4. コラボ希望 - コンテンツ形式、コラボタイプ、オフライン
 *   5. 家族・出演 - 子供、家族メンバー
 *   6. アカウント管理 - 銀行口座、住所、ログアウト
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import {
  User, Sparkles, Film, Handshake, Users, Settings,
  ArrowLeft, Save, Loader2, CheckCircle, AlertCircle,
  Camera, Upload, Plus, X, ChevronDown, Shield, Info
} from 'lucide-react'
import {
  SKIN_TYPES, SKIN_SHADES, PERSONAL_COLORS, HAIR_TYPES,
  PRIMARY_INTERESTS, EDITING_LEVELS, SHOOTING_LEVELS,
  FOLLOWER_RANGES, UPLOAD_FREQUENCIES, GENDERS,
  JOB_VISIBILITY, YES_NO_OPTIONS, NAIL_USAGE,
  CIRCLE_LENS_USAGE, GLASSES_USAGE, VIDEO_LENGTH_STYLES,
  SHORTFORM_TEMPOS, REVIEW_PLATFORM_OPTIONS,
  SKIN_CONCERNS, HAIR_CONCERNS, DIET_CONCERNS,
  CONTENT_FORMATS, COLLABORATION_PREFERENCES, VIDEO_STYLES,
  LANGUAGES, OFFLINE_LOCATIONS, FAMILY_MEMBERS,
  LINKTREE_CHANNELS, MIRRORING_CHANNELS,
  JAPAN_BANKS, ACCOUNT_TYPES, PREFECTURES,
  PROFILE_COMPLETION_FIELDS
} from '../constants/beautyProfileOptions'


// ─── 共通UIコンポーネント ─────────────────────────

/** 単一選択ボタングループ */
const SingleSelectGroup = ({ options, value, onChange, columns = 3 }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-${columns} gap-2`}>
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(value === opt.value ? '' : opt.value)}
        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
          value === opt.value
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

/** 説明付きカード型選択 */
const SelectCardGroup = ({ options, value, onChange }) => (
  <div className="space-y-2">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(value === opt.value ? '' : opt.value)}
        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
          value === opt.value
            ? 'bg-blue-50 border-blue-400 shadow-sm'
            : 'bg-white border-slate-200 hover:border-blue-300'
        }`}
      >
        <span className={`font-medium text-sm ${value === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>
          {opt.label}
        </span>
        {opt.description && (
          <span className={`block text-xs mt-0.5 ${value === opt.value ? 'text-blue-500' : 'text-slate-400'}`}>
            {opt.description}
          </span>
        )}
      </button>
    ))}
  </div>
)

/** 複数選択チェックボックスグリッド */
const MultiSelectGroup = ({ options, values = [], onChange, columns = 2 }) => {
  const selected = Array.isArray(values) ? values : []
  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val))
    } else {
      onChange([...selected, val])
    }
  }
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border text-left ${
            selected.includes(opt.value)
              ? 'bg-blue-50 text-blue-700 border-blue-400'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
              selected.includes(opt.value) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
            }`}>
              {selected.includes(opt.value) && <CheckCircle className="w-3 h-3 text-white" />}
            </span>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}

/** 子供情報入力 */
const ChildrenInput = ({ children = [], onChange }) => {
  const list = Array.isArray(children) ? children : []
  const addChild = () => onChange([...list, { gender: 'boy', age: '' }])
  const removeChild = (idx) => onChange(list.filter((_, i) => i !== idx))
  const updateChild = (idx, field, val) => {
    const updated = [...list]
    updated[idx] = { ...updated[idx], [field]: val }
    onChange(updated)
  }
  return (
    <div className="space-y-3">
      {list.map((child, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <select
            value={child.gender || 'boy'}
            onChange={e => updateChild(idx, 'gender', e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="boy">男の子</option>
            <option value="girl">女の子</option>
          </select>
          <input
            type="number"
            value={child.age || ''}
            onChange={e => updateChild(idx, 'age', e.target.value)}
            placeholder="年齢"
            min="0" max="20"
            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <span className="text-sm text-slate-500">歳</span>
          <button type="button" onClick={() => removeChild(idx)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addChild}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
      >
        <Plus className="w-4 h-4" /> お子様を追加
      </button>
    </div>
  )
}

/** セクションラベル */
const SectionLabel = ({ label, hint }) => (
  <div className="mb-3">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
  </div>
)

/** プライバシー通知バナー */
const PrivacyNotice = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
    <div className="flex gap-3">
      <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-blue-800">個人情報の取り扱いについて</p>
        <p className="text-xs text-blue-600 mt-1 leading-relaxed">
          企業にはニックネームのみが表示されます。実名・住所・連絡先は、キャンペーン選定後に該当企業のみに提供されます。
          安心してプロフィールをご記入ください。
        </p>
      </div>
    </div>
  </div>
)


// ─── メインコンポーネント ─────────────────────────

const ProfileSettingsBeauty = () => {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // プロフィールデータ state
  const [profile, setProfile] = useState({
    // 基本情報
    nickname: '',
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bio: '',
    profile_image: '',
    // SNS
    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    blog_url: '',
    instagram_followers: '',
    tiktok_followers: '',
    youtube_subscribers: '',
    // 外見
    skin_type: '',
    skin_shade: '',
    personal_color: '',
    hair_type: '',
    skin_concerns: [],
    hair_concerns: [],
    diet_concerns: [],
    nail_usage: '',
    circle_lens_usage: '',
    glasses_usage: '',
    // コンテンツ
    primary_interest: '',
    editing_level: '',
    shooting_level: '',
    follower_range: '',
    upload_frequency: '',
    video_styles: [],
    video_length_style: '',
    shortform_tempo: '',
    // コラボ
    content_formats: [],
    collaboration_preferences: [],
    offline_visit: '',
    offline_locations: [],
    review_platform: '',
    mirroring_available: '',
    mirroring_channels: [],
    linktree_available: '',
    linktree_channels: [],
    languages: [],
    // 仕事
    job_visibility: '',
    job: '',
    // 家族
    child_appearance: '',
    children: [],
    family_appearance: '',
    family_members: [],
    // アカウント（住所・銀行）
    postcode: '',
    prefecture: '',
    address: '',
    detail_address: '',
    bank_name: '',
    branch_code: '',
    account_type: '',
    account_number: '',
    account_holder: '',
  })

  // タブ定義
  const tabs = useMemo(() => [
    { id: 'basic', label: '基本情報', icon: User },
    { id: 'appearance', label: '外見・肌', icon: Sparkles },
    { id: 'content', label: 'コンテンツ', icon: Film },
    { id: 'preferences', label: 'コラボ希望', icon: Handshake },
    { id: 'family', label: '家族・出演', icon: Users },
    { id: 'account', label: 'アカウント管理', icon: Settings },
  ], [])

  // ── プロフィール読み込み ────
  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchErr) {
        // RLS infinite recursion エラーの場合、明示的にユーザーに通知
        if (fetchErr.message?.includes('infinite recursion')) {
          console.error('RLS infinite recursion detected. Run sql/002_fix_rls_infinite_recursion.sql')
          setError('データベース設定にエラーがあります。管理者に「002_fix_rls_infinite_recursion.sql」の実行を依頼してください。')
        } else {
          console.error('Profile load error:', fetchErr)
        }
        // エラーでもページは表示（空のフォームで）
        setProfile(prev => ({ ...prev, email: user.email || '' }))
        return
      }

      if (data) {
        setProfile(prev => ({
          ...prev,
          ...data,
          email: data.email || user.email || '',
          nickname: data.nickname || '',
          // JSONB配列フィールドのデフォルト値保証
          skin_concerns: data.skin_concerns || [],
          hair_concerns: data.hair_concerns || [],
          diet_concerns: data.diet_concerns || [],
          content_formats: data.content_formats || [],
          collaboration_preferences: data.collaboration_preferences || [],
          video_styles: data.video_styles || [],
          offline_locations: data.offline_locations || [],
          children: data.children || [],
          family_members: data.family_members || [],
          languages: data.languages || [],
          linktree_channels: data.linktree_channels || [],
          mirroring_channels: data.mirroring_channels || [],
        }))
      } else {
        setProfile(prev => ({ ...prev, email: user.email || '' }))
      }
    } catch (err) {
      console.error('Profile load error:', err)
      setProfile(prev => ({ ...prev, email: user.email || '' }))
    } finally {
      setLoading(false)
    }
  }

  // ── プロフィール保存 ────
  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // ニックネーム必須チェック
      if (!profile.nickname?.trim()) {
        setError('ニックネームを入力してください。企業にはニックネームが表示されます。')
        setSaving(false)
        return
      }

      // 電話番号必須チェック（LINE連携のため）
      if (!profile.phone?.trim()) {
        setError('電話番号を入力してください。LINE連携に必要です。')
        setSaving(false)
        return
      }

      // 保存データ構築
      // Phase 1: 既存の基本カラム（マイグレーション不要）
      const coreData = {
        user_id: user.id,
        name: profile.name?.trim() || null,
        email: profile.email?.trim() || user.email,
        phone: profile.phone?.trim() || null,
        age: profile.age ? parseInt(profile.age) : null,
        bio: profile.bio?.trim() || null,
        profile_image: profile.profile_image || null,
        skin_type: profile.skin_type || null,
        instagram_url: profile.instagram_url?.trim() || null,
        youtube_url: profile.youtube_url?.trim() || null,
        tiktok_url: profile.tiktok_url?.trim() || null,
        updated_at: new Date().toISOString(),
      }

      // Phase 2: 拡張カラム（マイグレーション後に利用可能）
      const extendedData = {
        nickname: profile.nickname?.trim() || null,
        gender: profile.gender || null,
        blog_url: profile.blog_url?.trim() || null,
        instagram_followers: profile.instagram_followers ? parseInt(profile.instagram_followers) : null,
        tiktok_followers: profile.tiktok_followers ? parseInt(profile.tiktok_followers) : null,
        youtube_subscribers: profile.youtube_subscribers ? parseInt(profile.youtube_subscribers) : null,
        // 外見
        skin_shade: profile.skin_shade || null,
        personal_color: profile.personal_color || null,
        hair_type: profile.hair_type || null,
        skin_concerns: profile.skin_concerns || [],
        hair_concerns: profile.hair_concerns || [],
        diet_concerns: profile.diet_concerns || [],
        nail_usage: profile.nail_usage || null,
        circle_lens_usage: profile.circle_lens_usage || null,
        glasses_usage: profile.glasses_usage || null,
        // コンテンツ
        primary_interest: profile.primary_interest || null,
        editing_level: profile.editing_level || null,
        shooting_level: profile.shooting_level || null,
        follower_range: profile.follower_range || null,
        upload_frequency: profile.upload_frequency || null,
        video_styles: profile.video_styles || [],
        video_length_style: profile.video_length_style || null,
        shortform_tempo: profile.shortform_tempo || null,
        // コラボ
        content_formats: profile.content_formats || [],
        collaboration_preferences: profile.collaboration_preferences || [],
        offline_visit: profile.offline_visit || null,
        offline_locations: profile.offline_locations || [],
        review_platform: profile.review_platform || null,
        mirroring_available: profile.mirroring_available || null,
        mirroring_channels: profile.mirroring_channels || [],
        linktree_available: profile.linktree_available || null,
        linktree_channels: profile.linktree_channels || [],
        languages: profile.languages || [],
        // 仕事
        job_visibility: profile.job_visibility || null,
        job: profile.job?.trim() || null,
        // 家族
        child_appearance: profile.child_appearance || null,
        children: profile.children || [],
        family_appearance: profile.family_appearance || null,
        family_members: profile.family_members || [],
        // アカウント
        postcode: profile.postcode?.trim() || null,
        prefecture: profile.prefecture || null,
        address: profile.address?.trim() || null,
        detail_address: profile.detail_address?.trim() || null,
        bank_name: profile.bank_name || null,
        branch_code: profile.branch_code?.trim() || null,
        account_type: profile.account_type || null,
        account_number: profile.account_number?.trim() || null,
        account_holder: profile.account_holder?.trim() || null,
        // meta
        region: 'japan',
        country: 'JP',
        profile_completed: calculateCompletion() >= 80,
      }

      // 全フィールドで保存試行
      const fullData = { ...coreData, ...extendedData }

      // Upsert
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let saveError = null

      if (existing) {
        const { error: upErr } = await supabase
          .from('user_profiles')
          .update(fullData)
          .eq('user_id', user.id)
        saveError = upErr
      } else {
        const { error: insErr } = await supabase
          .from('user_profiles')
          .insert([fullData])
        saveError = insErr
      }

      // 全フィールド保存に失敗した場合、基本フィールドのみで再試行
      if (saveError) {
        console.warn('Full save failed, trying core fields only:', saveError.message)
        let coreError = null

        if (existing) {
          const { error: upErr } = await supabase
            .from('user_profiles')
            .update(coreData)
            .eq('user_id', user.id)
          coreError = upErr
        } else {
          const { error: insErr } = await supabase
            .from('user_profiles')
            .insert([coreData])
          coreError = insErr
        }

        if (coreError) {
          throw coreError
        }

        setSuccess('基本情報を保存しました。ビューティープロフィールの保存にはSQLマイグレーションの実行が必要です。')
        setTimeout(() => setSuccess(''), 6000)
        return
      }

      setSuccess('プロフィールを保存しました！')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error('Save error:', err)
      if (err.message?.includes('infinite recursion')) {
        setError('データベースのRLSポリシーにエラーがあります。管理者にお問い合わせください。（SQL修正: 002_fix_rls_infinite_recursion.sql）')
      } else {
        setError(`保存に失敗しました: ${err.message}`)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── プロフィール完成度 ────
  const calculateCompletion = useCallback(() => {
    const allFields = Object.values(PROFILE_COMPLETION_FIELDS).flat()
    let filled = 0
    allFields.forEach(field => {
      const val = profile[field]
      if (val && (Array.isArray(val) ? val.length > 0 : String(val).trim() !== '')) {
        filled++
      }
    })
    return Math.round((filled / allFields.length) * 100)
  }, [profile])

  const completionPercent = calculateCompletion()

  // ── 郵便番号→住所自動入力 ────
  const handlePostcodeSearch = async () => {
    const code = profile.postcode?.replace(/[^0-9]/g, '')
    if (!code || code.length !== 7) {
      setError('郵便番号は7桁の数字を入力してください（例: 1500001）')
      return
    }
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`)
      const json = await res.json()
      if (json.results && json.results.length > 0) {
        const r = json.results[0]
        const prefMatch = PREFECTURES.find(p => p.label === r.address1)
        setProfile(prev => ({
          ...prev,
          prefecture: prefMatch ? prefMatch.value : '',
          address: `${r.address2}${r.address3}`,
        }))
        setError('')
      } else {
        setError('該当する住所が見つかりませんでした')
      }
    } catch {
      setError('郵便番号検索に失敗しました')
    }
  }

  // ── プロフィール写真アップロード ────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('画像ファイルを選択してください'); return }
    if (file.size > 5 * 1024 * 1024) { setError('ファイルサイズは5MB以下にしてください'); return }
    try {
      setSaving(true)
      setError('')
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`
      const path = `profiles/${fileName}`
      let publicUrl = ''

      const { error: upErr } = await supabase.storage.from('profile-images').upload(path, file, { cacheControl: '3600', upsert: true })
      if (upErr) {
        // fallback to campaign-images bucket
        const { error: fbErr } = await supabase.storage.from('campaign-images').upload(`profiles/${fileName}`, file, { cacheControl: '3600', upsert: true })
        if (fbErr) throw fbErr
        const { data: { publicUrl: u } } = supabase.storage.from('campaign-images').getPublicUrl(`profiles/${fileName}`)
        publicUrl = u
      } else {
        const { data: { publicUrl: u } } = supabase.storage.from('profile-images').getPublicUrl(path)
        publicUrl = u
      }

      // Upsert: プロフィール行がない場合は新規作成
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        const { error: dbErr } = await supabase
          .from('user_profiles')
          .update({ profile_image: publicUrl, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
        if (dbErr) throw dbErr
      } else {
        const { error: dbErr } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: user.id,
            email: user.email,
            profile_image: publicUrl,
            updated_at: new Date().toISOString(),
          }])
        if (dbErr) throw dbErr
      }

      setProfile(prev => ({ ...prev, profile_image: publicUrl }))
      setSuccess('プロフィール写真を更新しました')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Image upload error:', err)
      if (err.message?.includes('infinite recursion')) {
        setError('データベースのRLSポリシーにエラーがあります。管理者にお問い合わせください。')
      } else {
        setError('写真のアップロードに失敗しました: ' + (err.message || ''))
      }
    } finally {
      setSaving(false)
    }
  }

  // ── フィールド更新ヘルパー ────
  const set = (field) => (val) => setProfile(prev => ({ ...prev, [field]: val }))
  const setInput = (field) => (e) => setProfile(prev => ({ ...prev, [field]: e.target.value }))

  // ── ローディング ────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-slate-400 text-sm">読み込み中...</span>
        </div>
      </div>
    )
  }

  // ── レンダリング ────
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/mypage" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800">プロフィール設定</h1>
              <p className="text-xs text-slate-400">ビューティープロフィールを充実させましょう</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </header>

      {/* アラート */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4 text-red-400" /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {/* 完成度バー */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">プロフィール完成度</span>
            <span className={`text-sm font-bold ${completionPercent >= 80 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {completionPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${completionPercent >= 80 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {completionPercent >= 100 && (
            <p className="text-xs text-emerald-600 mt-2 font-medium">
              プロフィールが完成しました！採用率が大幅にアップします 🎉
            </p>
          )}
          {completionPercent < 80 && (
            <p className="text-xs text-slate-400 mt-2">
              80%以上入力するとキャンペーン採用率がアップします
            </p>
          )}
        </div>

        {/* タブナビゲーション */}
        <div className="flex overflow-x-auto gap-1 mb-6 pb-1 scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8">

          {/* ═══ 1. 基本情報 ═══ */}
          {activeTab === 'basic' && (
            <div className="space-y-8">
              <PrivacyNotice />

              {/* プロフィール写真 */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  {profile.profile_image ? (
                    <img src={profile.profile_image} alt="" className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-white" />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">{(profile.nickname || profile.name || '?')[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">プロフィール写真</p>
                  <p className="text-xs text-slate-400">5MB以下の画像</p>
                  <label className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full cursor-pointer hover:bg-blue-100">
                    <Upload className="w-3 h-3" /> 写真を変更
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* ニックネーム */}
              <div>
                <SectionLabel
                  label="ニックネーム（必須）"
                  hint="企業に表示される名前です。選定前は実名が企業に公開されません。"
                />
                <input
                  type="text"
                  value={profile.nickname}
                  onChange={setInput('nickname')}
                  placeholder="例: みーちゃん、BeautyAya"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* 実名 */}
              <div>
                <SectionLabel
                  label="実名"
                  hint="配送・振込に使用します。キャンペーン選定後のみ企業に提供されます。"
                />
                <input
                  type="text"
                  value={profile.name}
                  onChange={setInput('name')}
                  placeholder="山田 花子"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 年齢 */}
                <div>
                  <SectionLabel label="年齢" />
                  <input
                    type="number"
                    value={profile.age}
                    onChange={setInput('age')}
                    placeholder="25"
                    min="1" max="120"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                {/* 性別 */}
                <div>
                  <SectionLabel label="性別" />
                  <SingleSelectGroup options={GENDERS} value={profile.gender} onChange={set('gender')} columns={2} />
                </div>
              </div>

              {/* 電話番号（必須） */}
              <div>
                <SectionLabel label="電話番号（必須）" hint="キャンペーン選定後のみ企業に提供されます。" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={setInput('phone')}
                  placeholder="080-1234-5678"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-700">
                    <p className="font-semibold mb-1">LINEの登録をお願いします</p>
                    <p>キャンペーンの連絡はLINEで行います。電話番号でLINEアカウントを登録してください。</p>
                    <p className="mt-1 text-green-600">企業との迅速なやり取りのために、LINEでの連絡が基本となります。</p>
                  </div>
                </div>
              </div>

              {/* 自己紹介 */}
              <div>
                <SectionLabel label="自己紹介" hint="得意分野やチャンネルの特徴を自由にお書きください。" />
                <textarea
                  value={profile.bio}
                  onChange={setInput('bio')}
                  rows={3}
                  placeholder="コスメ大好き！スキンケアを中心にレビュー動画を配信中です。"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* SNSリンク */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-700">SNSアカウント</h3>
                {[
                  { field: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/username', followerField: 'instagram_followers', followerLabel: 'フォロワー数' },
                  { field: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@channel', followerField: 'youtube_subscribers', followerLabel: '登録者数' },
                  { field: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@username', followerField: 'tiktok_followers', followerLabel: 'フォロワー数' },
                  { field: 'blog_url', label: 'その他（ブログ等）', placeholder: 'https://...', followerField: null },
                ].map(sns => (
                  <div key={sns.field} className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">{sns.label}</label>
                    <input
                      type="url"
                      value={profile[sns.field]}
                      onChange={setInput(sns.field)}
                      placeholder={sns.placeholder}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {sns.followerField && (
                      <input
                        type="number"
                        value={profile[sns.followerField]}
                        onChange={setInput(sns.followerField)}
                        placeholder={`${sns.followerLabel}（任意）`}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ 2. 外見・肌 ═══ */}
          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div>
                <SectionLabel label="肌タイプ" hint="日常的に感じる肌の状態をお選びください" />
                <SingleSelectGroup options={SKIN_TYPES} value={profile.skin_type} onChange={set('skin_type')} />
              </div>
              <div>
                <SectionLabel label="肌の明るさ" hint="ファンデーションの色味基準で最も近いもの" />
                <SingleSelectGroup options={SKIN_SHADES} value={profile.skin_shade} onChange={set('skin_shade')} />
              </div>
              <div>
                <SectionLabel label="パーソナルカラー" />
                <SingleSelectGroup options={PERSONAL_COLORS} value={profile.personal_color} onChange={set('personal_color')} columns={2} />
              </div>
              <div>
                <SectionLabel label="ヘアタイプ" />
                <SingleSelectGroup options={HAIR_TYPES} value={profile.hair_type} onChange={set('hair_type')} />
              </div>
              <div>
                <SectionLabel label="肌悩み" hint="複数選択可" />
                <MultiSelectGroup options={SKIN_CONCERNS} values={profile.skin_concerns} onChange={set('skin_concerns')} />
              </div>
              <div>
                <SectionLabel label="ヘア悩み" hint="複数選択可" />
                <MultiSelectGroup options={HAIR_CONCERNS} values={profile.hair_concerns} onChange={set('hair_concerns')} />
              </div>
              <div>
                <SectionLabel label="ダイエット・ボディ悩み" hint="複数選択可" />
                <MultiSelectGroup options={DIET_CONCERNS} values={profile.diet_concerns} onChange={set('diet_concerns')} />
              </div>
              <div>
                <SectionLabel label="ネイル" />
                <SingleSelectGroup options={NAIL_USAGE} value={profile.nail_usage} onChange={set('nail_usage')} />
              </div>
              <div>
                <SectionLabel label="カラコン" />
                <SingleSelectGroup options={CIRCLE_LENS_USAGE} value={profile.circle_lens_usage} onChange={set('circle_lens_usage')} />
              </div>
              <div>
                <SectionLabel label="メガネ" />
                <SingleSelectGroup options={GLASSES_USAGE} value={profile.glasses_usage} onChange={set('glasses_usage')} />
              </div>
            </div>
          )}

          {/* ═══ 3. コンテンツ ═══ */}
          {activeTab === 'content' && (
            <div className="space-y-8">
              <div>
                <SectionLabel label="チャンネルの主要コンテンツ" />
                <SingleSelectGroup options={PRIMARY_INTERESTS} value={profile.primary_interest} onChange={set('primary_interest')} columns={2} />
              </div>
              <div>
                <SectionLabel label="編集レベル" />
                <SelectCardGroup options={EDITING_LEVELS} value={profile.editing_level} onChange={set('editing_level')} />
              </div>
              <div>
                <SectionLabel label="撮影レベル" />
                <SelectCardGroup options={SHOOTING_LEVELS} value={profile.shooting_level} onChange={set('shooting_level')} />
              </div>
              <div>
                <SectionLabel label="フォロワー規模" hint="最も多いアカウントの規模" />
                <SingleSelectGroup options={FOLLOWER_RANGES} value={profile.follower_range} onChange={set('follower_range')} columns={2} />
              </div>
              <div>
                <SectionLabel label="投稿頻度" />
                <SingleSelectGroup options={UPLOAD_FREQUENCIES} value={profile.upload_frequency} onChange={set('upload_frequency')} />
              </div>
              <div>
                <SectionLabel label="動画スタイル" hint="複数選択可" />
                <MultiSelectGroup options={VIDEO_STYLES} values={profile.video_styles} onChange={set('video_styles')} />
              </div>
              <div>
                <SectionLabel label="動画の長さ" />
                <SingleSelectGroup options={VIDEO_LENGTH_STYLES} value={profile.video_length_style} onChange={set('video_length_style')} />
              </div>
              {(profile.video_length_style === 'shortform' || profile.video_length_style === 'both') && (
                <div>
                  <SectionLabel label="ショート動画のテンポ" />
                  <SingleSelectGroup options={SHORTFORM_TEMPOS} value={profile.shortform_tempo} onChange={set('shortform_tempo')} />
                </div>
              )}
            </div>
          )}

          {/* ═══ 4. コラボ希望 ═══ */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div>
                <SectionLabel label="コンテンツ形式" hint="複数選択可" />
                <MultiSelectGroup options={CONTENT_FORMATS} values={profile.content_formats} onChange={set('content_formats')} />
              </div>
              <div>
                <SectionLabel label="コラボレーションの希望" hint="複数選択可" />
                <MultiSelectGroup options={COLLABORATION_PREFERENCES} values={profile.collaboration_preferences} onChange={set('collaboration_preferences')} />
              </div>
              <div>
                <SectionLabel label="オフライン撮影" hint="店舗訪問など対面での撮影が可能かどうか" />
                <SingleSelectGroup options={YES_NO_OPTIONS} value={profile.offline_visit} onChange={set('offline_visit')} columns={2} />
              </div>
              {profile.offline_visit === 'possible' && (
                <div>
                  <SectionLabel label="オフライン撮影場所" hint="複数選択可" />
                  <MultiSelectGroup options={OFFLINE_LOCATIONS} values={profile.offline_locations} onChange={set('offline_locations')} />
                </div>
              )}
              <div>
                <SectionLabel label="口コミ・レビュー対応" hint="日本のビューティー口コミサイトでのレビュー作成" />
                <SingleSelectGroup options={REVIEW_PLATFORM_OPTIONS} value={profile.review_platform} onChange={set('review_platform')} columns={2} />
              </div>
              <div>
                <SectionLabel label="ミラーリング（他プラットフォーム同時投稿）" />
                <SingleSelectGroup options={YES_NO_OPTIONS} value={profile.mirroring_available} onChange={set('mirroring_available')} columns={2} />
              </div>
              {profile.mirroring_available === 'possible' && (
                <div>
                  <SectionLabel label="ミラーリングチャンネル" hint="複数選択可" />
                  <MultiSelectGroup options={MIRRORING_CHANNELS} values={profile.mirroring_channels} onChange={set('mirroring_channels')} />
                </div>
              )}
              <div>
                <SectionLabel label="リンクツリー設定" />
                <SingleSelectGroup options={YES_NO_OPTIONS} value={profile.linktree_available} onChange={set('linktree_available')} columns={2} />
              </div>
              {profile.linktree_available === 'possible' && (
                <div>
                  <SectionLabel label="リンクツリーチャンネル" hint="複数選択可" />
                  <MultiSelectGroup options={LINKTREE_CHANNELS} values={profile.linktree_channels} onChange={set('linktree_channels')} />
                </div>
              )}
              <div>
                <SectionLabel label="対応言語" hint="複数選択可" />
                <MultiSelectGroup options={LANGUAGES} values={profile.languages} onChange={set('languages')} />
              </div>
              {/* 仕事 */}
              <div className="pt-4 border-t border-slate-100">
                <SectionLabel label="職業公開" />
                <SingleSelectGroup options={JOB_VISIBILITY} value={profile.job_visibility} onChange={set('job_visibility')} columns={2} />
              </div>
              {profile.job_visibility === 'public' && (
                <div>
                  <SectionLabel label="職業名" />
                  <input
                    type="text"
                    value={profile.job}
                    onChange={setInput('job')}
                    placeholder="例: 会社員、学生、フリーランス"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══ 5. 家族・出演 ═══ */}
          {activeTab === 'family' && (
            <div className="space-y-8">
              <div>
                <SectionLabel label="お子様の出演" hint="動画にお子様が出演可能かどうか" />
                <SingleSelectGroup options={YES_NO_OPTIONS} value={profile.child_appearance} onChange={set('child_appearance')} columns={2} />
              </div>
              {profile.child_appearance === 'possible' && (
                <div>
                  <SectionLabel label="お子様情報" hint="性別と年齢を入力してください" />
                  <ChildrenInput children={profile.children} onChange={set('children')} />
                </div>
              )}
              <div>
                <SectionLabel label="ご家族の出演" hint="動画にご家族が出演可能かどうか" />
                <SingleSelectGroup options={YES_NO_OPTIONS} value={profile.family_appearance} onChange={set('family_appearance')} columns={2} />
              </div>
              {profile.family_appearance === 'possible' && (
                <div>
                  <SectionLabel label="出演可能な家族" hint="複数選択可" />
                  <MultiSelectGroup options={FAMILY_MEMBERS} values={profile.family_members} onChange={set('family_members')} />
                </div>
              )}
            </div>
          )}

          {/* ═══ 6. アカウント管理 ═══ */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* 住所 */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  📍 配送先住所
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">住所はキャンペーン選定後、商品発送のために該当企業のみに提供されます。</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={profile.postcode}
                    onChange={setInput('postcode')}
                    placeholder="〒 1500001（ハイフンなし7桁）"
                    maxLength={7}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handlePostcodeSearch}
                    className="px-5 py-3 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    検索
                  </button>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">都道府県</label>
                  <select
                    value={profile.prefecture}
                    onChange={(e) => setProfile(prev => ({ ...prev, prefecture: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">市区町村・番地</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={setInput('address')}
                    placeholder="渋谷区神宮前1-2-3"
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">建物名・部屋番号</label>
                  <input
                    type="text"
                    value={profile.detail_address}
                    onChange={setInput('detail_address')}
                    placeholder="〇〇マンション 101号室"
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 銀行口座 */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  🏦 振込先口座情報
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">口座情報はポイント出金時に使用されます。安全に暗号化して保管されます。</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">銀行名</label>
                  <select
                    value={profile.bank_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">選択してください</option>
                    {JAPAN_BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500">支店番号（3桁）</label>
                    <input
                      type="text"
                      value={profile.branch_code}
                      onChange={setInput('branch_code')}
                      placeholder="001"
                      maxLength={3}
                      className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">口座種別</label>
                    <select
                      value={profile.account_type}
                      onChange={(e) => setProfile(prev => ({ ...prev, account_type: e.target.value }))}
                      className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">選択</option>
                      {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">口座番号</label>
                  <input
                    type="text"
                    value={profile.account_number}
                    onChange={setInput('account_number')}
                    placeholder="1234567"
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">口座名義（カタカナ）</label>
                  <input
                    type="text"
                    value={profile.account_holder}
                    onChange={setInput('account_holder')}
                    placeholder="ヤマダ ハナコ"
                    className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* ログアウト */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={signOut}
                  className="w-full py-3 text-sm font-medium text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 下部保存ボタン（モバイル用） */}
        <div className="mt-6 sm:hidden">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettingsBeauty
