const nodemailer = require('nodemailer');

async function sendEmail(abnormalObservations) {
  // Configure transport with hardcoded Ethereal credentials
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'lew.johns62@ethereal.email',
      pass: 'WDSBFTSR9bM68Khjdg'
    }
  });

  // Format the email body
  const body = abnormalObservations.map(obs => {
    const patientRef = obs.subject?.reference ?? 'Unknown Patient';
    const testName = obs.code?.text ?? 'Unknown Test';
    const value = obs.valueQuantity?.value ?? 'N/A';
    const unit = obs.valueQuantity?.unit ?? '';
    return `Patient: ${patientRef}\nTest: ${testName}\nValue: ${value} ${unit}\n---`;
  }).join('\n');

  // Send the email
  try {
    const info = await transporter.sendMail({
      from: '"Lab Monitor" <labmonitor@yourapp.com>',
      to: 'labalerts@hospital.com',
      subject: '🚨 Abnormal Lab Observations Detected',
      text: body
    });

    console.log('📧 Email sent:', info.messageId);
    console.log('📨 Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

module.exports = sendEmail;
