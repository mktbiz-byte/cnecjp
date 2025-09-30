const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight 성공' })
    };
  }

  // POST 요청만 처리
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '허용되지 않는 메서드' })
    };
  }

  try {
    const { to, subject, text, html, template, templateData } = JSON.parse(event.body);

    // 필수 필드 검증
    if (!to || (!text && !html && !template)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '필수 필드가 누락되었습니다. (to, text/html/template)' })
      };
    }

    // 이메일 전송자 설정
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

    if (!EMAIL_USER || !EMAIL_PASS) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: '이메일 설정이 완료되지 않았습니다.' })
      };
    }

    // 트랜스포터 생성
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // 이메일 내용 설정
    let mailOptions = {
      from: `"CNEC" <${EMAIL_USER}>`,
      to: to,
      subject: subject || 'CNEC 알림',
    };

    // 템플릿 처리
    if (template) {
      const emailContent = processTemplate(template, templateData);
      mailOptions.html = emailContent;
    } else {
      if (text) mailOptions.text = text;
      if (html) mailOptions.html = html;
    }

    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: '이메일이 성공적으로 전송되었습니다.',
        messageId: info.messageId
      })
    };
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || '이메일 전송 중 오류가 발생했습니다.' })
    };
  }
};

// 이메일 템플릿 처리 함수
function processTemplate(templateName, data) {
  // 기본 템플릿
  const templates = {
    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #333;">환영합니다, {{name}}님!</h1>
        <p>CNEC에 가입해 주셔서 감사합니다.</p>
        <p>귀하의 계정이 성공적으로 생성되었습니다.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="{{loginUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">로그인하기</a>
        </div>
        <p>문의사항이 있으시면 언제든지 연락주세요.</p>
        <p>감사합니다,<br>CNEC 팀</p>
      </div>
    `,
    
    applicationConfirmation: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #333;">신청이 접수되었습니다</h1>
        <p>안녕하세요, {{name}}님!</p>
        <p>귀하의 캠페인 신청이 성공적으로 접수되었습니다.</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>캠페인:</strong> {{campaignTitle}}</p>
          <p><strong>신청 날짜:</strong> {{applicationDate}}</p>
          <p><strong>상태:</strong> 검토 중</p>
        </div>
        <p>신청 상태는 마이페이지에서 확인하실 수 있습니다.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="{{mypageUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">마이페이지</a>
        </div>
        <p>감사합니다,<br>CNEC 팀</p>
      </div>
    `,
    
    applicationApproved: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #333;">신청이 승인되었습니다</h1>
        <p>안녕하세요, {{name}}님!</p>
        <p>귀하의 캠페인 신청이 <strong style="color: #4CAF50;">승인</strong>되었습니다.</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>캠페인:</strong> {{campaignTitle}}</p>
          <p><strong>승인 날짜:</strong> {{approvalDate}}</p>
          <p><strong>상태:</strong> 승인됨</p>
        </div>
        <p>다음 단계 및 자세한 정보는 마이페이지에서 확인하실 수 있습니다.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="{{mypageUrl}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">마이페이지</a>
        </div>
        <p>감사합니다,<br>CNEC 팀</p>
      </div>
    `,
    
    applicationRejected: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #333;">신청 결과 안내</h1>
        <p>안녕하세요, {{name}}님!</p>
        <p>귀하의 캠페인 신청이 <strong style="color: #f44336;">거절</strong>되었습니다.</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>캠페인:</strong> {{campaignTitle}}</p>
          <p><strong>결정 날짜:</strong> {{rejectionDate}}</p>
          <p><strong>상태:</strong> 거절됨</p>
          <p><strong>사유:</strong> {{rejectionReason}}</p>
        </div>
        <p>다른 캠페인에 지원해 주시기 바랍니다.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="{{campaignsUrl}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">다른 캠페인 보기</a>
        </div>
        <p>감사합니다,<br>CNEC 팀</p>
      </div>
    `,
    
    custom: data.customHtml || '<p>이메일 내용이 제공되지 않았습니다.</p>'
  };
  
  // 템플릿 선택
  let template = templates[templateName] || templates.custom;
  
  // 데이터 치환
  if (data) {
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key]);
    });
  }
  
  return template;
}
