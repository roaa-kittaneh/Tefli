require('dotenv').config();

module.exports = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  from: `"نظام تطعيمات الأطفال - تفلي" <${process.env.EMAIL_USER}>`,
};
