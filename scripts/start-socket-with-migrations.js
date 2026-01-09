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
  const errorMessage = error.message || error.toString();
  console.error('⚠️  Erreur lors des migrations:', errorMessage);
  
  if (errorMessage.includes('P3009') || errorMessage.includes('failed migrations')) {
    console.log('🔧 Tentative de résolution des migrations échouées...');
    
    try {
      execSync('npx prisma migrate resolve --applied 20251203193630_init_user', {
        stdio: 'inherit',
        env: process.env
      });
      console.log('✅ Migration échouée marquée comme résolue');
      
      console.log('🔄 Nouvelle tentative de déploiement des migrations...');
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: process.env
      });
      console.log('✅ Migrations Prisma appliquées avec succès');
    } catch (resolveError) {
      console.error('⚠️  Impossible de résoudre automatiquement les migrations échouées');
      console.error('💡 Vous devrez peut-être résoudre manuellement les migrations dans la base de données');
      console.error('💡 Commande à exécuter: npx prisma migrate resolve --applied <migration_name>');
    }
  } else {
    console.log('⚠️  L\'erreur peut être normale si les migrations sont déjà appliquées');
  }
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
