import { Resend } from 'resend';

// j'initialise resend avc la clé api
const resend = new Resend(process.env.RESEND_API_KEY);

// fonction pr envoyer l'email de vérification
export async function sendVerificationEmail(email: string, token: string, firstname: string) {
  // je crée l'url de vérification
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  // mode développement : si RESEND_API_KEY n'est pas configurée, on affiche juste le lien dans les logs
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'ta_cle_api_resend') {
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
    // j'utilise le domaine configuré ou le domaine de test par défaut
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    // j'envoie l'email avc resend
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Vérifiez votre adresse email - Puissance 4',
      html: `
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
      `,
    });
    
    // je vérifie si l'envoi a réussi (Resend peut retourner une erreur dans result.error)
    if (result.error) {
      console.error('Erreur Resend:', result.error);
      return { 
        success: false, 
        error: result.error.message || 'Erreur lors de l\'envoi de l\'email',
        details: result.error
      };
    }
    
    console.log('Email envoyé avec succès:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Erreur envoi email:', error);
    // j'extrais le message d'erreur détaillé
    const errorMessage = error?.message || error?.toString() || 'Erreur inconnue lors de l\'envoi de l\'email';
    const errorDetails = error?.response?.body || error;
    console.error('Détails de l\'erreur:', JSON.stringify(errorDetails, null, 2));
    
    return { 
      success: false, 
      error: errorMessage,
      details: errorDetails
    };
  }
}

