import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useCorporateAuth } from '../../contexts/CorporateAuthContext';

const CorporateLayout = () => {
  const { corporateUser, corporateAccount, loading, signOut } = useCorporateAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-purple-800 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!corporateUser) {
    return <Navigate to="/corporate/login" replace />;
  }

  const isActive = (path) => {
    return location.pathname === path ? 
      'bg-purple-800 text-white' : 
      'text-gray-300 hover:bg-purple-700 hover:text-white transition-colors duration-200';
  };

  const menuItems = [
    { path: '/corporate/dashboard', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/corporate/orders', label: '주문 관리', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/corporate/creators', label: '크리에이터 목록', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/corporate/guides', label: '가이드 관리', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 모바일 메뉴 토글 버튼 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <span className="text-xl font-bold text-purple-700">CNEC Corp</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none transition duration-150 ease-in-out"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 사이드바 */}
      <div className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-purple-900 shadow-xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col">
          <div className="flex items-center justify-between h-16 px-6 bg-purple-800">
            <span className="text-xl font-bold text-white">CNEC Corp</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-purple-200 hover:text-white focus:outline-none transition duration-150 ease-in-out"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md ${isActive(item.path)} transition duration-150 ease-in-out transform hover:scale-105`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-purple-800">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-xl font-medium text-white">{corporateAccount?.company_name?.charAt(0) || 'C'}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{corporateAccount?.company_name || '기업명'}</p>
                <p className="text-xs text-purple-300 truncate">{corporateUser?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition duration-150 ease-in-out transform hover:scale-105"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className="flex h-screen">
        {/* 사이드바 */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gradient-to-b from-purple-900 to-purple-800 shadow-xl z-10">
          <div className="flex items-center h-16 px-6 bg-purple-800">
            <span className="text-xl font-bold text-white">CNEC Corp</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive(item.path)} transition duration-150 ease-in-out transform hover:scale-105`}
                >
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-purple-800">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                <span className="text-xl font-medium text-white">{corporateAccount?.company_name?.charAt(0) || 'C'}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{corporateAccount?.company_name || '기업명'}</p>
                <p className="text-xs text-purple-300 truncate">{corporateUser?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition duration-150 ease-in-out transform hover:scale-105"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* 상단 헤더 */}
          <header className="sticky top-0 z-10 bg-white shadow-sm lg:shadow h-16 lg:h-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 hidden lg:block">
                {menuItems.find(item => location.pathname.startsWith(item.path))?.label || '기업 관리 시스템'}
              </h1>
              <div className="ml-4 flex items-center lg:hidden">
                {/* 모바일에서는 빈 공간 */}
              </div>
            </div>
          </header>

          {/* 페이지 콘텐츠 */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>

          {/* 푸터 */}
          <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CNEC Japan. All rights reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CorporateLayout;
