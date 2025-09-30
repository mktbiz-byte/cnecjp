// EmailJS 더미 객체 - EM.init 오류 방지용
// 실제 EmailJS 기능이 필요하면 @emailjs/browser 패키지를 설치하고 이 파일을 교체하세요

// 전역 EM 객체 생성
window.EM = {
  init: function(publicKey) {
    console.log('EmailJS dummy init called with key:', publicKey);
    return Promise.resolve();
  },
  
  send: function(serviceId, templateId, templateParams) {
    console.log('EmailJS dummy send called:', { serviceId, templateId, templateParams });
    return Promise.resolve({ status: 200, text: 'OK' });
  },
  
  sendForm: function(serviceId, templateId, form) {
    console.log('EmailJS dummy sendForm called:', { serviceId, templateId, form });
    return Promise.resolve({ status: 200, text: 'OK' });
  }
};

// emailjs 객체도 생성 (다른 방식으로 사용될 수 있음)
window.emailjs = window.EM;

export default window.EM;
