import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminHeader from './AdminHeader';
import AdminNavigation from './AdminNavigation';

const AdminConfirmedCreators = () => {
  const [applications, setApplications] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 캠페인 목록 로드
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // 확정된 신청서 로드
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns!inner(id, title),
          user_profiles(name, email, phone, instagram_url, age, skin_type)
        `)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingNumber = async (applicationId, trackingNumber) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ tracking_number: trackingNumber })
        .eq('id', applicationId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, tracking_number: trackingNumber }
          : app
      ));

      alert('송장번호가 업데이트되었습니다.');
    } catch (error) {
      console.error('송장번호 업데이트 오류:', error);
      alert('송장번호 업데이트에 실패했습니다.');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesCampaign = !selectedCampaign || app.campaign_id === selectedCampaign;
    const matchesSearch = !searchTerm || 
      (app.user_profiles?.name || app.applicant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.user_profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === 'shipped' && app.tracking_number) ||
      (statusFilter === 'pending' && !app.tracking_number);
    
    return matchesCampaign && matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminNavigation />
          <div className="flex-1 p-8">
            <div className="text-center">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminNavigation />
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">확정 크리에이터 관리</h1>
            <p className="text-gray-600">확정된 크리에이터들의 배송 정보를 관리합니다.</p>
          </div>

          {/* 필터 및 검색 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">캠페인 필터</label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">모든 캠페인</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태 필터</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">모든 상태</option>
                  <option value="pending">배송 대기</option>
                  <option value="shipped">배송 완료</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                <input
                  type="text"
                  placeholder="이름 또는 이메일 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadData}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 확정 크리에이터</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredApplications.length}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">배송 완료</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredApplications.filter(app => app.tracking_number).length}명
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">배송 대기</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredApplications.filter(app => !app.tracking_number).length}명
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 크리에이터 목록 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">크리에이터 목록</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      크리에이터 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      캠페인
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      배송 주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      송장번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.user_profiles?.name || application.applicant_name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user_profiles?.email || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              📞 {application.user_profiles?.phone || application.phone || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.campaigns?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>📮 {application.postal_code || 'N/A'}</div>
                          <div className="mt-1 text-gray-600">
                            {application.address || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="송장번호 입력"
                            defaultValue={application.tracking_number || ''}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onBlur={(e) => {
                              if (e.target.value !== (application.tracking_number || '')) {
                                updateTrackingNumber(application.id, e.target.value);
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.tracking_number ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            배송 완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            배송 대기
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0l-4 4-4-4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">확정된 크리에이터가 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">필터 조건을 변경해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmedCreators;
