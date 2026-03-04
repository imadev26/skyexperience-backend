import nodemailer from 'nodemailer'

export const sendContactMessage = async (req, res) => {
  const { firstName, lastName, email, phone, message, subject } = req.body

  if (!firstName || !email || !message) {
    return res.status(400).json({ message: 'firstName, email and message are required.' })
  }

  // Check if email credentials are configured
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Saving contact but not sending email.')
    console.log('📩 Contact received:', { firstName, lastName, email, phone, subject, message })
    
    return res.status(200).json({ 
      message: 'Contact message received successfully (email notification disabled)',
      warning: 'Email service not configured'
    })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    })

    const emailSubject = subject
      ? `🎈 [${subject}] — Message from ${firstName} ${lastName || ''}`
      : `🎈 New Contact Message from ${firstName} ${lastName || ''}`

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
          .header { background: linear-gradient(135deg, #ff8c42 0%, #ff6b1a 50%, #e55a1b 100%); padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 26px; font-weight: bold; margin-bottom: 8px; }
          .header p { color: rgba(255,255,255,0.9); font-size: 15px; }
          .divider { height: 3px; background: linear-gradient(90deg, #ff8c42, #e55a1b); }
          .content { padding: 36px 30px; }
          .info-box { background: linear-gradient(135deg, #fff8f0, #fef4e7); border-left: 5px solid #ff8c42; padding: 22px; border-radius: 8px; margin-bottom: 24px; }
          .info-row { display: flex; margin-bottom: 12px; align-items: flex-start; }
          .info-row:last-child { margin-bottom: 0; }
          .label { font-weight: bold; color: #2d2d2d; min-width: 110px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { color: #444; font-size: 15px; flex: 1; }
          .value a { color: #ff8c42; }
          .msg-box { background: #f8f9fa; border-radius: 10px; padding: 22px; border: 2px solid #e9ecef; }
          .msg-title { color: #2d2d2d; font-size: 16px; font-weight: bold; margin-bottom: 12px; }
          .msg-text { color: #555; line-height: 1.8; font-size: 15px; background: #fff; padding: 16px; border-radius: 8px; border-left: 4px solid #ff8c42; white-space: pre-wrap; }
          .footer { background: #2d2d2d; color: #fff; text-align: center; padding: 20px; font-size: 13px; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎈 New Contact Message</h1>
            <p>Someone has reached out through your website</p>
          </div>
          <div class="divider"></div>
          <div class="content">
            <div class="info-box">
              <div class="info-row">
                <span class="label">👤 Name:</span>
                <span class="value">${firstName} ${lastName || ''}</span>
              </div>
              <div class="info-row">
                <span class="label">📧 Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
              </div>
              ${phone ? `<div class="info-row"><span class="label">📱 Phone:</span><span class="value">${phone}</span></div>` : ''}
              ${subject ? `<div class="info-row"><span class="label">📌 Subject:</span><span class="value">${subject}</span></div>` : ''}
              <div class="info-row">
                <span class="label">🕐 Received:</span>
                <span class="value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            <div class="msg-box">
              <div class="msg-title">💬 Message</div>
              <div class="msg-text">${message}</div>
            </div>
          </div>
          <div class="footer">
            <strong>Sky Experience</strong> — Website Contact Form
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"Sky Experience" <${process.env.MAIL_USER}>`,
      replyTo: email,
      to: process.env.MAIL_USER,
      subject: emailSubject,
      text: `Name: ${firstName} ${lastName || ''}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
      html: htmlTemplate
    })

    res.status(200).json({ message: 'Email sent successfully' })

  } catch (error) {
    console.error('Failed to send email:', error)
    res.status(500).json({ message: 'Failed to send email', error: error.message })
  }
}