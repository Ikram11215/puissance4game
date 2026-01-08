# Comment vérifier si les migrations sont réussies sur Render (sans payer)

## 📋 Méthode 1 : Vérifier les logs Render

### Pour le service Next.js :

1. Allez sur votre service Next.js dans Render
2. Cliquez sur **"Logs"** dans le menu de gauche
3. Cherchez les messages de migration au démarrage

### Messages à chercher :

✅ **Migrations réussies** :
```
🔄 Lancement des migrations Prisma...
Applying migration `20250108120000_postgresql`
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "puissance4" at "dpg-..."
The following migration(s) have been applied:
  - 20250108120000_postgresql
✅ Migrations Prisma appliquées avec succès
```

❌ **Migrations échouées** :
```
🔄 Lancement des migrations Prisma...
Error: P3009
migrate found failed migrations in the target database
⚠️ Erreur lors des migrations (peut être normal si déjà appliquées)
```

⚠️ **Migrations déjà appliquées** (normal) :
```
🔄 Lancement des migrations Prisma...
No pending migrations to apply.
✅ Migrations Prisma appliquées avec succès
```

---

## 📋 Méthode 2 : Tester l'application

Si les migrations sont réussies, l'application devrait fonctionner :

1. Allez sur votre URL : `https://puissance4game-nextjs.onrender.com`
2. Essayez de créer un compte
3. Si ça fonctionne → Les migrations sont OK ✅
4. Si vous avez une erreur de base de données → Les migrations ont échoué ❌

---

## 📋 Méthode 3 : Vérifier via une requête simple

Créez une page de test temporaire pour vérifier :

1. Créez `app/test-db/page.tsx` :
```tsx
"use client";
import { useEffect, useState } from "react";

export default function TestDB() {
  const [result, setResult] = useState("Chargement...");

  useEffect(() => {
    fetch("/api/test-db")
      .then((r) => r.json())
      .then((data) => setResult(JSON.stringify(data, null, 2)))
      .catch((e) => setResult("Erreur: " + e.message));
  }, []);

  return <pre>{result}</pre>;
}
```

2. Créez `app/api/test-db/route.ts` :
```tsx
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    
    return NextResponse.json({
      success: true,
      message: "Base de données accessible",
      tables: {
        user: { exists: true, count: userCount },
        game: { exists: true, count: gameCount }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

3. Accédez à : `https://puissance4game-nextjs.onrender.com/test-db`

---

## 🔍 Interprétation des erreurs communes

### Erreur P3009 : "failed migrations"

**Signification** : Une migration a échoué précédemment et Prisma bloque les nouvelles migrations.

**Solution** : Les migrations peuvent quand même être appliquées. Si l'application fonctionne, c'est OK.

### Erreur "Table does not exist"

**Signification** : Les migrations n'ont pas été appliquées.

**Solution** : Vérifiez que `DATABASE_URL` est correcte dans les variables d'environnement.

### Erreur "Connection refused"

**Signification** : La base de données n'est pas accessible.

**Solution** : Vérifiez que la base PostgreSQL est créée et en ligne sur Render.

---

## ✅ Checklist rapide

- [ ] Les logs montrent "✅ Migrations Prisma appliquées avec succès"
- [ ] L'application démarre sans erreur
- [ ] Vous pouvez créer un compte (teste la table `user`)
- [ ] Vous pouvez créer une partie (teste la table `game`)

Si tout ça fonctionne → **Les migrations sont OK !** ✅

