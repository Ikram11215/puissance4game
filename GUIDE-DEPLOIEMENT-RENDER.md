# Guide de déploiement étape par étape sur Render.com

## ⚠️ Important : Base de données

**Render.com offre uniquement PostgreSQL gratuitement, pas MySQL.**

Vous avez deux options :
1. **Migrer vers PostgreSQL** (recommandé - gratuit sur Render)
2. **Utiliser un service MySQL externe** (PlanetScale, etc.) et le connecter à Render

Ce guide suppose que vous migrez vers PostgreSQL.

---

## 📋 Prérequis

- ✅ Code poussé sur GitHub
- ✅ Compte Render.com (gratuit)
- ✅ Clé API Resend configurée
- ✅ Domaine Resend vérifié (optionnel mais recommandé)

---

## 🚀 ÉTAPE 1 : Préparer la migration vers PostgreSQL

### 1.1 Modifier le schéma Prisma

Ouvrez `prisma/schema.prisma` et changez :

```prisma
datasource db {
  provider = "postgresql"  // Au lieu de "mysql"
  url      = env("DATABASE_URL")
}
```

### 1.2 Créer une nouvelle migration

```bash
npx prisma migrate dev --name postgresql
```

### 1.3 Tester localement (optionnel)

Créez une base PostgreSQL locale ou utilisez une base de test pour vérifier que tout fonctionne.

---

## 🚀 ÉTAPE 2 : Créer un compte Render.com

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec GitHub (recommandé) ou créez un compte
4. Vérifiez votre email si nécessaire

---

## 🚀 ÉTAPE 3 : Créer la base de données PostgreSQL

1. Dans le dashboard Render, cliquez sur **"New +"** en haut à droite
2. Sélectionnez **"PostgreSQL"**
3. Configurez :
   - **Name** : `ikram-jeu-db` (ou ce que vous voulez)
   - **Database** : `ikram_game` (ou ce que vous voulez)
   - **User** : `ikram_user` (ou ce que vous voulez)
   - **Region** : Choisissez la région la plus proche (ex: Frankfurt)
   - **PostgreSQL Version** : La dernière version
   - **Plan** : **Free** (pour commencer)
4. Cliquez sur **"Create Database"**
5. ⚠️ **IMPORTANT** : Attendez que la base soit créée (2-3 minutes)
6. Une fois créée, cliquez sur votre base de données
7. Dans l'onglet **"Info"**, trouvez **"Internal Database URL"**
8. **COPIEZ cette URL** - vous en aurez besoin plus tard
   - Format : `postgresql://user:password@host:port/database`

---

## 🚀 ÉTAPE 4 : Créer le service Socket.io

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre repository GitHub :
   - Si c'est la première fois, autorisez Render à accéder à vos repos
   - Sélectionnez votre repository `ikram-jeu`
