# Puissance 4 Multiplayer

Un jeu de Puissance 4 multijoueur en temps réel développé avec Next.js, Socket.io et PostgreSQL.

## Description

Application web permettant de jouer au Puissance 4 en ligne avec d'autres joueurs en temps réel. Le projet inclut :
- Système d'authentification avec vérification d'email
- Création et rejoindre des parties via code de salle
- Jeu en temps réel avec Socket.io
- Système de classement avec ELO
- Historique des parties
- Gestion de la reconnexion et pause/reprise de partie
- Système de rematch après une partie terminée

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 18 ou supérieure)
- **PostgreSQL** (version 12 ou supérieure)
- **npm** ou **yarn**

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd <nom-du-projet>
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# URL de la base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/puissance4game"

# Clé API Brevo pour l'envoi d'emails (créer un compte sur brevo.com)
BREVO_API_KEY="votre_cle_api_brevo"
BREVO_FROM_EMAIL="votre_email_verifie@votredomaine.com"
BREVO_FROM_NAME="Puissance 4"

# URL de l'application (en local)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# URL du serveur Socket.io (en local)
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# Port du serveur Socket.io (optionnel, par défaut 3001)
SOCKET_PORT=3001
```

**Important :**
- Remplacez `user:password` par vos identifiants PostgreSQL
- Remplacez `localhost:5432` par votre host et port PostgreSQL si différent
- Remplacez `puissance4game` par le nom de votre base de données
- Configurez votre clé API Brevo (sinon les emails de vérification ne fonctionneront pas)
- En mode développement, si `BREVO_API_KEY` n'est pas configurée, les emails seront affichés dans les logs de la console

### 4. Créer la base de données

Connectez-vous à PostgreSQL et créez la base de données :

```sql
CREATE DATABASE puissance4game;
```

### 5. Lancer les migrations Prisma

Cela va créer les tables dans votre base de données :

```bash
npx prisma migrate dev
```

Si vous êtes invité à donner un nom de migration, utilisez un nom descriptif comme `init` ou `initial_migration`.

### 6. Générer le client Prisma

```bash
npx prisma generate
```

## Lancement du projet

Le projet nécessite deux serveurs qui doivent tourner simultanément :
- Le serveur Next.js (port 3000)
- Le serveur Socket.io (port 3001)

### Option 1 : Lancer les deux serveurs ensemble (recommandé)

```bash
npm run dev:all
```

Cette commande lance les deux serveurs simultanément.

### Option 2 : Lancer les serveurs séparément

**Terminal 1 - Serveur Next.js :**
```bash
npm run dev
```

**Terminal 2 - Serveur Socket.io :**
```bash
npm run dev:socket
```

Une fois les serveurs lancés, ouvrez votre navigateur sur `http://localhost:3000`.

## Utilisation

1. **Inscription** : Créez un compte, vous recevrez un email de vérification
2. **Vérification** : Cliquez sur le lien dans l'email pour activer votre compte
3. **Connexion** : Connectez-vous avec vos identifiants
4. **Créer une partie** : Allez dans "Jouer", créez une partie et récupérez le code
5. **Rejoindre une partie** : Un autre joueur peut rejoindre avec le code de la partie
6. **Jouer** : Les deux joueurs cliquent sur "Je suis prêt" et la partie commence
7. **Classement** : Vos victoires/défaites sont comptées et votre ELO évolue

## Structure du projet

```
.
├── app/                    # Pages Next.js (App Router)
│   ├── game/              # Page de jeu
│   ├── lobby/             # Page pour créer/rejoindre une partie
│   ├── login/             # Page de connexion
│   ├── register/          # Page d'inscription
│   ├── leaderboard/       # Classement
│   └── history/           # Historique des parties
├── components/            # Composants React réutilisables
├── lib/                   # Fonctions utilitaires
│   ├── game/              # Logique du jeu (mouvements, vérification gagnant)
│   ├── socket/            # Connexion Socket.io client
│   └── prisma.ts          # Client Prisma
├── actions/               # Server Actions Next.js
├── hooks/                 # Hooks React personnalisés
├── prisma/                # Schéma Prisma et migrations
├── scripts/               # Scripts de démarrage avec migrations
└── socket-server.ts        # Serveur Socket.io
```

## Commandes disponibles

```bash
# Développement - lancer les deux serveurs
npm run dev:all

# Développement - serveur Next.js uniquement
npm run dev

# Développement - serveur Socket.io uniquement
npm run dev:socket

# Production - build
npm run build

# Production - démarrer Next.js
npm start

# Production - démarrer avec migrations automatiques
npm run start:with-migrations

# Production - démarrer Socket.io avec migrations
npm run start:socket:with-migrations

# Créer une migration après modification du schéma
npx prisma migrate dev

# Régénérer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio (interface graphique pour la BDD)
npx prisma studio

# Linter
npm run lint
```

## Fonctionnalités

### Système de jeu
- Jeu en temps réel avec Socket.io
- Gestion des tours de jeu
- Détection automatique du gagnant (4 jetons alignés)
- Gestion des matchs nuls
- Système de pause/reprise si un joueur se déconnecte
- Possibilité de rejouer une partie après la fin

### Système d'authentification
- Inscription avec validation des données
- Vérification d'email via Brevo
- Connexion sécurisée avec hashage des mots de passe (bcrypt)
- Gestion des sessions

### Système de classement
- Calcul ELO après chaque partie
- Statistiques (victoires, défaites, matchs nuls)
- Classement global des joueurs
- Historique des parties

## Dépannage

### Le serveur Socket.io ne se connecte pas
- Vérifiez que le port 3001 est libre
- Vérifiez que vous avez bien lancé `npm run dev:socket` ou `npm run dev:all`
- Vérifiez la variable `NEXT_PUBLIC_SOCKET_URL` dans votre `.env`

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez les informations dans le `.env` (user, password, port, nom de la BDD)
- Vérifiez que la base de données existe
- Vérifiez que le format de `DATABASE_URL` est correct : `postgresql://user:password@host:port/database`

### Les emails de vérification n'arrivent pas
- Vérifiez votre clé API Brevo dans le `.env`
- Vérifiez que vous avez bien configuré votre compte Brevo
- Vérifiez que l'email expéditeur est vérifié sur Brevo
- En mode développement, si `BREVO_API_KEY` n'est pas configurée, l'URL de vérification sera affichée dans les logs de la console

### Prisma indique que les tables n'existent pas
- Lancez `npx prisma migrate dev` pour créer les tables
- Vérifiez que la base de données existe bien
- Vérifiez que `DATABASE_URL` est correctement configurée

### Erreur lors du build
- Assurez-vous d'avoir lancé `npx prisma generate` avant le build
- Vérifiez que toutes les dépendances sont installées
- Vérifiez que les variables d'environnement sont correctement configurées

## Technologies utilisées

- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Socket.io** - Communication en temps réel
- **Prisma** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **Brevo (ex-Sendinblue)** - Service d'envoi d'emails
- **Tailwind CSS** - Framework CSS
- **DaisyUI** - Composants UI pour Tailwind

## Notes importantes

- Le dark mode est sauvegardé dans le localStorage
- Les sessions utilisateur sont stockées dans le localStorage
- Les parties sont sauvegardées dans la base de données même si le serveur redémarre
- Le système ELO commence à 1000 points pour tous les nouveaux joueurs
- En production, les migrations Prisma sont appliquées automatiquement au démarrage



