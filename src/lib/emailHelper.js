/**
 * 이메일 전송을 위한 헬퍼 함수
 */

/**
 * 이메일 전송 함수
 * @param {Object} options - 이메일 옵션
 * @param {string} options.to - 수신자 이메일 주소
 * @param {string} options.subject - 이메일 제목
 * @param {string} options.text - 일반 텍스트 내용 (HTML이 없을 경우 사용)
 * @param {string} options.html - HTML 내용
 * @param {string} options.template - 사용할 템플릿 이름 (welcome, applicationConfirmation, applicationApproved, applicationRejected, custom)
 * @param {Object} options.templateData - 템플릿에 사용될 데이터
 * @returns {Promise<Object>} - 이메일 전송 결과
 */
export const sendEmail = async (options) => {
  try {
    const { to, subject, text, html, template, templateData } = options;
    
    // 필수 필드 검증
    if (!to) {
      throw new Error('수신자 이메일 주소는 필수입니다.');
    }
    
    if (!text && !html && !template) {
      throw new Error('이메일 내용(text, html) 또는 템플릿이 필요합니다.');
    }
    
    // Netlify Function 호출
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html,
        template,
        templateData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이메일 전송에 실패했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    throw error;
  }
};

/**
 * 환영 이메일 전송
 * @param {string} to - 수신자 이메일 주소
 * @param {string} name - 수신자 이름
 * @param {string} loginUrl - 로그인 URL
 * @returns {Promise<Object>} - 이메일 전송 결과
 */
export const sendWelcomeEmail = async (to, name, loginUrl = 'https://cnec.jp/login') => {
  return sendEmail({
    to,
    subject: 'CNEC에 오신 것을 환영합니다',
    template: 'welcome',
    templateData: {
      name,
      loginUrl
    }
  });
};

/**
 * 신청 접수 확인 이메일 전송
 * @param {string} to - 수신자 이메일 주소
 * @param {string} name - 수신자 이름
 * @param {string} campaignTitle - 캠페인 제목
 * @param {string} applicationDate - 신청 날짜
 * @param {string} mypageUrl - 마이페이지 URL
 * @returns {Promise<Object>} - 이메일 전송 결과
 */
export const sendApplicationConfirmationEmail = async (to, name, campaignTitle, applicationDate, mypageUrl = 'https://cnec.jp/mypage') => {
  return sendEmail({
    to,
    subject: `[CNEC] ${campaignTitle} 캠페인 신청이 접수되었습니다`,
    template: 'applicationConfirmation',
    templateData: {
      name,
      campaignTitle,
      applicationDate,
      mypageUrl
    }
  });
};

/**
 * 신청 승인 이메일 전송
 * @param {string} to - 수신자 이메일 주소
 * @param {string} name - 수신자 이름
 * @param {string} campaignTitle - 캠페인 제목
 * @param {string} approvalDate - 승인 날짜
 * @param {string} mypageUrl - 마이페이지 URL
 * @returns {Promise<Object>} - 이메일 전송 결과
 */
export const sendApplicationApprovedEmail = async (to, name, campaignTitle, approvalDate, mypageUrl = 'https://cnec.jp/mypage') => {
  return sendEmail({
    to,
    subject: `[CNEC] ${campaignTitle} 캠페인 신청이 승인되었습니다`,
    template: 'applicationApproved',
    templateData: {
      name,
      campaignTitle,
      approvalDate,
      mypageUrl
    }
  });
};

/**
 * 신청 거절 이메일 전송
 * @param {string} to - 수신자 이메일 주소
 * @param {string} name - 수신자 이름
 * @param {string} campaignTitle - 캠페인 제목
 * @param {string} rejectionDate - 거절 날짜
 * @param {string} rejectionReason - 거절 사유
 * @param {string} campaignsUrl - 캠페인 목록 URL
 * @returns {Promise<Object>} - 이메일 전송 결과
 */
export const sendApplicationRejectedEmail = async (to, name, campaignTitle, rejectionDate, rejectionReason, campaignsUrl = 'https://cnec.jp') => {
  return sendEmail({
    to,
    subject: `[CNEC] ${campaignTitle} 캠페인 신청 결과 안내`,
    template: 'applicationRejected',
    templateData: {
      name,
      campaignTitle,
      rejectionDate,
      rejectionReason,
      campaignsUrl
    }
  });
};

/**
 * 사용자 정의 이메일 전송
 * @param {string} to - 수신자 이메일 주소
 * @param {string} subject - 이메일 제목
 * @param {string} customHtml - 사용자 정의 HTML 내용
 * @returns {Promise<Object>} - 이메일 전송 결과
 */
export const sendCustomEmail = async (to, subject, customHtml) => {
  return sendEmail({
    to,
    subject,
    template: 'custom',
    templateData: {
      customHtml
    }
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendApplicationConfirmationEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendCustomEmail
};
