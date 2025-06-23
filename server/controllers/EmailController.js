const nodemailer = require('nodemailer');

class EmailController {
  static async sendEmail(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: "g99buildbot_zoho",
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: "raees@raeescodes.xyz",
      to: "raees.nazeem@growth99.com",
      subject: "Project Briefing Results",
      text: prompt,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
}

module.exports = EmailController;
