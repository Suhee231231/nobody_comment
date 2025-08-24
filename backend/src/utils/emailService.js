const nodemailer = require('nodemailer');
const crypto = require('crypto');

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 인증 토큰 생성
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 인증 이메일 전송
const sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '[아무개의 명언] 이메일 인증을 완료해주세요',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">아무개의 명언</h1>
          <p style="color: #666; margin: 10px 0 0 0;">가장 보통의 존재들이 쓰는 하루 한마디</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">안녕하세요, ${username}님!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            아무개의 명언 회원가입을 완료하기 위해 이메일 인증을 진행해주세요.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              이메일 인증하기
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            위 버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:
          </p>
          <p style="color: #0ea5e9; font-size: 14px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            이 이메일은 아무개의 명언 회원가입 과정에서 발송되었습니다.<br>
            본인이 요청하지 않은 경우 무시하셔도 됩니다.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return false;
  }
};

// 비밀번호 재설정 이메일 전송
const sendPasswordResetEmail = async (email, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '[아무개의 명언] 비밀번호 재설정',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">아무개의 명언</h1>
          <p style="color: #666; margin: 10px 0 0 0;">가장 보통의 존재들이 쓰는 하루 한마디</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">안녕하세요, ${username}님!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              비밀번호 재설정하기
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            위 버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:
          </p>
          <p style="color: #0ea5e9; font-size: 14px; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            이 링크는 1시간 후에 만료됩니다.<br>
            본인이 요청하지 않은 경우 무시하시고, 계정 보안을 위해 비밀번호를 변경하시기 바랍니다.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail
};
