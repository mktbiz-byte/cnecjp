import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCorporateAuth } from '../../contexts/CorporateAuthContext';

const CorporateOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { corporateUser, corporateAccount } = useCorporateAuth();
  
  const [order, setOrder] = useState(null);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!corporateUser || !corporateAccount) return;

      try {
        setLoading(true);
        setError(null);

        // 주문 정보 조회
        const { data: orderData, error: orderError } = await supabase
          .from('corporate_orders')
          .select(`
            *,
            corporate_accounts(company_name),
            guide_templates(title, description)
          `)
          .eq('id', orderId)
          .single();

        if (orderError) {
          throw orderError;
        }

        // 주문이 현재 기업 계정의 것인지 확인
        if (orderData.corporate_account_id !== corporateAccount.id) {
          throw new Error('이 주문에 접근할 권한이 없습니다.');
        }

        setOrder(orderData);

        // 배정된 크리에이터 정보 조회
        if (orderData.status !== 'pending' && orderData.status !== 'cancelled') {
          const { data: creatorData, error: creatorError } = await supabase
            .from('corporate_order_creators')
            .select(`
              *,
              user_profiles(name, profile_image_url)
            `)
            .eq('corporate_order_id', orderId);

          if (creatorError) {
            throw creatorError;
          }

          setCreators(creatorData || []);
        }
      } catch (error) {
        console.error('주문 상세 정보를 불러오는 중 오류가 발생했습니다:', error);
        setError(error.message || '주문 상세 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, corporateUser, corporateAccount]);

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'pending') {
      setError('대기 중인 주문만 취소할 수 있습니다.');
      return;
    }

    try {
      setCancelling(true);
      setError(null);

      const { error } = await supabase
        .from('corporate_orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
        .eq('corporate_account_id', corporateAccount.id)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }

      // 주문 정보 업데이트
      setOrder({ ...order, status: 'cancelled' });
      setCancelConfirm(false);
    } catch (error) {
      console.error('주문 취소 중 오류가 발생했습니다:', error);
      setError(error.message || '주문 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

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

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <p className="mt-2">
              <button
                onClick={() => navigate('/corporate/orders')}
                className="text-red-700 hover:text-red-900 font-medium"
              >
                주문 목록으로 돌아가기
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">주문을 찾을 수 없습니다.</p>
            <p className="mt-2">
              <button
                onClick={() => navigate('/corporate/orders')}
                className="text-yellow-700 hover:text-yellow-900 font-medium"
              >
                주문 목록으로 돌아가기
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">주문 상세</h2>
        <div className="flex space-x-2">
          <Link
            to="/corporate/orders"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            목록으로
          </Link>
          {order.status === 'pending' && (
            <button
              onClick={() => setCancelConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              주문 취소
            </button>
          )}
        </div>
      </div>

      {/* 주문 정보 */}
      <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {order.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              주문 ID: {order.id}
            </p>
          </div>
          <div>
            {getStatusBadge(order.status)}
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                가이드 템플릿
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.guide_templates?.title || '템플릿 없음'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                설명
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.description}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                예산
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.budget ? `${order.budget.toLocaleString()}원` : '-'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                크리에이터 수
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.target_creator_count}명
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                요구사항
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {order.requirements || '없음'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                마감일
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(order.deadline).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                생성일
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(order.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 배정된 크리에이터 목록 */}
      {(order.status === 'approved' || order.status === 'in_progress' || order.status === 'completed') && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              배정된 크리에이터
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              총 {creators.length}명의 크리에이터가 배정되었습니다.
            </p>
          </div>
          <div className="border-t border-gray-200">
            {creators.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-gray-500">
                아직 배정된 크리에이터가 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {creators.map((creator) => (
                  <li key={creator.id} className="px-4 py-4 flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {creator.user_profiles?.profile_image_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={creator.user_profiles.profile_image_url}
                          alt={creator.user_profiles?.name || '크리에이터'}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {creator.user_profiles?.name || '이름 없음'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {creator.status === 'completed' ? '완료됨' : '진행 중'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 취소 확인 모달 */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">주문 취소 확인</h3>
            <p className="text-sm text-gray-500 mb-4">
              정말로 이 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCancelConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={cancelling}
              >
                아니오
              </button>
              <button
                onClick={handleCancelOrder}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                disabled={cancelling}
              >
                {cancelling ? '취소 중...' : '예, 취소합니다'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateOrderDetail;
