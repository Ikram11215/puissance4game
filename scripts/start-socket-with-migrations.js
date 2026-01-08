#!/usr/bin/env node

// Script pour lancer les migrations Prisma puis démarrer le serveur Socket.io
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

console.log('🚀 Démarrage du serveur Socket.io...');

// Démarre le serveur Socket.io
const socketProcess = spawn('npm', ['run', 'start:socket'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

socketProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
});

socketProcess.on('exit', (code) => {
  process.exit(code || 0);
});

