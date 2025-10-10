const { handler } = require('./netlify/functions/send-gmail.js');

// 테스트용 Gmail 설정 (실제 값으로 교체 필요)
const testEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    emailSettings: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: 'test@gmail.com', // 실제 Gmail 주소로 교체
      smtpPass: 'test-app-password', // 실제 앱 비밀번호로 교체
      senderName: 'CNEC Japan Test',
      senderEmail: 'test@gmail.com',
      replyEmail: 'test@gmail.com'
    },
    testEmail: 'recipient@example.com', // 실제 수신자 이메일로 교체
    subject: 'CNEC Japan - Gmail SMTP 테스트',
    message: '<h1>테스트 이메일</h1><p>Gmail SMTP 기능이 정상적으로 작동합니다.</p>'
  })
};

const testContext = {};

async function testGmailFunction() {
  console.log('🧪 Gmail SMTP 함수 테스트 시작...');
  console.log('📧 테스트 설정:', {
    method: testEvent.httpMethod,
    hasBody: !!testEvent.body
  });

  try {
    const result = await handler(testEvent, testContext);
    
    console.log('\n✅ 함수 실행 결과:');
    console.log('Status Code:', result.statusCode);
    console.log('Headers:', result.headers);
    
    const responseBody = JSON.parse(result.body);
    console.log('Response Body:', responseBody);
    
    if (result.statusCode === 200 && responseBody.success) {
      console.log('\n🎉 Gmail SMTP 테스트 성공!');
      console.log('Message ID:', responseBody.messageId);
    } else {
      console.log('\n❌ Gmail SMTP 테스트 실패');
      console.log('Error:', responseBody.error);
      console.log('Details:', responseBody.details);
    }
    
  } catch (error) {
    console.error('\n💥 함수 실행 중 오류 발생:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// 테스트 실행
testGmailFunction();
