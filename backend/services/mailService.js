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
const sendMail = async (to, subject, html, text) => {
  try {
    const mailOptions = {
      from: mailConfig.from,
      to,
      subject,
      html,
      text,
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
  const subject = 'تذكير بموعد تطعيم طفلك قريباً';
  
  const text = `مرحباً ${parentName}،

هذا تذكير بأن طفلك

${childName}

لديه موعد تطعيم خلال يومين.

المطعوم:
${vaccineName}

تاريخ الموعد:
${scheduledDate}

يرجى عدم نسيان الموعد.

SmartCare Jordan`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; border: 1px solid #BAC8B1; border-radius: 12px; padding: 24px; background-color: #ffffff; direction: rtl; text-align: right;">
      <p>مرحباً ${parentName}،</p>
      <p>هذا تذكير بأن طفلك</p>
      <p><strong>${childName}</strong></p>
      <p>لديه موعد تطعيم خلال يومين.</p>
      <p><strong>المطعوم:</strong><br>${vaccineName}</p>
      <p><strong>تاريخ الموعد:</strong><br>${scheduledDate}</p>
      <p>يرجى عدم نسيان الموعد.</p>
      <p><strong>SmartCare Jordan</strong></p>
    </div>
  `;

  return sendMail(email, subject, html, text);
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetUrl - URL to reset password
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const subject = 'طلب إعادة تعيين كلمة المرور - طفلي';
  const html = `
    <div style="font-family: 'Cairo', sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #BAC8B1; border-radius: 16px; padding: 24px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🔑</span>
        <h2 style="color: #404E3B; margin-top: 10px;">إعادة تعيين كلمة المرور</h2>
      </div>
      <p style="font-size: 16px; color: #404E3B; line-height: 1.6;">مرحباً <strong>${name}</strong>،</p>
      <p style="font-size: 15px; color: #6C8480; line-height: 1.6;">
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في تطبيق طفلي. للقيام بذلك، يرجى النقر على الزر أدناه:
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
        برنامج طفلي الوطني لتتبع تطعيمات الأطفال
      </p>
    </div>
  `;

  return sendMail(email, subject, html);
};

module.exports = {
  sendVaccinationReminderEmail,
  sendPasswordResetEmail,
};
