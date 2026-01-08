# Guide de déploiement sur Render.com

## Prérequis

1. Un compte GitHub avec votre code poussé
2. Un compte Render.com (gratuit)
3. Votre clé API Resend configurée
4. Votre domaine Resend vérifié (optionnel mais recommandé)

## Étapes de déploiement

### 1. Préparer votre code

Assurez-vous que votre code est sur GitHub et que tous les fichiers sont commités.

### 2. Créer la base de données MySQL sur Render

1. Connectez-vous à [Render.com](https://render.com)
2. Cliquez sur **"New +"** → **"PostgreSQL"** (ou MySQL si disponible)
3. Configurez :
   - **Name**: `ikram-jeu-db`
   - **Database**: `ikram_game`
   - **User**: `ikram_user`
   - **Plan**: Free
4. Notez la **Internal Database URL** (format: `mysql://user:password@host:port/database`)

### 3. Créer le service Socket.io

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Configurez :
   - **Name**: `ikram-jeu-socket`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start:socket`
   - **Plan**: Free

4. Dans **Environment Variables**, ajoutez :
   ```
   DATABASE_URL = (l'URL de votre base de données)
   NODE_ENV = production
   NEXT_PUBLIC_APP_URL = (vous l'ajouterez après avoir créé le service Next.js)
   ```

5. Notez l'URL du service (ex: `https://ikram-jeu-socket.onrender.com`)

### 4. Créer le service Next.js

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Configurez :
   - **Name**: `ikram-jeu-nextjs`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Dans **Environment Variables**, ajoutez :
   ```
   DATABASE_URL = (l'URL de votre base de données)
   NODE_ENV = production
   RESEND_API_KEY = (votre clé API Resend)
   RESEND_FROM_EMAIL = (ex: noreply@votredomaine.com)
   NEXT_PUBLIC_APP_URL = https://ikram-jeu-nextjs.onrender.com
   NEXT_PUBLIC_SOCKET_URL = https://ikram-jeu-socket.onrender.com
   ```

### 5. Lancer les migrations Prisma

Une fois les services créés, vous devez lancer les migrations :

1. Dans le service Next.js, allez dans **"Shell"**
2. Exécutez :
   ```bash
   npx prisma migrate deploy
   ```

### 6. Mettre à jour l'URL Socket dans le service Socket

Retournez dans le service Socket.io et mettez à jour :
```
NEXT_PUBLIC_APP_URL = https://ikram-jeu-nextjs.onrender.com
```

### 7. Redémarrer les services

Redémarrez les deux services pour que les changements prennent effet.

## Configuration CORS

Le code a été mis à jour pour utiliser automatiquement `NEXT_PUBLIC_APP_URL` pour le CORS.

## Variables d'environnement requises

### Service Next.js
- `DATABASE_URL` - URL de la base de données MySQL
- `RESEND_API_KEY` - Clé API Resend
- `RESEND_FROM_EMAIL` - Email d'envoi (ex: noreply@votredomaine.com)
- `NEXT_PUBLIC_APP_URL` - URL publique de votre app Next.js
- `NEXT_PUBLIC_SOCKET_URL` - URL publique du service Socket.io
- `NODE_ENV` - `production`

### Service Socket.io
- `DATABASE_URL` - Même URL que Next.js
- `NEXT_PUBLIC_APP_URL` - URL publique de votre app Next.js
- `NODE_ENV` - `production`

## Notes importantes

1. **Plan gratuit** : Les services peuvent s'endormir après 15 minutes d'inactivité. Le premier démarrage peut prendre 30-60 secondes.

2. **Base de données** : Le plan gratuit de Render offre PostgreSQL, pas MySQL. Vous devrez peut-être :
   - Utiliser PostgreSQL (et modifier votre schéma Prisma)
   - Ou utiliser un service MySQL externe (PlanetScale, etc.)

3. **HTTPS** : Render fournit automatiquement HTTPS pour tous les services.

4. **WebSockets** : Render supporte les WebSockets, donc Socket.io fonctionnera correctement.

## Alternative : Utiliser PostgreSQL

Si Render ne propose que PostgreSQL, vous pouvez migrer :

1. Modifiez `prisma/schema.prisma` :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Créez une nouvelle migration :
   ```bash
   npx prisma migrate dev --name postgresql
   ```

## Support

En cas de problème, vérifiez les logs dans le dashboard Render.

