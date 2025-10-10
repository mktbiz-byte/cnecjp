const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 요청 데이터 파싱
    const { emailSettings, testEmail, subject, message } = JSON.parse(event.body);

    // 필수 데이터 검증
    if (!emailSettings || !emailSettings.smtpHost || !emailSettings.smtpUser || !emailSettings.smtpPass) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'SMTP 설정이 누락되었습니다.',
          details: 'smtpHost, smtpUser, smtpPass가 필요합니다.'
        }),
      };
    }

    if (!testEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '수신자 이메일이 필요합니다.' }),
      };
    }

    console.log('Gmail SMTP 발송 시작:', {
      host: emailSettings.smtpHost,
      port: emailSettings.smtpPort || 587,
      user: emailSettings.smtpUser,
      to: testEmail
    });

    // Gmail SMTP 설정
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtpHost,
      port: parseInt(emailSettings.smtpPort) || 587,
      secure: emailSettings.smtpPort === '465', // 465는 SSL, 587은 TLS
      auth: {
        user: emailSettings.smtpUser,
        pass: emailSettings.smtpPass,
      },
      tls: {
        rejectUnauthorized: false // Gmail의 경우 필요할 수 있음
      }
    });

    // 연결 테스트
    await transporter.verify();
    console.log('Gmail SMTP 연결 성공');

    // 이메일 옵션 설정
    const mailOptions = {
      from: `${emailSettings.senderName || 'CNEC Japan'} <${emailSettings.senderEmail || emailSettings.smtpUser}>`,
      to: testEmail,
      replyTo: emailSettings.replyEmail || emailSettings.smtpUser,
      subject: subject || 'CNEC Japan - Gmail 테스트 이메일',
      html: message || `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">📧 CNEC Japan</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Gmail SMTP 테스트 이메일</p>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">✅ 이메일 발송 성공!</h2>
              <p style="color: #374151; margin: 0; line-height: 1.6;">
                CNEC Japan의 Gmail SMTP 이메일 시스템이 정상적으로 작동하고 있습니다.
              </p>
            </div>

            <div style="border-left: 4px solid #10b981; padding-left: 20px; margin-bottom: 20px;">
              <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 16px;">📋 발송 정보</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>발송 시간:</strong> ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Tokyo' })}</li>
                <li><strong>발송자:</strong> ${emailSettings.senderName || 'CNEC Japan'}</li>
                <li><strong>SMTP 서버:</strong> ${emailSettings.smtpHost}:${emailSettings.smtpPort || 587}</li>
                <li><strong>보안:</strong> ${emailSettings.smtpPort === '465' ? 'SSL' : 'TLS'}</li>
              </ul>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                이 이메일은 CNEC Japan 시스템에서 자동으로 발송되었습니다.<br>
                문의사항이 있으시면 ${emailSettings.replyEmail || 'support@cnec.jp'}로 연락해 주세요.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // 이메일 발송
    console.log('이메일 발송 시도 중...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Gmail 발송 성공:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: '이메일이 Gmail을 통해 성공적으로 발송되었습니다.',
        details: {
          from: mailOptions.from,
          to: testEmail,
          subject: mailOptions.subject,
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected
        }
      }),
    };

  } catch (error) {
    console.error('Gmail 발송 오류:', error);
    
    // 상세한 오류 정보 제공
    let errorMessage = '이메일 발송 중 오류가 발생했습니다.';
    let errorDetails = error.message;

    if (error.code === 'EAUTH') {
      errorMessage = 'Gmail 인증 실패';
      errorDetails = 'Gmail 사용자명 또는 앱 비밀번호가 잘못되었습니다. Gmail 앱 비밀번호를 확인해주세요.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'SMTP 서버 연결 실패';
      errorDetails = 'Gmail SMTP 서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Gmail 인증 오류';
      errorDetails = '2단계 인증이 활성화되어 있는지, 앱 비밀번호가 올바른지 확인해주세요.';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        code: error.code,
        responseCode: error.responseCode
      }),
    };
  }
};
