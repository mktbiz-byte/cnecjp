import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
            プライバシーポリシー
          </h1>
          <p className="text-gray-600">
            最終更新日: 2025年11月4日
          </p>
        </div>

        {/* コンテンツ */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* 1. 基本方針 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              1. 基本方針
            </h2>
            <p className="text-gray-700 leading-relaxed">
              CNEC Japan（以下「当社」）は、ユーザーの個人情報保護を重要視し、個人情報保護法および関連法令を遵守します。本プライバシーポリシーは、当社がどのように個人情報を収集、使用、保護するかを説明します。
            </p>
          </section>

          {/* 2. 収集する情報 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              2. 収集する情報
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  2.1 ユーザーが提供する情報
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 sm:ml-4">
                  <li>氏名、メールアドレス</li>
                  <li>SNSアカウント情報（Instagram、YouTube、TikTokなど）</li>
                  <li>プロフィール情報（年齢、性別、地域など）</li>
                  <li>連絡先情報（電話番号、住所）</li>
                  <li>銀行口座情報（報酬支払い用）</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  2.2 自動的に収集される情報
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 sm:ml-4">
                  <li>IPアドレス、ブラウザ情報</li>
                  <li>アクセスログ、Cookie情報</li>
                  <li>デバイス情報</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. 情報の利用目的 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              3. 情報の利用目的
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 sm:ml-4">
              <li>サービスの提供および運営</li>
              <li>ユーザー認証およびアカウント管理</li>
              <li>キャンペーンのマッチングおよび管理</li>
              <li>報酬の支払い処理</li>
              <li>カスタマーサポート</li>
              <li>サービス改善のための分析</li>
              <li>法令遵守および不正行為の防止</li>
            </ul>
          </section>

          {/* 4. 情報の共有 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              4. 情報の共有
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません：
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 sm:ml-4">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>サービス提供に必要な業務委託先（決済代行会社など）</li>
              <li>企業とクリエイターのマッチングに必要な範囲</li>
            </ul>
          </section>

          {/* 5. 情報の保護 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              5. 情報の保護
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、個人情報の漏洩、滅失、毀損を防止するため、適切な安全管理措置を講じています。SSL/TLS暗号化通信、アクセス制限、定期的なセキュリティ監査を実施しています。
            </p>
          </section>

          {/* 6. Cookie */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              6. Cookieの使用
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社のウェブサイトでは、ユーザー体験の向上およびサービス改善のためにCookieを使用しています。ブラウザの設定でCookieを無効にすることができますが、一部機能が制限される場合があります。
            </p>
          </section>

          {/* 7. ユーザーの権利 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              7. ユーザーの権利
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              ユーザーは、自身の個人情報について以下の権利を有します：
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 sm:ml-4">
              <li>開示請求</li>
              <li>訂正・追加・削除</li>
              <li>利用停止・消去</li>
              <li>第三者提供の停止</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              これらの請求については、下記お問い合わせ先までご連絡ください。
            </p>
          </section>

          {/* 8. 第三者サービス */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              8. 第三者サービスの利用
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              当社のサービスでは、以下の第三者サービスを利用しています：
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2 sm:ml-4">
              <li>Google Analytics（アクセス解析）</li>
              <li>Google OAuth（ログイン認証）</li>
              <li>Supabase（データベース）</li>
              <li>Netlify（ホスティング）</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              これらのサービスには、それぞれ独自のプライバシーポリシーが適用されます。
            </p>
          </section>

          {/* 9. 子供のプライバシー */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              9. 子供のプライバシー
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社のサービスは、18歳未満の方を対象としていません。18歳未満の方が誤って個人情報を提供した場合は、速やかに削除いたします。
            </p>
          </section>

          {/* 10. ポリシーの変更 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              10. プライバシーポリシーの変更
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、法令の変更やサービスの改善に伴い、本プライバシーポリシーを変更することがあります。重要な変更がある場合は、ウェブサイト上で通知いたします。
            </p>
          </section>

          {/* 11. お問い合わせ */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              11. お問い合わせ
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>運営者:</strong> CNEC Japan</p>
                <p><strong>メールアドレス:</strong> privacy@cnec.jp</p>
                <p><strong>ウェブサイト:</strong> <a href="https://cnec.jp" className="text-purple-600 hover:underline">https://cnec.jp</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
