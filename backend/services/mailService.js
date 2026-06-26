const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  auth: mailConfig.auth,
});

// Verify mail configuration connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Mail Service Error: Could not connect to SMTP server.', error.message);
  } else {
    console.log('Mail Service is ready to send emails.');
  }
});

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
const sendMail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: mailConfig.from,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error('Nodemailer sendMail failed:', error.message);
    throw new Error('فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.');
  }
};

/**
 * Send a vaccination reminder email
 * @param {string} email - Parent email
 * @param {string} parentName - Parent name
 * @param {string} childName - Child name
 * @param {string} vaccineName - Vaccine name
 * @param {string} scheduledDate - Scheduled date
 */
const sendVaccinationReminderEmail = async (email, parentName, childName, vaccineName, scheduledDate) => {
  const subject = 'تذكير موعد تطعيم طفلك - تفلي';
  const html = `
    <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #BAC8B1; border-radius: 16px; padding: 24px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">👶</span>
        <h2 style="color: #404E3B; margin-top: 10px;">نظام تذكير التطعيمات - تفلي</h2>
      </div>
      <p style="font-size: 16px; color: #404E3B; line-height: 1.6;">مرحباً <strong>${parentName}</strong>،</p>
      <p style="font-size: 15px; color: #6C8480; line-height: 1.6;">
        هذا تذكير ودّي بأن طفلك <strong>${childName}</strong> لديه موعد تطعيم مجدول قريباً:
      </p>
      <div style="background-color: #F4F7F2; border-right: 4px solid #7B9669; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 5px 0; font-size: 15px; color: #404E3B;">💉 <strong>اسم التطعيم:</strong> ${vaccineName}</p>
        <p style="margin: 5px 0; font-size: 15px; color: #404E3B;">📅 <strong>تاريخ الموعد:</strong> ${scheduledDate}</p>
      </div>
      <p style="font-size: 14px; color: #6C8480; line-height: 1.6;">
        يرجى التأكد من زيارة أقرب مركز صحي أو عيادة أطفال لتلقي اللقاح في موعده المحدد لسلامة طفلك وحمايته.
      </p>
      <hr style="border: 0; border-top: 1px solid #BAC8B1; margin: 30px 0;">
      <p style="font-size: 12px; color: #BAC8B1; text-align: center;">
        شريككم في رعاية صحة أطفالكم · برنامج تفلي الوطني للتطعيمات
      </p>
    </div>
  `;

  return sendMail(email, subject, html);
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetUrl - URL to reset password
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const subject = 'طلب إعادة تعيين كلمة المرور - تفلي';
  const html = `
    <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #BAC8B1; border-radius: 16px; padding: 24px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🔑</span>
        <h2 style="color: #404E3B; margin-top: 10px;">إعادة تعيين كلمة المرور</h2>
      </div>
      <p style="font-size: 16px; color: #404E3B; line-height: 1.6;">مرحباً <strong>${name}</strong>،</p>
      <p style="font-size: 15px; color: #6C8480; line-height: 1.6;">
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في تطبيق تفلي. للقيام بذلك، يرجى النقر على الزر أدناه:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #7B9669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      <p style="font-size: 13px; color: #6C8480; line-height: 1.6;">
        إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان. ستظل كلمة مرورك الحالية دون تغيير.
      </p>
      <p style="font-size: 12px; color: #BAC8B1; word-break: break-all; margin-top: 20px;">
        أو انسخ هذا الرابط والصقه في متصفحك: <br> ${resetUrl}
      </p>
      <hr style="border: 0; border-top: 1px solid #BAC8B1; margin: 30px 0;">
      <p style="font-size: 12px; color: #BAC8B1; text-align: center;">
        برنامج تفلي الوطني لتتبع تطعيمات الأطفال
      </p>
    </div>
  `;

  return sendMail(email, subject, html);
};

module.exports = {
  sendVaccinationReminderEmail,
  sendPasswordResetEmail,
};
