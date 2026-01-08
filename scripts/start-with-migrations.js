#!/usr/bin/env node

// Script pour lancer les migrations Prisma puis démarrer Next.js
// Utilisé en production sur Render.com (plan gratuit sans Shell)

const { execSync } = require('child_process');
const { spawn } = require('child_process');

console.log('🔄 Lancement des migrations Prisma...');

try {
  // Lance les migrations Prisma
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ Migrations Prisma appliquées avec succès');
} catch (error) {
  console.error('⚠️  Erreur lors des migrations (peut être normal si déjà appliquées):', error.message);
  // On continue quand même, les migrations peuvent déjà être appliquées
}

console.log('🚀 Démarrage du serveur Next.js...');

// Démarre Next.js
const nextProcess = spawn('npm', ['start'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

nextProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  process.exit(code || 0);
});

