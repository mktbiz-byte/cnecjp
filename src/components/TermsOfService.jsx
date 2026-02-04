import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
            利用規約
          </h1>
          <p className="text-gray-600">
            最終更新日: 2025年1月8日
          </p>
        </div>

        {/* コンテンツ */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* 第1条 総則 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第1条（総則）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                本利用規約（以下「本規約」といいます。）は、株式会社CNEC Korea（以下「当社」といいます。）が運営するCNEC Japan（以下「本サービス」といいます。）の利用に関する条件を、本サービスを利用するすべてのユーザー（以下「ユーザー」といいます。）と当社との間で定めるものです。
              </p>
              <p>
                ユーザーは、本サービスを利用することにより、本規約のすべての条項に同意したものとみなされます。
              </p>
            </div>
          </section>

          {/* 第2条 定義 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第2条（定義）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p>本規約において使用する用語の定義は、以下のとおりとします。</p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>「本サービス」とは、当社が運営するK-Beautyブランドとクリエイターをマッチングするプラットフォームをいいます。</li>
                <li>「ユーザー」とは、本規約に同意し、本サービスを利用する個人または法人をいいます。</li>
                <li>「クリエイター」とは、SNS等で情報発信を行い、本サービスを通じてキャンペーンに参加するユーザーをいいます。</li>
                <li>「キャンペーン」とは、当社または広告主が本サービス上で募集するプロモーション活動をいいます。</li>
              </ul>
            </div>
          </section>

          {/* 第3条 利用登録 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第3条（利用登録）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                本サービスの利用を希望する者は、当社が定める方法により利用登録を申請するものとします。
              </p>
              <p>
                当社は、以下の場合に利用登録を拒否することがあります：
              </p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>申請内容に虚偽の事項がある場合</li>
                <li>過去に本規約に違反したことがある場合</li>
                <li>18歳未満の場合</li>
                <li>その他、当社が不適切と判断した場合</li>
              </ul>
            </div>
          </section>

          {/* 第4条 アカウント管理 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第4条（アカウント管理）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                ユーザーは、自己の責任においてアカウント情報を管理するものとし、第三者への貸与、譲渡、名義変更、売買等を行ってはなりません。
              </p>
              <p>
                アカウント情報の管理不十分、使用上の過誤、第三者の使用等による損害について、当社は一切責任を負いません。
              </p>
            </div>
          </section>

          {/* 第5条 サービス内容 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第5条（サービス内容）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>当社は、本サービスにおいて以下のサービスを提供します：</p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>K-Beautyブランドとクリエイターのマッチング</li>
                <li>キャンペーン情報の掲載および応募機能</li>
                <li>SNS投稿の管理および報告機能</li>
                <li>報酬の支払い処理</li>
                <li>その他付随するサービス</li>
              </ul>
            </div>
          </section>

          {/* 第6条 キャンペーン参加 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第6条（キャンペーン参加）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                クリエイターは、各キャンペーンの条件を確認し、同意した上で応募するものとします。
              </p>
              <p>
                キャンペーンへの参加が確定した場合、クリエイターは以下の義務を負います：
              </p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>キャンペーン条件に従った投稿を行うこと</li>
                <li>期限内に投稿を完了し、報告すること</li>
                <li>虚偽の報告をしないこと</li>
                <li>広告であることを適切に表示すること（PR表記等）</li>
              </ul>
            </div>
          </section>

          {/* 第7条 報酬 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第7条（報酬）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                報酬は、各キャンペーンの条件に従って支払われます。
              </p>
              <p>
                報酬の支払いは、当社が投稿内容を確認し、キャンペーン条件を満たしていると判断した場合に行われます。
              </p>
              <p>
                税金については、ユーザー自身の責任において申告・納付するものとします。
              </p>
            </div>
          </section>

          {/* 第8条 通知・連絡 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第8条（通知・連絡）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                当社からユーザーへの通知は、以下の方法により行うものとします：
              </p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>登録されたメールアドレスへの電子メール</li>
                <li>LINE公式アカウントからのメッセージ</li>
                <li>本サービス上での掲示</li>
              </ul>
              <p className="mt-3">
                ユーザーは、当社からのLINEメッセージによる連絡を受けることに同意するものとします。LINEを通じた通知には、キャンペーン情報、応募状況の確認、重要なお知らせ等が含まれます。
              </p>
              <p>
                ユーザーは、いつでもLINE公式アカウントをブロックすることで、LINEによる通知を停止することができます。
              </p>
            </div>
          </section>

          {/* 第9条 禁止事項 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第9条（禁止事項）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>虚偽の情報を登録または投稿する行為</li>
                <li>当社または第三者の知的財産権を侵害する行為</li>
                <li>当社または第三者の名誉・信用を毀損する行為</li>
                <li>不正アクセスまたはシステムに過度の負荷をかける行為</li>
                <li>他のユーザーになりすます行為</li>
                <li>スパム行為または迷惑行為</li>
                <li>反社会的勢力との関係を有する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          {/* 第10条 サービスの中断・停止 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第10条（サービスの中断・停止）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                当社は、以下の場合に本サービスの全部または一部を中断・停止することができます：
              </p>
              <ul className="list-disc list-inside ml-2 sm:ml-4 space-y-2">
                <li>システムの保守・点検を行う場合</li>
                <li>天災、停電、通信障害等の不可抗力による場合</li>
                <li>その他、運営上必要と判断した場合</li>
              </ul>
              <p className="mt-3">
                当社は、サービスの中断・停止によりユーザーに生じた損害について、一切責任を負いません。
              </p>
            </div>
          </section>

          {/* 第11条 退会 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第11条（退会）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                ユーザーは、当社が定める手続きにより、いつでも退会することができます。
              </p>
              <p>
                退会時に進行中のキャンペーンがある場合、当該キャンペーンに関する義務は退会後も存続するものとします。
              </p>
            </div>
          </section>

          {/* 第12条 知的財産権 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第12条（知的財産権）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                本サービスに関する知的財産権は、当社または正当な権利者に帰属します。
              </p>
              <p>
                ユーザーが本サービス上で投稿したコンテンツについて、当社はサービスの提供・改善に必要な範囲で利用できるものとします。
              </p>
            </div>
          </section>

          {/* 第13条 免責事項 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第13条（免責事項）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                当社は、本サービスの内容について、その完全性、正確性、確実性、有用性等について、いかなる保証も行いません。
              </p>
              <p>
                本サービスの利用によりユーザーに生じた損害について、当社の故意または重過失による場合を除き、当社は責任を負いません。
              </p>
              <p>
                ユーザー間またはユーザーと第三者との間で生じた紛争について、当社は一切責任を負いません。
              </p>
            </div>
          </section>

          {/* 第14条 規約の変更 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第14条（規約の変更）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                当社は、必要と判断した場合、ユーザーへの事前通知なく本規約を変更することができます。
              </p>
              <p>
                変更後の規約は、本サービス上に掲示した時点から効力を生じるものとします。
              </p>
              <p>
                規約変更後も本サービスを継続して利用した場合、ユーザーは変更後の規約に同意したものとみなされます。
              </p>
            </div>
          </section>

          {/* 第15条 準拠法・管轄 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第15条（準拠法・管轄）
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>
                本規約の解釈および適用については、日本法を準拠法とします。
              </p>
              <p>
                本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
          </section>

          {/* 第16条 特定商取引法に基づく表示 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              第16条（特定商取引法に基づく表示）
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <div className="space-y-3 text-gray-700">
                <p><strong>事業者名:</strong> 株式会社CNEC Korea</p>
                <p><strong>サービス名:</strong> CNEC Japan</p>
                <p><strong>メールアドレス:</strong> mkt_biz@cnec.co.kr</p>
                <p><strong>ウェブサイト:</strong> <a href="https://cnec.jp" className="text-purple-600 hover:underline">https://cnec.jp</a></p>
                <p><strong>サービス内容:</strong> K-Beautyブランドとクリエイターのマッチングプラットフォーム</p>
                <p><strong>料金:</strong> クリエイターの利用は無料</p>
              </div>
            </div>
          </section>

          {/* お問い合わせ */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              お問い合わせ
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                本規約に関するお問い合わせは、以下までご連絡ください：
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>運営者:</strong> 株式会社CNEC Korea（CNEC Japan）</p>
                <p><strong>メールアドレス:</strong> mkt_biz@cnec.co.kr</p>
                <p><strong>ウェブサイト:</strong> <a href="https://cnec.jp" className="text-purple-600 hover:underline">https://cnec.jp</a></p>
              </div>
            </div>
          </section>

          {/* 附則 */}
          <section>
            <div className="border-t border-gray-200 pt-6 text-gray-600 text-sm">
              <p>附則</p>
              <p>本規約は2025年1月8日から施行します。</p>
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
