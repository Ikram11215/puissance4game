# Diagnostic : Email de vérification ne fonctionne pas

## 🔍 Comment diagnostiquer le problème

### Étape 1 : Vérifier les logs Render

1. Allez sur votre service **Next.js** dans Render
2. Cliquez sur **"Logs"**
3. Créez un compte de test
4. Cherchez dans les logs les messages liés à l'email :

**Si vous voyez :**
```
📧 MODE DÉVELOPPEMENT - Email de vérification (non envoyé)
```
→ La clé API Resend n'est pas configurée

**Si vous voyez :**
```
Erreur Resend: ...
Échec de l'envoi de l'email de vérification: ...
```
→ Il y a une erreur spécifique (voir le message d'erreur)

**Si vous voyez :**
```
Email envoyé avec succès
```
→ L'email a été envoyé, vérifiez votre boîte de réception (et spam)

---

## ✅ Vérifications à faire sur Render

### 1. Variables d'environnement

Dans votre service Next.js sur Render, allez dans **"Environment"** et vérifiez :

- ✅ `RESEND_API_KEY` = Votre clé API (commence par `re_`)
- ✅ `RESEND_FROM_EMAIL` = Votre email d'envoi (ex: `noreply@votredomaine.com` ou `onboarding@resend.dev`)
- ✅ `NEXT_PUBLIC_APP_URL` = URL de votre app (ex: `https://puissance4game-nextjs.onrender.com`)

### 2. Clé API Resend

- Allez sur [resend.com](https://resend.com)
- Vérifiez que votre clé API est active
- Vérifiez votre quota (plan gratuit = 100 emails/jour)

### 3. Domaine Resend

**Si vous utilisez `onboarding@resend.dev` :**
- ⚠️ Vous ne pouvez envoyer qu'à l'email associé à votre compte Resend
- Pour envoyer à d'autres emails, vous devez vérifier un domaine

**Si vous utilisez votre propre domaine :**
- Vérifiez que le domaine est bien vérifié sur Resend
- Vérifiez les enregistrements DNS

---

## 🐛 Erreurs courantes et solutions

### Erreur : "You can only send testing emails to your own email address"

**Cause** : Vous utilisez `onboarding@resend.dev` et essayez d'envoyer à une autre adresse.

**Solution** :
1. Vérifiez un domaine sur Resend
2. Mettez à jour `RESEND_FROM_EMAIL` avec votre domaine vérifié

### Erreur : "Invalid API key"

**Cause** : La clé API est incorrecte ou manquante.

**Solution** :
1. Vérifiez `RESEND_API_KEY` dans Render
2. Régénérez une nouvelle clé sur Resend si nécessaire

### Erreur : "Domain not verified"

**Cause** : Le domaine dans `RESEND_FROM_EMAIL` n'est pas vérifié.

**Solution** :
1. Vérifiez le domaine sur Resend
2. Ou utilisez temporairement `onboarding@resend.dev` (limité à votre email)

### Aucune erreur mais l'email n'arrive pas

**Vérifications** :
1. Vérifiez le dossier spam
2. Vérifiez que l'adresse email est correcte
3. Vérifiez votre quota Resend (peut être dépassé)

---

## 🔧 Solution temporaire : Mode développement

Si vous voulez tester sans envoyer d'emails réels, vous pouvez temporairement :

1. Dans Render, modifiez `RESEND_API_KEY` :
   ```
   RESEND_API_KEY = ta_cle_api_resend
   ```

2. Les liens de vérification s'afficheront dans les logs au lieu d'être envoyés par email.

3. Copiez le lien depuis les logs et testez la vérification.

---

## 📝 Checklist de diagnostic

- [ ] `RESEND_API_KEY` est configurée dans Render
- [ ] `RESEND_FROM_EMAIL` est configurée dans Render
- [ ] La clé API est valide sur Resend.com
- [ ] Le domaine est vérifié (si vous utilisez votre propre domaine)
- [ ] Le quota Resend n'est pas dépassé
- [ ] Les logs Render montrent des erreurs spécifiques
- [ ] L'email n'est pas dans le dossier spam

