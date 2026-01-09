"use server";

import { prisma } from "@/lib/prisma";
import { validateEmail, validatePassword, validateName } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

    const firstnameValidation = validateName(firstname, "Le prénom");
    if (!firstnameValidation.valid) {
      return { success: false, error: firstnameValidation.message };
    }

    const lastnameValidation = validateName(lastname, "Le nom");
    if (!lastnameValidation.valid) {
      return { success: false, error: lastnameValidation.message };
    }

    if (!validateEmail(email)) {
      return { success: false, error: "Email invalide" };
    }

    if (pseudo.trim().length < 3) {
      return { success: false, error: "Le pseudo doit contenir au moins 3 caractères" };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.message };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Les mots de passe ne correspondent pas" };
    }

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

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

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

    const emailResult = await sendVerificationEmail(email, verificationToken, firstname);
    
    if (!emailResult.success) {
      console.error('Échec de l\'envoi de l\'email de vérification:', emailResult.error);
      console.error('Détails:', emailResult.details);
      return { 
        success: true, 
        message: "Inscription réussie ! Cependant, l'email de vérification n'a pas pu être envoyé. Vérifiez votre configuration Brevo ou contactez le support.",
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

export async function loginUser(formData: {
  email: string;
  password: string;
}) {
  try {
    const { email, password } = formData;

    if (!validateEmail(email)) {
      return { success: false, error: "Email invalide" };
    }

    if (!password) {
      return { success: false, error: "Mot de passe requis" };
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    if (!user.emailVerified) {
      return { success: false, error: "Veuillez vérifier votre email avant de vous connecter. Consultez votre boîte de réception." };
    }

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

export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) {
      return { success: false, error: "Token de vérification invalide" };
    }

    if (user.emailVerified) {
      return { success: false, error: "Cet email est déjà vérifié" };
    }

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
