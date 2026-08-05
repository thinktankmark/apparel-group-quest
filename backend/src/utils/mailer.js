const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER || 'sarwatzahra546@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'kockitzojfpiragv';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

/**
 * Send 6-Digit Email OTP with Apparel Group Branded HTML Template
 */
async function sendOtpEmail(toEmail, otpCode) {
  console.log(`🔑 [LIVE OTP LOG] Verification code for ${toEmail} is: ${otpCode}`);

  const htmlContent = `
    <div style="background-color: #0B193C; padding: 32px 16px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #FFFFFF; text-align: center;">
      <div style="max-width: 480px; margin: 0 auto; background: #152B5B; border: 1.5px solid #FEC949; border-radius: 20px; padding: 32px 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
        
        <h1 style="color: #FEC949; font-size: 22px; margin-bottom: 4px; font-weight: 800;">
          مجموعة أباريل • APPAREL GROUP
        </h1>
        <p style="color: #9BB1DB; font-size: 13px; margin-bottom: 24px; font-weight: 600;">
          رمز التحقق لرحلة البحث عن الكنز / Scavenger Hunt Verification Code
        </p>

        <p style="font-size: 14px; color: #FFFFFF; margin-bottom: 16px;">
          استخدم رمز التحقق المكون من 6 أرقام لإكمال العملية:<br />
          <span style="font-size: 12px; color: #D0DCF2;">Use the 6-digit code below to complete verification:</span>
        </p>

        <div style="background: #041B4E; border: 2px dashed #FEC949; border-radius: 14px; padding: 18px; margin: 20px 0; display: inline-block; width: 85%;">
          <span style="font-size: 34px; font-weight: 900; color: #FEC949; letter-spacing: 8px;">
            ${otpCode}
          </span>
        </div>

        <p style="font-size: 11.5px; color: #9BB1DB; margin-top: 16px;">
          تنتهي صلاحية هذا الرمز خلال 5 دقائق.<br />This code will expire in 5 minutes.
        </p>
      </div>
      <p style="font-size: 11px; color: #9BB1DB; margin-top: 20px;">
        © 2026 Apparel Group Scavenger Hunt. All rights reserved.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Apparel Group Scavenger Hunt" <${GMAIL_USER}>`,
    to: toEmail,
    subject: `🔐 ${otpCode} is your Apparel Group Verification Code`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('⚡ Gmail SMTP Email Sent Successfully:', info.response);
    return info;
  } catch (err) {
    console.error('⚠️ Gmail SMTP Error:', err.message);
    throw err;
  }
}

module.exports = {
  sendOtpEmail
};
