const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `"Admin 👨‍💻" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email terkirim:", info.messageId);
};

module.exports = sendEmail;
