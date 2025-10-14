import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useCorporateAuth } from '../../contexts/CorporateAuthContext';

const CorporateLayout = () => {
  const { corporateUser, loading, signOut } = useCorporateAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!corporateUser) {
    return <Navigate to="/corporate/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          CNEC Corp
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/corporate/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700">대시보드</Link>
          <Link to="/corporate/orders" className="block px-4 py-2 rounded hover:bg-gray-700">주문 관리</Link>
          <Link to="/corporate/creators" className="block px-4 py-2 rounded hover:bg-gray-700">크리에이터 목록</Link>
          <Link to="/corporate/guides" className="block px-4 py-2 rounded hover:bg-gray-700">가이드 관리</Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={signOut} 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-semibold">기업 관리 시스템</h1>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CorporateLayout;
