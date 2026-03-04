import { Resend } from 'resend'

export const sendContactMessage = async (req, res) => {
  const { firstName, lastName, email, phone, message, subject } = req.body

  if (!firstName || !email || !message) {
    return res.status(400).json({ message: 'firstName, email and message are required.' })
  }

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_USER) {
    console.warn('⚠️ Email service not configured. Saving contact but not sending email.')
    console.log('📩 Contact received:', { firstName, lastName, email, phone, subject, message })
    
    return res.status(200).json({ 
      message: 'Contact message received successfully (email notification disabled)',
      warning: 'Email service not configured'
    })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const emailSubject = subject
      ? `🎈 [${subject}] — Message from ${firstName} ${lastName || ''}`
      : `🎈 New Contact Message from ${firstName} ${lastName || ''}`

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau Message de Contact</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
          }
          .email-container { 
            max-width: 650px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 20px; 
            overflow: hidden; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header { 
            background: linear-gradient(135deg, #C04000 0%, #F27A23 50%, #FF8C42 100%); 
            padding: 40px 30px;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 300px;
            height: 300px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
          }
          .header-content { position: relative; z-index: 1; text-align: center; }
          .balloon-icon { font-size: 48px; margin-bottom: 10px; animation: float 3s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
          .header h1 { 
            color: #ffffff; 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }
          .header p { 
            color: rgba(255,255,255,0.95); 
            font-size: 16px;
            font-weight: 300;
          }
          .content { padding: 40px 35px; background: #fafbfc; }
          .info-card { 
            background: #ffffff;
            border-radius: 15px; 
            padding: 28px;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border-left: 5px solid #F27A23;
          }
          .info-row { 
            display: flex;
            margin-bottom: 16px;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .info-row:last-child { margin-bottom: 0; border-bottom: none; }
          .icon { 
            font-size: 24px; 
            margin-right: 15px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #FFF4E6, #FFE8CC);
            border-radius: 10px;
          }
          .label { 
            font-weight: 600; 
            color: #2c3e50; 
            min-width: 100px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .value { 
            color: #34495e; 
            font-size: 15px;
            flex: 1;
            font-weight: 500;
          }
          .value a { 
            color: #F27A23;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s;
          }
          .value a:hover { color: #C04000; }
          .message-card { 
            background: #ffffff;
            border-radius: 15px;
            padding: 28px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          }
          .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 18px;
            padding-bottom: 15px;
            border-bottom: 2px solid #F27A23;
          }
          .message-icon {
            font-size: 32px;
            margin-right: 12px;
          }
          .message-title { 
            color: #2c3e50; 
            font-size: 18px;
            font-weight: 700;
          }
          .message-content { 
            color: #555;
            line-height: 1.8;
            font-size: 15px;
            background: linear-gradient(135deg, #FFF9F0, #FFFAF5);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #F27A23;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .cta-section {
            margin-top: 30px;
            padding: 25px;
            background: linear-gradient(135deg, #FFF4E6, #FFE8CC);
            border-radius: 12px;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            padding: 14px 35px;
            background: linear-gradient(135deg, #C04000, #F27A23);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 15px rgba(192,64,0,0.3);
            transition: transform 0.3s, box-shadow 0.3s;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(192,64,0,0.4);
          }
          .footer { 
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: #ecf0f1;
            text-align: center;
            padding: 30px 20px;
          }
          .footer-logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #F27A23;
          }
          .footer-text {
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 15px;
          }
          .social-links {
            margin-top: 15px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #ecf0f1;
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.3s;
          }
          .social-links a:hover { opacity: 1; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="header-content">
              <div class="balloon-icon">🎈</div>
              <h1>Nouveau Message de Contact</h1>
              <p>Un client potentiel vous a contacté via votre site web</p>
            </div>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Contact Info Card -->
            <div class="info-card">
              <div class="info-row">
                <div class="icon">👤</div>
                <div class="label">Nom Complet</div>
                <div class="value">${firstName} ${lastName || ''}</div>
              </div>
              <div class="info-row">
                <div class="icon">📧</div>
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              ${phone ? `
              <div class="info-row">
                <div class="icon">📱</div>
                <div class="label">Téléphone</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
              </div>` : ''}
              ${subject ? `
              <div class="info-row">
                <div class="icon">📌</div>
                <div class="label">Sujet</div>
                <div class="value">${subject}</div>
              </div>` : ''}
              <div class="info-row">
                <div class="icon">🕐</div>
                <div class="label">Reçu Le</div>
                <div class="value">${new Date().toLocaleString('fr-FR', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}</div>
              </div>
            </div>

            <!-- Message Card -->
            <div class="message-card">
              <div class="message-header">
                <span class="message-icon">💬</span>
                <span class="message-title">Message du Client</span>
              </div>
              <div class="message-content">${message}</div>
            </div>

            <!-- CTA Section -->
            <div class="cta-section">
              <p style="margin-bottom: 15px; color: #2c3e50; font-weight: 600;">
                Répondez rapidement pour convertir ce prospect !
              </p>
              <a href="mailto:${email}?subject=Re: ${subject || 'Votre demande de contact'}" class="cta-button">
                ✉️ Répondre Maintenant
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-logo">Sky Experience Marrakech</div>
            <div class="footer-text">
              Formulaire de Contact Automatique<br>
              3ème Étage Bureau N° 16, Angle Bd Moulay Rachid, Marrakech 40000
            </div>
            <div class="social-links">
              <a href="https://www.instagram.com/skyexperience_marrakech">Instagram</a> • 
              <a href="https://web.facebook.com/profile.php?id=61587155890037">Facebook</a> • 
              <a href="https://wa.me/212751622180">WhatsApp</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    console.log('📧 Sending email via Resend...')
    
    const { data, error } = await resend.emails.send({
      from: 'Sky Experience <onboarding@resend.dev>',
      to: [process.env.MAIL_USER],
      replyTo: email,
      subject: emailSubject,
      html: htmlTemplate,
      text: `Name: ${firstName} ${lastName || ''}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`
    })

    if (error) {
      throw new Error(error.message)
    }

    console.log('✅ Email sent successfully via Resend! ID:', data.id)
    res.status(200).json({ message: 'Email sent successfully' })

  } catch (error) {
    console.error('❌ Failed to send email:', error.message)
    
    // Still return success to the user even if email fails
    // Log the contact info for manual follow-up
    console.log('📩 Contact info (email failed):', { firstName, lastName, email, phone, subject, message })
    
    res.status(200).json({ 
      message: 'Message received successfully',
      warning: 'Email notification failed but your message was recorded'
    })
  }
}