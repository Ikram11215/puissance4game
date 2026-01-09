import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

export async function sendVerificationEmail(email: string, token: string, firstname: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === 'ta_cle_api_brevo') {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📧 MODE DÉVELOPPEMENT - Email de vérification (non envoyé)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Pour: ${email}`);
    console.log(`Lien de vérification: ${verificationUrl}`);
    console.log('═══════════════════════════════════════════════════════════');
    return { 
      success: true, 
      data: { mode: 'development', url: verificationUrl }
    };
  }
  
  try {
    const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@example.com';
    const fromName = process.env.BREVO_FROM_NAME || 'Puissance 4';
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = 'Vérifiez votre adresse email - Puissance 4';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bienvenue ${firstname} !</h1>
        <p style="color: #666; font-size: 16px;">
          Merci de vous être inscrit sur Puissance 4. Pour activer votre compte, 
          je vous demande de cliquer sur le lien ci-dessous pour vérifier votre adresse email.
        </p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #570DF8; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Vérifier mon email
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
          <span style="color: #570DF8;">${verificationUrl}</span>
        </p>
      </div>
    `;
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email }];
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('Email envoyé avec succès via Brevo:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Erreur envoi email Brevo:', error);
    const errorMessage = error?.response?.body?.message || error?.message || error?.toString() || 'Erreur inconnue lors de l\'envoi de l\'email';
    const errorDetails = error?.response?.body || error;
    console.error('Détails de l\'erreur:', JSON.stringify(errorDetails, null, 2));
    
    return { 
      success: false, 
      error: errorMessage,
      details: errorDetails
    };
  }
}
