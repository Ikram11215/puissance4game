#!/usr/bin/env node

const { execSync } = require('child_process');
const { spawn } = require('child_process');

console.log('🔄 Lancement des migrations Prisma...');

try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ Migrations Prisma appliquées avec succès');
} catch (error) {
  console.error('⚠️  Erreur lors des migrations (peut être normal si déjà appliquées):', error.message);
}

console.log('🚀 Démarrage du serveur Socket.io...');

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
