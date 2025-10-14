import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCorporateAuth } from '../../contexts/CorporateAuthContext';

const CorporateDashboard = () => {
  const { corporateUser, corporateAccount } = useCorporateAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalCreators: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!corporateUser || !corporateAccount) return;

      try {
        setLoading(true);

        // 주문 통계 조회
        const { data: orders, error: ordersError } = await supabase
          .from('corporate_orders')
          .select('id, status')
          .eq('corporate_account_id', corporateAccount.id);

        if (ordersError) throw ordersError;

        // 최근 주문 조회
        const { data: recent, error: recentError } = await supabase
          .from('corporate_orders')
          .select(`
            id, 
            title, 
            status, 
            created_at, 
            budget,
            guide_templates(title)
          `)
          .eq('corporate_account_id', corporateAccount.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // 배정된 크리에이터 수 조회
        const { data: creators, error: creatorsError } = await supabase
          .from('corporate_order_creators')
          .select('id')
          .in('corporate_order_id', orders?.map(order => order.id) || []);

        if (creatorsError) throw creatorsError;

        // 통계 계산
        const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
        const activeOrders = orders?.filter(order => ['approved', 'in_progress'].includes(order.status)).length || 0;
        const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;

        setStats({
          totalOrders: orders?.length || 0,
          pendingOrders,
          activeOrders,
          completedOrders,
          totalCreators: creators?.length || 0
        });

        setRecentOrders(recent || []);
      } catch (error) {
        console.error('대시보드 데이터를 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [corporateUser, corporateAccount]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '대기 중', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '승인됨', color: 'bg-green-100 text-green-800' },
      in_progress: { text: '진행 중', color: 'bg-blue-100 text-blue-800' },
      completed: { text: '완료됨', color: 'bg-purple-100 text-purple-800' },
      rejected: { text: '거부됨', color: 'bg-red-100 text-red-800' },
      cancelled: { text: '취소됨', color: 'bg-gray-100 text-gray-800' }
    };

    const statusInfo = statusMap[status] || { text: '알 수 없음', color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요, {corporateAccount?.company_name || '기업'} 님!</h1>
        <p className="text-gray-600">기업 관리 대시보드에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 mr-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">총 주문</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">대기 중인 주문</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">진행 중인 주문</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">완료된 주문</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 주문 및 빠른 액션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 주문 */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">최근 주문</h2>
              <Link to="/corporate/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                모든 주문 보기
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">아직 주문 내역이 없습니다.</p>
                  <div className="mt-4">
                    <Link
                      to="/corporate/orders/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      첫 주문 생성하기
                    </Link>
                  </div>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link to={`/corporate/orders/${order.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate">
                          {order.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.guide_templates?.title || '템플릿 없음'} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.budget ? `${order.budget.toLocaleString()}원` : '-'}
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">빠른 액션</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/corporate/orders/create"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                새 주문 생성
              </Link>
              <Link
                to="/corporate/orders"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                주문 관리
              </Link>
              <Link
                to="/corporate/creators"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                크리에이터 목록
              </Link>
            </div>
          </div>

          {/* 기업 정보 카드 */}
          <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">기업 정보</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-indigo-600">{corporateAccount?.company_name?.charAt(0) || 'C'}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{corporateAccount?.company_name || '기업명'}</h3>
                  <p className="text-sm text-gray-500">{corporateUser?.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">사업자 등록번호</dt>
                    <dd className="text-sm text-gray-900">{corporateAccount?.business_registration_number || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">대표자명</dt>
                    <dd className="text-sm text-gray-900">{corporateAccount?.representative_name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">연락처</dt>
                    <dd className="text-sm text-gray-900">{corporateAccount?.phone_number || '-'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;