4. Configurez le service :

   **Settings :**
   - **Name** : `ikram-jeu-socket`
   - **Region** : Même région que votre base de données
   - **Branch** : `main` (ou `master`)
   - **Root Directory** : `/` (laisser vide)
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npx prisma generate`
   - **Start Command** : `npm run start:socket`
   
   ⚠️ **Note** : Le script utilise `tsx` pour exécuter TypeScript directement en production.
   - **Plan** : **Free**

5. Cliquez sur **"Advanced"** pour ajouter les variables d'environnement :

   Cliquez sur **"Add Environment Variable"** et ajoutez :

   ```
   NODE_ENV = production
   ```

   ```
   DATABASE_URL = (collez l'URL de votre base PostgreSQL)
   ```

   ⚠️ **Ne mettez pas encore** `NEXT_PUBLIC_APP_URL` - vous l'ajouterez après avoir créé le service Next.js

6. Cliquez sur **"Create Web Service"**
7. ⚠️ **Attendez que le build soit terminé** (5-10 minutes la première fois)
8. Une fois le service démarré, notez l'URL du service :
   - Format : `https://ikram-jeu-socket.onrender.com`
   - Vous la trouverez en haut de la page du service

---

## 🚀 ÉTAPE 5 : Créer le service Next.js

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Sélectionnez le même repository GitHub `ikram-jeu`
4. Configurez le service :

   **Settings :**
   - **Name** : `ikram-jeu-nextjs`
   - **Region** : Même région que votre base de données
   - **Branch** : `main` (ou `master`)
   - **Root Directory** : `/` (laisser vide)
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : **Free**

5. Cliquez sur **"Advanced"** pour ajouter les variables d'environnement :

   Cliquez sur **"Add Environment Variable"** et ajoutez une par une :

   ```
   NODE_ENV = production
   ```

   ```
   DATABASE_URL = (même URL que pour le service Socket)
   ```

   ```
   RESEND_API_KEY = (votre clé API Resend - commence par re_)
   ```

   ```
   RESEND_FROM_EMAIL = (ex: noreply@votredomaine.com ou onboarding@resend.dev)
   ```

   ⚠️ **Ne mettez pas encore** `NEXT_PUBLIC_APP_URL` et `NEXT_PUBLIC_SOCKET_URL` - vous les ajouterez après

6. Cliquez sur **"Create Web Service"**
7. ⚠️ **Attendez que le build soit terminé** (5-10 minutes la première fois)
8. Une fois le service démarré, notez l'URL du service :
   - Format : `https://ikram-jeu-nextjs.onrender.com`
   - Vous la trouverez en haut de la page du service

---

## 🚀 ÉTAPE 6 : Configurer les URLs dans les variables d'environnement

Maintenant que vous avez les deux URLs, vous devez les ajouter :

### 6.1 Service Next.js

1. Allez dans votre service **Next.js** (`ikram-jeu-nextjs`)
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Ajoutez ces deux variables :

   ```
   NEXT_PUBLIC_APP_URL = https://ikram-jeu-nextjs.onrender.com
   ```
   (Remplacez par votre vraie URL)

   ```
   NEXT_PUBLIC_SOCKET_URL = https://ikram-jeu-socket.onrender.com
   ```
   (Remplacez par votre vraie URL du service Socket)

4. Cliquez sur **"Save Changes"**
5. Render redéploiera automatiquement le service

### 6.2 Service Socket.io

1. Allez dans votre service **Socket.io** (`ikram-jeu-socket`)
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Ajoutez cette variable :

   ```
   NEXT_PUBLIC_APP_URL = https://ikram-jeu-nextjs.onrender.com
   ```
   (Remplacez par votre vraie URL du service Next.js)

4. Cliquez sur **"Save Changes"**
5. Render redéploiera automatiquement le service

---

## 🚀 ÉTAPE 7 : Lancer les migrations Prisma

Une fois les services déployés, vous devez créer les tables dans la base de données :

1. Allez dans votre service **Next.js** (`ikram-jeu-nextjs`)
2. Cliquez sur **"Shell"** dans le menu de gauche
3. Dans le terminal qui s'ouvre, exécutez :

   ```bash
   npx prisma migrate deploy
   ```

4. Attendez que les migrations soient appliquées
5. Vous devriez voir un message de succès

---

## 🚀 ÉTAPE 8 : Vérifier que tout fonctionne

1. Allez sur l'URL de votre service Next.js : `https://ikram-jeu-nextjs.onrender.com`
2. Testez :
   - Créer un compte
   - Vérifier l'email (si configuré)
   - Se connecter
   - Créer une partie
   - Rejoindre une partie
   - Jouer une partie

3. Vérifiez les logs si quelque chose ne fonctionne pas :
   - Cliquez sur **"Logs"** dans chaque service
   - Cherchez les erreurs en rouge

---

## 🔧 Dépannage

### Le service ne démarre pas

- Vérifiez les logs dans Render
- Vérifiez que toutes les variables d'environnement sont correctes
- Vérifiez que `DATABASE_URL` est bien l'URL PostgreSQL (pas MySQL)

### Les migrations échouent

- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que le schéma Prisma utilise `postgresql` et non `mysql`
- Relancez `npx prisma migrate deploy` dans le Shell

### Socket.io ne se connecte pas

- Vérifiez que `NEXT_PUBLIC_SOCKET_URL` est correcte dans le service Next.js
- Vérifiez que `NEXT_PUBLIC_APP_URL` est correcte dans le service Socket
- Vérifiez les logs des deux services
- Assurez-vous que les deux services sont en ligne (pas "sleeping")

### Les emails ne s'envoient pas

- Vérifiez que `RESEND_API_KEY` est correcte
- Vérifiez que `RESEND_FROM_EMAIL` est configurée
- Si vous utilisez `onboarding@resend.dev`, vous ne pouvez envoyer qu'à votre email Resend
- Vérifiez les logs pour voir les erreurs Resend

### Le service s'endort après 15 minutes

- C'est normal avec le plan gratuit
- Le premier démarrage après l'endormissement prend 30-60 secondes
- Pour éviter cela, passez au plan payant ($7/mois)

---

## 📝 Résumé des variables d'environnement

### Service Next.js
```
NODE_ENV = production
DATABASE_URL = (URL PostgreSQL)
RESEND_API_KEY = (votre clé Resend)
RESEND_FROM_EMAIL = (votre email d'envoi)
NEXT_PUBLIC_APP_URL = (URL du service Next.js)
NEXT_PUBLIC_SOCKET_URL = (URL du service Socket)
```

### Service Socket.io
```
NODE_ENV = production
DATABASE_URL = (même URL PostgreSQL)
NEXT_PUBLIC_APP_URL = (URL du service Next.js)
```

---

## ✅ Checklist finale

- [ ] Migration vers PostgreSQL effectuée
- [ ] Base de données PostgreSQL créée sur Render
- [ ] Service Socket.io créé et déployé
- [ ] Service Next.js créé et déployé
- [ ] Variables d'environnement configurées
- [ ] Migrations Prisma exécutées
- [ ] Application testée et fonctionnelle

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Render.com !

**URLs importantes :**
- Frontend : `https://ikram-jeu-nextjs.onrender.com`
- Socket.io : `https://ikram-jeu-socket.onrender.com`
- Dashboard Render : [dashboard.render.com](https://dashboard.render.com)

