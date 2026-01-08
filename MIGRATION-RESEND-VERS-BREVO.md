# Migration de Resend vers Brevo - Récapitulatif

## ✅ Modifications effectuées dans le code

### 1. Fichiers modifiés

- ✅ `lib/email.ts` - Remplacé Resend par Brevo
- ✅ `package.json` - Remplacé `resend` par `@getbrevo/brevo`
- ✅ `actions/auth.ts` - Mis à jour le message d'erreur
- ✅ `app/register/page.tsx` - Mis à jour le message d'erreur
- ✅ `render.yaml` - Mis à jour les variables d'environnement

### 2. Variables d'environnement

**Anciennes variables (à supprimer) :**
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

**Nouvelles variables (à ajouter) :**
- `BREVO_API_KEY` - Votre clé API Brevo
- `BREVO_FROM_EMAIL` - Votre email vérifié sur Brevo (ex: `noreply@example.com`)
- `BREVO_FROM_NAME` - Nom de l'expéditeur (ex: `Puissance 4`)

---

## 🚀 Configuration sur Render.com

### Étape 1 : Mettre à jour les variables d'environnement

1. Allez sur votre service **Next.js** dans Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. **Supprimez** les anciennes variables :
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. **Ajoutez** les nouvelles variables :
   - `BREVO_API_KEY` = (votre clé API Brevo que vous avez générée)
   - `BREVO_FROM_EMAIL` = (votre email vérifié sur Brevo, ex: `noreply@example.com`)
   - `BREVO_FROM_NAME` = `Puissance 4` (ou le nom que vous voulez)

### Étape 2 : Vérifier votre email sur Brevo

1. Allez sur https://www.brevo.com
2. Connectez-vous à votre compte
3. Allez dans **"Settings"** → **"SMTP & API"** → **"Sender & IP"**
4. Vérifiez que votre email d'envoi est bien vérifié
5. Si ce n'est pas le cas, ajoutez et vérifiez votre email

### Étape 3 : Pousser le code sur GitHub

```bash
git add .
git commit -m "Migration de Resend vers Brevo"
git push
```

### Étape 4 : Redéploiement automatique

Render détectera automatiquement le nouveau commit et redéploiera votre service.

---

## 📋 Checklist

- [ ] Code modifié et poussé sur GitHub
- [ ] `BREVO_API_KEY` ajoutée dans Render
- [ ] `BREVO_FROM_EMAIL` ajoutée dans Render (email vérifié sur Brevo)
- [ ] `BREVO_FROM_NAME` ajoutée dans Render
- [ ] Anciennes variables Resend supprimées de Render
- [ ] Service redéployé sur Render
- [ ] Test d'inscription effectué
- [ ] Email de vérification reçu

---

## 🧪 Test

1. Allez sur votre application : `https://puissance4game-nextjs.onrender.com`
2. Créez un compte de test
3. Vérifiez que l'email de vérification arrive bien
4. Vérifiez les logs Render si l'email n'arrive pas

---

## ⚠️ Notes importantes

- **Pas besoin de configuration DNS** avec Brevo (contrairement à Resend)
- **300 emails/jour gratuitement** avec Brevo
- L'email d'envoi (`BREVO_FROM_EMAIL`) doit être vérifié sur Brevo
- Vous pouvez utiliser n'importe quel email que vous possédez (Gmail, etc.)

---

## 🐛 Dépannage

### L'email n'arrive pas

1. Vérifiez les logs Render pour voir les erreurs
2. Vérifiez que `BREVO_API_KEY` est correcte
3. Vérifiez que `BREVO_FROM_EMAIL` est vérifié sur Brevo
4. Vérifiez votre quota Brevo (300 emails/jour)

### Erreur "Invalid API key"

- Vérifiez que la clé API est bien copiée dans Render
- Régénérez une nouvelle clé sur Brevo si nécessaire

### Erreur "Sender email not verified"

- Allez sur Brevo et vérifiez votre email dans "Sender & IP"
- Utilisez un email que vous possédez et pouvez vérifier

