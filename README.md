# Puissance 4 en ligne

un jeu de puissance 4 multijoueur en temps réel fait avc next.js et socket.io

## c'est quoi le projet ?

c'est un jeu de puissance 4 qu'on peut jouer en ligne avc d'autres joueurs. tu peux :
- t'inscrire et te connecter
- créer une partie et partager un code pr que quelqu'un te rejoigne
- jouer en temps réel
- voir ton classement et tes stats
- avoir un système d'elo pr voir qui est le meilleur

## prérequis

avant de commencer, il te faut :
- node.js installé (version 18 ou plus)
- une base de données mysql (j'utilise mamp perso)
- npm ou yarn

## installation

1. clone ou télécharge le projet

2. installe les dépendances :
```bash
npm install
```

3. configure le fichier .env

crée un fichier `.env` à la racine du projet et mets ça dedans :

```env
# url de la base de données mysql
DATABASE_URL="mysql://root:root@localhost:8889/ikram-game"

# clé api resend pr envoyer les emails (tu peux en créer une sur resend.com)
RESEND_API_KEY="ta_cle_api_resend"

# url de l'app (en local c'est localhost:3000)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# port du serveur socket.io (par défaut 3001)
SOCKET_PORT=3001
```

**important** : 
- remplace `root:root` par ton user et mdp mysql si c'est pas ça
- remplace `localhost:8889` par ton host et port mysql si c'est différent
- remplace `puissance4game` par le nom de ta base de données
- mets ta vraie clé api resend (sinon les emails de vérification marcheront pas)

4. crée la base de données

ouvre mysql et crée une base de données :
```sql
CREATE DATABASE puissance4game;
```

ou fais-le depuis phpmyadmin si tu utilises mamp

5. lance les migrations prisma

ça va créer les tables dans ta base de données :
```bash
npx prisma migrate dev
```

si ça te demande un nom de migration, mets ce que tu veux genre "init" ou "first_migration"

6. génère le client prisma

```bash
npx prisma generate
```

## lancer le projet

le projet a besoin de deux serveurs qui tournent en même temps :
- le serveur next.js (port 3000)
- le serveur socket.io (port 3001)

**option 1 : tout lancer d'un coup (recommandé)**

```bash
npm run dev:all
```

ça lance les deux serveurs en même temps

**option 2 : lancer séparément**

dans un terminal :
```bash
npm run dev
```

dans un autre terminal :
```bash
npm run dev:socket
```

une fois que c'est lancé, ouvre ton navigateur sur `http://localhost:3000`

## comment ça marche ?

1. **inscription** : tu crées un compte, tu reçois un email de vérification, tu cliques dessus
2. **créer une partie** : tu vas dans "jouer", tu crées une partie, tu récupères le code
3. **rejoindre une partie** : quelqu'un d'autre peut rejoindre avc le code
4. **jouer** : les deux joueurs cliquent "je suis prêt" et la partie commence
5. **classement** : tes victoires/défaites sont comptées et ton elo change

## structure du projet

```
ikram-jeu/
├── app/                    # pages next.js
│   ├── game/              # page de jeu
│   ├── lobby/              # page pr créer/rejoindre une partie
│   ├── login/              # page de connexion
│   ├── register/           # page d'inscription
│   ├── leaderboard/        # classement
│   └── history/            # historique des parties
├── components/             # composants react
├── lib/                    # fonctions utilitaires
│   ├── game/               # logique du jeu
│   ├── socket/             # connexion socket.io
│   └── prisma.ts           # client prisma
├── actions/                # server actions next.js
├── hooks/                  # hooks react
├── prisma/                 # schéma et migrations
└── socket-server.ts         # serveur socket.io
```

## commandes utiles

```bash
# lancer le projet
npm run dev:all

# juste next.js
npm run dev

# juste socket.io
npm run dev:socket

# créer une migration après avoir modifié le schema
npx prisma migrate dev

# régénérer le client prisma
npx prisma generate

# voir la base de données dans prisma studio
npx prisma studio
```

## problèmes courants

**le serveur socket.io se connecte pas**
- vérifie que le port 3001 est libre
- vérifie que tu as bien lancé `npm run dev:socket` ou `npm run dev:all`

**erreur de connexion à la base de données**
- vérifie que mysql tourne
- vérifie les infos dans le .env (user, mdp, port, nom de la bdd)
- vérifie que la base de données existe

**les emails de vérification arrivent pas**
- vérifie ta clé api resend dans le .env
- vérifie que tu as bien configuré resend.com
- regarde les logs du serveur pr voir les erreurs

**prisma dit que les tables existent pas**
- lance `npx prisma migrate dev` pr créer les tables
- vérifie que la base de données existe bien

## notes

- le dark mode est sauvegardé dans le localStorage
- les sessions utilisateur sont dans le localStorage aussi
- les parties sont sauvegardées dans la bdd même si le serveur redémarre
- le système d'elo commence à 1000 points pr tout le monde

voilà, normalement tu peux tester le projet maintenant. si tu as des questions ou des bugs, regarde les logs du serveur ça aide souvent, mais là il te reste juste à le publier en ligne pour le jour de la soutenance
