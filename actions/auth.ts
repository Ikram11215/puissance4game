"use server";

import { prisma } from "@/lib/prisma";
import { validateEmail, validatePassword, validateName } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// fonction pr l'inscription d'un nouvel utilisateur
export async function registerUser(formData: {
  firstname: string;
  lastname: string;
  email: string;
  pseudo: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    const { firstname, lastname, email, pseudo, password, confirmPassword } = formData;

    // je valide le prénom
    const firstnameValidation = validateName(firstname, "Le prénom");
    if (!firstnameValidation.valid) {
      return { success: false, error: firstnameValidation.message };
    }

    // je valide le nom
    const lastnameValidation = validateName(lastname, "Le nom");
    if (!lastnameValidation.valid) {
      return { success: false, error: lastnameValidation.message };
    }

    // je valide l'email
    if (!validateEmail(email)) {
      return { success: false, error: "Email invalide" };
    }

    // je vérifie que le pseudo fait au moins 3 caractères
    if (pseudo.trim().length < 3) {
      return { success: false, error: "Le pseudo doit contenir au moins 3 caractères" };
    }

    // je valide le mot de passe
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.message };
    }

    // je vérifie que les mots de passe correspondent
    if (password !== confirmPassword) {
      return { success: false, error: "Les mots de passe ne correspondent pas" };
    }

    // je vérifie si l'email ou le pseudo existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { pseudo }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }
      if (existingUser.pseudo === pseudo) {
        return { success: false, error: "Ce pseudo est déjà utilisé" };
      }
    }

    // je hash le mot de passe et je génère un token de vérification
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // je crée l'utilisateur ds la bdd
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        pseudo,
        password: hashedPassword,
        verificationToken,
        emailVerified: false,
      },
    });

    // j'envoie l'email de vérification
    const emailResult = await sendVerificationEmail(email, verificationToken, firstname);
    
    // si l'envoi d'email échoue, je log l'erreur mais je continue quand même
    // (l'utilisateur peut demander un renvoi d'email plus tard)
    if (!emailResult.success) {
      console.error('Échec de l\'envoi de l\'email de vérification:', emailResult.error);
      console.error('Détails:', emailResult.details);
      // je retourne quand même un succès mais avec un avertissement
      return { 
        success: true, 
        message: "Inscription réussie ! Cependant, l'email de vérification n'a pas pu être envoyé. Vérifiez votre configuration Resend ou contactez le support.",
        user: { id: user.id, email: user.email, pseudo: user.pseudo },
        emailSent: false,
        emailError: emailResult.error
      };
    }

    return { 
      success: true, 
      message: "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
      user: { id: user.id, email: user.email, pseudo: user.pseudo },
      emailSent: true
    };
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return { success: false, error: "Une erreur est survenue lors de l'inscription" };
  }
}

// fonction pr la connexion
export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  try {
    const { email, password } = formData;

    // je valide l'email
    if (!validateEmail(email)) {
      return { success: false, error: "Email invalide" };
    }

    // je vérifie que le mot de passe est présent
    if (!password) {
      return { success: false, error: "Mot de passe requis" };
    }

    // je cherche l'utilisateur ds la bdd
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // je vérifie que l'email est vérifié
    if (!user.emailVerified) {
      return { success: false, error: "Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception." };
    }

    // je compare le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    return { 
      success: true, 
      message: "Connexion réussie !",
      user: { id: user.id, email: user.email, pseudo: user.pseudo, firstname: user.firstname, lastname: user.lastname }
    };
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return { success: false, error: "Une erreur est survenue lors de la connexion" };
  }
}

// fonction pr vérifier l'email avc le token
export async function verifyEmail(token: string) {
  try {
    // je cherche l'utilisateur avc ce token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) {
      return { success: false, error: "Token de vérification invalide" };
    }

    // je vérifie que l'email n'est pas déjà vérifié
    if (user.emailVerified) {
      return { success: false, error: "Cet email est déjà vérifié" };
    }

    // je mets à jour l'utilisateur pr marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return { 
      success: true, 
      message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter."
    };
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return { success: false, error: "Une erreur est survenue lors de la vérification" };
  }
}

