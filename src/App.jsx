import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';

// 모든 페이지 컴포넌트 import
import HomePageExactReplica from './components/HomePageExactReplica';
// ... (다른 모든 컴포넌트 import)

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <MainContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

const MainContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Routes>
        {/* 모든 라우트 설정 */}
        <Route path="/" element={<HomePageExactReplica />} />
        {/* ... (다른 모든 라우트) */}
      </Routes>
    </div>
  );
};

export default App;
