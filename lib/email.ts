import { Resend } from 'resend';

// j'initialise resend avc la clé api
const resend = new Resend(process.env.RESEND_API_KEY);

// fonction pr envoyer l'email de vérification
export async function sendVerificationEmail(email: string, token: string, firstname: string) {
  // je crée l'url de vérification
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  try {
    // j'envoie l'email avc resend
    await resend.emails.send({
      from: 'onboarding@resend.dev',
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
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
}

