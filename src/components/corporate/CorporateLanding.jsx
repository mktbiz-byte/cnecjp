import React from 'react';
import { Link } from 'react-router-dom';

const CorporateLanding = () => {
  return (
    <div className="bg-white">
      {/* 헤더 섹션 */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold">CNEC.jp</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/" className="text-white hover:text-purple-200 px-3 py-2 rounded-md text-sm font-medium">
                홈
              </Link>
              <Link to="/corporate/login" className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md text-sm font-medium">
                로그인
              </Link>
              <Link to="/corporate/signup" className="bg-purple-800 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 h-3/4"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                새로운 인플루언서 마케팅의 시작
              </h1>
              <p className="mt-6 text-xl text-purple-100 max-w-3xl">
                비싼 광고 비용, 검증되지 않은 마케팅 효과, CNEC.jp 기업 관리 시스템이 해결합니다!
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/corporate/signup"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 shadow-lg transform transition hover:-translate-y-0.5"
                >
                  무료로 시작하기
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-800 hover:bg-purple-700 shadow-lg transform transition hover:-translate-y-0.5"
                >
                  서비스 알아보기
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://via.placeholder.com/600x400?text=CNEC.jp+Dashboard+Preview"
                alt="CNEC.jp 대시보드 미리보기"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              체험단 마케팅, 왜 이렇게 복잡하고 비쌀까요?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              CNEC.jp 기업 관리 시스템은 인플루언서 마케팅의 모든 문제점을 해결합니다.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 특징 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">시간 절약</h3>
              <p className="text-gray-600">
                하루 종일 가게 보느라 바쁜데... 체험단 선정 시간이 부족해요.
                <span className="block mt-2 font-medium text-purple-600">
                  AI가 자동으로 최적의 인플루언서를 매칭해 드립니다.
                </span>
              </p>
            </div>

            {/* 특징 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">비용 절감</h3>
              <p className="text-gray-600">
                광고비에 운영비, 수수료까지... 대행사에 맡기자니 비용이 부담스러워요.
                <span className="block mt-2 font-medium text-purple-600">
                  합리적인 가격으로 전문적인 인플루언서 마케팅을 진행하세요.
                </span>
              </p>
            </div>

            {/* 특징 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">최적의 인플루언서</h3>
              <p className="text-gray-600">
                캠페인 아무리 등록해도 감감무소식... 마음에 드는 지원자가 없으니 막막해요.
                <span className="block mt-2 font-medium text-purple-600">
                  검증된 인플루언서 풀에서 최적의 매칭을 제공합니다.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 프로세스 섹션 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              자동 인플루언서 매칭, 이렇게 진행돼요!
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              복잡한 과정 없이 간편하게 인플루언서 마케팅을 시작하세요.
            </p>
          </div>

          <div className="mt-16 relative">
            {/* 연결선 */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-purple-100 transform -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* 단계 1 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 z-10">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">적합한 조건 설정</h3>
                  <p className="text-center text-gray-600">
                    원하는 인플루언서 조건과 캠페인 정보를 입력하세요.
                  </p>
                </div>
              </div>

              {/* 단계 2 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 z-10">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">적합 지원자 모집</h3>
                  <p className="text-center text-gray-600">
                    AI가 캠페인에 적합한 인플루언서를 자동으로 모집합니다.
                  </p>
                </div>
              </div>

              {/* 단계 3 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 z-10">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">적합 지원자 추천</h3>
                  <p className="text-center text-gray-600">
                    데이터 기반으로 최적의 인플루언서를 추천해 드립니다.
                  </p>
                </div>
              </div>

              {/* 단계 4 */}
              <div className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 z-10">
                    4
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">지원자 자동 선정</h3>
                  <p className="text-center text-gray-600">
                    AI가 자동으로 최적의 인플루언서를 선정합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              서비스 가격 안내
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              넓은 인플루언서 풀, 검증된 기술력, CNEC.jp에서만 가능한 가격입니다.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 베이직 플랜 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="px-6 py-8 bg-purple-50 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 text-center">베이직</h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">60,000</span>
                  <span className="ml-2 text-xl font-medium text-gray-500 self-end">원/월</span>
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  소규모 비즈니스에 적합한 기본 플랜
                </p>
              </div>
              <div className="px-6 py-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">캠페인 무제한</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">모집 인원 무제한</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">결과보고서 제공</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">AI 지원자 추천 사유</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                    to="/corporate/signup"
                    className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition"
                  >
                    시작하기
                  </Link>
                </div>
              </div>
            </div>

            {/* 프리미엄 플랜 */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition hover:-translate-y-1 hover:shadow-2xl border-2 border-purple-500 relative">
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-sm font-bold">
                인기
              </div>
              <div className="px-6 py-8 bg-purple-100 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 text-center">프리미엄</h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">100,000</span>
                  <span className="ml-2 text-xl font-medium text-gray-500 self-end">원/월</span>
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  성장하는 비즈니스를 위한 최적의 선택
                </p>
              </div>
              <div className="px-6 py-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">베이직 플랜의 모든 기능</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">AI 지원자 자동 선정</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">타겟팅 푸시 광고</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">우선 노출 광고</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">전담 매니저 지원</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                    to="/corporate/signup"
                    className="block w-full bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition"
                  >
                    시작하기
                  </Link>
                </div>
              </div>
            </div>

            {/* 엔터프라이즈 플랜 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="px-6 py-8 bg-purple-50 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 text-center">엔터프라이즈</h3>
                <div className="mt-4 flex justify-center">
                  <span className="text-5xl font-extrabold text-gray-900">문의</span>
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  대규모 기업을 위한 맞춤형 솔루션
                </p>
              </div>
              <div className="px-6 py-8">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">프리미엄 플랜의 모든 기능</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">맞춤형 API 연동</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">전용 계정 관리자</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-600">맞춤형 보고서 및 분석</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href="mailto:contact@cnec.jp"
                    className="block w-full bg-gray-800 text-white text-center py-3 px-4 rounded-md hover:bg-gray-900 transition"
                  >
                    문의하기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              실제 만족도 97%
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              먼저 이용해본 사장님이 증명합니다.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 후기 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">A</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-gray-900">김OO 대표</h4>
                  <p className="text-sm text-gray-600">카페 운영</p>
                </div>
              </div>
              <p className="text-gray-600">
                "인플루언서의 자연스러운 홍보로 브랜드 자체를 핫하게 만들 수 있었어요. 기존에는 광고비만 들고 효과는 미미했는데, CNEC.jp를 통해 진짜 효과를 볼 수 있었습니다."
              </p>
              <div className="mt-4 flex">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>

            {/* 후기 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">B</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-gray-900">이OO 대표</h4>
                  <p className="text-sm text-gray-600">화장품 브랜드</p>
                </div>
              </div>
              <p className="text-gray-600">
                "이렇게 하니깐 매출이 2배 이상 올랐어요. 30대 타겟층에게 정확히 도달할 수 있었고, AI가 추천해준 인플루언서들의 콘텐츠 퀄리티가 정말 좋았습니다."
              </p>
              <div className="mt-4 flex">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>

            {/* 후기 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">C</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-bold text-gray-900">박OO 대표</h4>
                  <p className="text-sm text-gray-600">식품 브랜드</p>
                </div>
              </div>
              <p className="text-gray-600">
                "지역 체험단 200~300팀 부르니까 알아서 홍보되더라구요. 연매출 20억을 달성할 수 있었던 비결은 CNEC.jp의 체험단 마케팅이었습니다."
              </p>
              <div className="mt-4 flex">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-purple-100 max-w-3xl mx-auto">
            복잡한 인플루언서 마케팅, CNEC.jp 기업 관리 시스템으로 간편하게 해결하세요.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/corporate/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 md:py-4 md:text-lg md:px-10 shadow-lg transform transition hover:-translate-y-0.5"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">CNEC.jp</h3>
              <p className="text-gray-400 text-sm">
                K-Beauty × 쇼트 동영상의 전문 플랫폼
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">인플루언서 마케팅</a></li>
                <li><a href="#" className="hover:text-white">체험단 모집</a></li>
                <li><a href="#" className="hover:text-white">콘텐츠 제작</a></li>
                <li><a href="#" className="hover:text-white">마케팅 분석</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">회사</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">회사 소개</a></li>
                <li><a href="#" className="hover:text-white">이용약관</a></li>
                <li><a href="#" className="hover:text-white">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-white">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">연락처</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>이메일: contact@cnec.jp</li>
                <li>전화: +81-3-1234-5678</li>
                <li>주소: 일본 도쿄도 시부야구</li>
              </ul>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CNEC.jp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CorporateLanding;
