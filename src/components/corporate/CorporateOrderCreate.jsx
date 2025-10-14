import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCorporateAuth } from '../../contexts/CorporateAuthContext';

const CorporateOrderCreate = () => {
  const navigate = useNavigate();
  const { corporateUser, corporateAccount } = useCorporateAuth();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    guideTemplateId: '',
    title: '',
    description: '',
    budget: '',
    targetCreatorCount: 1,
    requirements: '',
    deadline: ''
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('guide_templates')
          .select('*')
          .eq('is_active', true)
          .order('title');

        if (error) {
          throw error;
        }

        setTemplates(data || []);
      } catch (error) {
        console.error('가이드 템플릿을 불러오는 중 오류가 발생했습니다:', error);
        setError('가이드 템플릿을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!corporateAccount) {
      setError('기업 계정 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 폼 데이터 유효성 검사
      if (!formData.guideTemplateId) {
        throw new Error('가이드 템플릿을 선택해주세요.');
      }

      if (!formData.title.trim()) {
        throw new Error('주문 제목을 입력해주세요.');
      }

      if (!formData.description.trim()) {
        throw new Error('주문 설명을 입력해주세요.');
      }

      const budget = parseFloat(formData.budget);
      if (isNaN(budget) || budget <= 0) {
        throw new Error('유효한 예산을 입력해주세요.');
      }

      const targetCreatorCount = parseInt(formData.targetCreatorCount);
      if (isNaN(targetCreatorCount) || targetCreatorCount <= 0) {
        throw new Error('유효한 크리에이터 수를 입력해주세요.');
      }

      if (!formData.deadline) {
        throw new Error('마감일을 선택해주세요.');
      }

      // 주문 생성
      const { data, error } = await supabase
        .from('corporate_orders')
        .insert({
          corporate_account_id: corporateAccount.id,
          guide_template_id: formData.guideTemplateId,
          title: formData.title,
          description: formData.description,
          budget: budget,
          target_creator_count: targetCreatorCount,
          requirements: formData.requirements,
          deadline: formData.deadline,
          status: 'pending' // 기본 상태는 '대기 중'
        })
        .select();

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      // 3초 후 주문 목록 페이지로 리디렉션
      setTimeout(() => {
        navigate('/corporate/orders');
      }, 3000);
      
    } catch (error) {
      console.error('주문 생성 중 오류가 발생했습니다:', error);
      setError(error.message || '주문 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
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
      <h2 className="text-2xl font-bold mb-6">새 주문 생성</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">주문이 성공적으로 생성되었습니다. 주문 목록 페이지로 이동합니다.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guideTemplateId">
            가이드 템플릿 *
          </label>
          <select
            id="guideTemplateId"
            name="guideTemplateId"
            value={formData.guideTemplateId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">템플릿 선택</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            주문 제목 *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="주문 제목을 입력하세요"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            주문 설명 *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="주문에 대한 상세 설명을 입력하세요"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="budget">
            예산 (원) *
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="예산을 입력하세요"
            min="0"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="targetCreatorCount">
            크리에이터 수 *
          </label>
          <input
            id="targetCreatorCount"
            name="targetCreatorCount"
            type="number"
            value={formData.targetCreatorCount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="필요한 크리에이터 수를 입력하세요"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements">
            요구사항
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="크리에이터에게 전달할 특별한 요구사항이 있다면 입력하세요"
            rows="3"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
            마감일 *
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/corporate/orders')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting || success}
            className={`${
              submitting || success
                ? 'bg-indigo-400'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {submitting ? '처리 중...' : '주문 생성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CorporateOrderCreate;
