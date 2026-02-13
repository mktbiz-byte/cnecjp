-- ============================================================
-- CNEC Japan - RLS無限ループ修正 (HOTFIX)
--
-- ⚠️ 問題:
--   「Admins can view/update all profiles」ポリシーが
--   user_profiles テーブルを参照しているため、
--   同じRLSポリシーが再帰的に呼び出され無限ループが発生。
--   → "infinite recursion detected in policy for relation user_profiles"
--
-- ✅ 解決策:
--   SECURITY DEFINER関数を使って管理者チェックをRLSの外で実行。
--   この関数はRLSをバイパスするため再帰が発生しない。
--
-- ⚠️ 使い方:
--   Supabase Dashboard → SQL Editor に貼り付けて実行してください。
--   001_japan_user_profiles_migration.sql を実行済みの場合のみ必要。
-- ============================================================


-- ────────────────────────────────────────────
-- 1. SECURITY DEFINER関数の作成
--    この関数はRLSをバイパスして管理者チェックを行う
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
-- 2. 問題のあるポリシーを削除
-- ────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;


-- ────────────────────────────────────────────
-- 3. 修正されたポリシーを再作成
--    SECURITY DEFINER関数を使用（再帰なし）
-- ────────────────────────────────────────────

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.is_admin_or_manager());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (public.is_admin_or_manager());


-- ────────────────────────────────────────────
-- ✅ 完了
-- ────────────────────────────────────────────
-- 修正完了: RLS無限ループが解消されました。
-- 管理者は全ユーザーのプロフィールを閲覧・更新可能です。
-- 一般ユーザーは自分のプロフィールのみ閲覧・更新可能です。
