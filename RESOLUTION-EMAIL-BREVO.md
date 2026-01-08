# Résolution : Email Brevo ne s'envoie pas

## 🔍 Diagnostic

Les logs montrent :
```
◉ MODE DÉVELOPPEMENT - Email de vérification (non envoyé)
```

Cela signifie que `BREVO_API_KEY` n'est **pas configurée** ou est invalide sur Render.

---

## ✅ Solution : Vérifier la configuration sur Render

### Étape 1 : Vérifier les variables d'environnement

1. Allez sur votre service **Next.js** dans Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Vérifiez que vous avez bien :

   ✅ `BREVO_API_KEY` = (votre vraie clé API Brevo, commence par `xkeysib-...`)
   
   ❌ **PAS** `ta_cle_api_brevo` ou vide

   ✅ `BREVO_FROM_EMAIL` = (votre email vérifié sur Brevo)
   
   ✅ `BREVO_FROM_NAME` = `Puissance 4` (optionnel mais recommandé)

### Étape 2 : Vérifier la clé API Brevo

1. Allez sur https://www.brevo.com
2. Connectez-vous
3. Allez dans **"Settings"** → **"SMTP & API"** → **"API Keys"**
4. Vérifiez que votre clé API existe et est active
5. Si nécessaire, créez une nouvelle clé API
6. **Copiez la clé complète** (elle commence par `xkeysib-`)

### Étape 3 : Ajouter/Corriger la variable sur Render

1. Dans Render (service Next.js → Environment)
2. Si `BREVO_API_KEY` n'existe pas :
   - Cliquez sur **"Add Environment Variable"**
   - Key : `BREVO_API_KEY`
   - Value : Collez votre clé API Brevo complète
   - Cliquez sur **"Save Changes"**

3. Si `BREVO_API_KEY` existe mais a une mauvaise valeur :
   - Cliquez sur la variable
   - Modifiez la Value avec votre vraie clé API
   - Cliquez sur **"Save Changes"**

### Étape 4 : Vérifier BREVO_FROM_EMAIL

1. Sur Brevo, allez dans **"Settings"** → **"SMTP & API"** → **"Sender & IP"**
2. Vérifiez que votre email est bien vérifié (icône verte ✅)
3. Si ce n'est pas le cas :
   - Cliquez sur **"Add a sender"**
   - Entrez votre email
   - Vérifiez-le en cliquant sur le lien dans l'email de confirmation

4. Dans Render, vérifiez que `BREVO_FROM_EMAIL` correspond à cet email vérifié

### Étape 5 : Redéployer le service

Après avoir modifié les variables :

1. Render redéploiera automatiquement (ou cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**)
2. Attendez que le déploiement soit terminé
3. Testez à nouveau l'inscription

---

## 🧪 Test

1. Créez un nouveau compte de test
2. Vérifiez les logs Render :
   - Vous ne devriez **PAS** voir "MODE DÉVELOPPEMENT"
   - Vous devriez voir "Email envoyé avec succès via Brevo"
3. Vérifiez votre boîte de réception (et spam)

---

## ⚠️ Erreurs courantes

### Erreur : "Invalid API key"

**Cause** : La clé API est incorrecte ou mal copiée

**Solution** :
- Vérifiez que vous avez copié la clé complète (commence par `xkeysib-`)
- Vérifiez qu'il n'y a pas d'espaces avant/après
- Régénérez une nouvelle clé sur Brevo si nécessaire

### Erreur : "Sender email not verified"

**Cause** : L'email dans `BREVO_FROM_EMAIL` n'est pas vérifié sur Brevo

**Solution** :
- Allez sur Brevo → "Sender & IP"
- Vérifiez votre email
- Utilisez un email que vous possédez et pouvez vérifier

### Erreur : "Quota exceeded"

**Cause** : Vous avez dépassé la limite de 300 emails/jour

**Solution** :
- Attendez le lendemain
- Ou passez à un plan payant

---

## 📋 Checklist de vérification

- [ ] `BREVO_API_KEY` existe dans Render
- [ ] `BREVO_API_KEY` a une valeur valide (commence par `xkeysib-`)
- [ ] `BREVO_FROM_EMAIL` existe dans Render
- [ ] `BREVO_FROM_EMAIL` correspond à un email vérifié sur Brevo
- [ ] `BREVO_FROM_NAME` est configuré (optionnel)
- [ ] Service redéployé après modification des variables
- [ ] Test d'inscription effectué
- [ ] Logs vérifiés (pas de "MODE DÉVELOPPEMENT")

---

## 💡 Astuce : Vérifier rapidement

Dans les logs Render, après une inscription, vous devriez voir :

**✅ Si ça fonctionne :**
```
Email envoyé avec succès via Brevo: { ... }
```

**❌ Si ça ne fonctionne pas :**
```
◉ MODE DÉVELOPPEMENT - Email de vérification (non envoyé)
```
→ Cela signifie que `BREVO_API_KEY` n'est pas configurée correctement

---

## 🔧 Solution temporaire : Utiliser le lien depuis les logs

En attendant de corriger la configuration, vous pouvez :

1. Créer un compte
2. Regarder les logs Render
3. Copier le lien de vérification qui s'affiche
4. L'ouvrir dans votre navigateur pour vérifier l'email

Mais il faut quand même corriger la configuration pour que les emails soient envoyés automatiquement !

