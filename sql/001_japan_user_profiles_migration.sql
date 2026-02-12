-- ============================================================
-- CNEC Japan - user_profiles テーブル マイグレーション
-- 日本向けビューティークリエイター プロフィール拡張
--
-- ⚠️ 使い方:
--   Supabase Dashboard → SQL Editor に貼り付けて実行してください。
--   既存データに影響を与えないよう IF NOT EXISTS / ADD COLUMN IF NOT EXISTS を使用。
-- ============================================================

-- ────────────────────────────────────────────
-- 1. 基本情報フィールド追加
-- ────────────────────────────────────────────

-- ニックネーム（企業に表示される名前）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

-- 性別
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- プロフィール画像（既にある場合はスキップ）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- ブログ/その他SNS URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS blog_url TEXT;

-- SNSフォロワー数
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS instagram_followers INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tiktok_followers INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS youtube_subscribers INTEGER;


-- ────────────────────────────────────────────
-- 2. 日本向け住所フィールド
-- ────────────────────────────────────────────

-- 郵便番号（7桁）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS postcode TEXT;

-- 都道府県
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS prefecture TEXT;

-- 住所（市区町村・番地）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 建物名・部屋番号
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS detail_address TEXT;


-- ────────────────────────────────────────────
-- 3. 日本向け銀行口座フィールド
-- ────────────────────────────────────────────

-- 銀行名
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- 支店番号（3桁）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS branch_code TEXT;

-- 口座種別（普通/当座）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_type TEXT;

-- 口座番号
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_number TEXT;

-- 口座名義（カタカナ）
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_holder TEXT;


-- ────────────────────────────────────────────
-- 4. ビューティープロフィール: 単一選択フィールド (TEXT)
-- ────────────────────────────────────────────

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skin_shade TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS personal_color TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hair_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_interest TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS editing_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS shooting_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS follower_range TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS upload_frequency TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_visibility TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS child_appearance TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS family_appearance TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS offline_visit TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS offline_region TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linktree_available TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nail_usage TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS circle_lens_usage TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS glasses_usage TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mirroring_available TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS review_platform TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS video_length_style TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS shortform_tempo TEXT;


-- ────────────────────────────────────────────
-- 5. ビューティープロフィール: 複数選択フィールド (JSONB)
-- ────────────────────────────────────────────

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skin_concerns JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hair_concerns JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet_concerns JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS content_formats JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS collaboration_preferences JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS video_styles JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS children JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS family_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS offline_locations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linktree_channels JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mirroring_channels JSONB DEFAULT '[]'::jsonb;


-- ────────────────────────────────────────────
-- 6. メタデータフィールド
-- ────────────────────────────────────────────

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;


-- ────────────────────────────────────────────
-- 7. GINインデックス（JSONB配列フィールドのパフォーマンス向上）
-- ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_profiles_skin_concerns
  ON user_profiles USING GIN (skin_concerns);

CREATE INDEX IF NOT EXISTS idx_user_profiles_hair_concerns
  ON user_profiles USING GIN (hair_concerns);

CREATE INDEX IF NOT EXISTS idx_user_profiles_diet_concerns
  ON user_profiles USING GIN (diet_concerns);

CREATE INDEX IF NOT EXISTS idx_user_profiles_content_formats
  ON user_profiles USING GIN (content_formats);

CREATE INDEX IF NOT EXISTS idx_user_profiles_collaboration_preferences
  ON user_profiles USING GIN (collaboration_preferences);

CREATE INDEX IF NOT EXISTS idx_user_profiles_video_styles
  ON user_profiles USING GIN (video_styles);

CREATE INDEX IF NOT EXISTS idx_user_profiles_children
  ON user_profiles USING GIN (children);

CREATE INDEX IF NOT EXISTS idx_user_profiles_family_members
  ON user_profiles USING GIN (family_members);

CREATE INDEX IF NOT EXISTS idx_user_profiles_offline_locations
  ON user_profiles USING GIN (offline_locations);

CREATE INDEX IF NOT EXISTS idx_user_profiles_languages
  ON user_profiles USING GIN (languages);

CREATE INDEX IF NOT EXISTS idx_user_profiles_linktree_channels
  ON user_profiles USING GIN (linktree_channels);

CREATE INDEX IF NOT EXISTS idx_user_profiles_mirroring_channels
  ON user_profiles USING GIN (mirroring_channels);


-- ────────────────────────────────────────────
-- 8. 通常インデックス（検索パフォーマンス）
-- ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname
  ON user_profiles (nickname);

CREATE INDEX IF NOT EXISTS idx_user_profiles_skin_type
  ON user_profiles (skin_type);

CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_interest
  ON user_profiles (primary_interest);

CREATE INDEX IF NOT EXISTS idx_user_profiles_follower_range
  ON user_profiles (follower_range);

CREATE INDEX IF NOT EXISTS idx_user_profiles_region
  ON user_profiles (region);

CREATE INDEX IF NOT EXISTS idx_user_profiles_country
  ON user_profiles (country);

CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_completed
  ON user_profiles (profile_completed);

CREATE INDEX IF NOT EXISTS idx_user_profiles_prefecture
  ON user_profiles (prefecture);


-- ────────────────────────────────────────────
-- 9. RLS (Row Level Security) ポリシー
--    既存のRLSポリシーがある場合はスキップされます
-- ────────────────────────────────────────────

-- RLSを有効化（既に有効なら無視される）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のプロフィールを読む
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ユーザーが自分のプロフィールを更新
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ユーザーが自分のプロフィールを作成
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON user_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ────────────────────────────────────────────
-- 10. SECURITY DEFINER関数（管理者チェック用）
--     ⚠️ 重要: user_profilesテーブルのRLSポリシー内で
--     同じテーブルをSELECTすると無限ループが発生するため、
--     SECURITY DEFINER関数でRLSをバイパスして管理者チェックを行う。
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND user_role IN ('admin', 'manager')
  );
$$;


-- ────────────────────────────────────────────
-- 11. 管理者用の全件読み取りポリシー
--     SECURITY DEFINER関数を使用（再帰なし）
-- ────────────────────────────────────────────

-- 管理者は全ユーザーのプロフィールを読める
DO $$
BEGIN
  -- 既存の問題あるポリシーを削除（無限ループ対策）
  DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

  CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (public.is_admin_or_manager());
END $$;

-- 管理者は全ユーザーのプロフィールを更新できる
DO $$
BEGIN
  -- 既存の問題あるポリシーを削除（無限ループ対策）
  DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

  CREATE POLICY "Admins can update all profiles"
    ON user_profiles FOR UPDATE
    USING (public.is_admin_or_manager());
END $$;


-- ────────────────────────────────────────────
-- ✅ 完了
-- ────────────────────────────────────────────
-- マイグレーション完了: CNEC Japan ビューティープロフィール拡張
-- 既存データは影響を受けません。新しいカラムはNULLまたはデフォルト値で追加されます。
