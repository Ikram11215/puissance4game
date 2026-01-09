#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Script de résolution des migrations échouées');
console.log('');
console.log('Ce script marque les migrations MySQL échouées comme résolues');
console.log('car elles ne sont plus nécessaires (migration PostgreSQL déjà appliquée)');
console.log('');

const failedMigrations = [
  '20251203193630_init_user',
  '20251203215341_add_email_verification',
  '20251204075206_add_game_history',
  '20251217131158_add_user_stats'
];

console.log('📋 Migrations MySQL à résoudre:', failedMigrations.join(', '));
console.log('');

let resolvedCount = 0;
for (const migration of failedMigrations) {
  try {
    console.log(`🔄 Résolution de la migration ${migration}...`);
    execSync(`npx prisma migrate resolve --applied ${migration}`, {
      stdio: 'pipe',
      env: process.env
    });
    console.log(`✅ Migration ${migration} marquée comme appliquée`);
    resolvedCount++;
  } catch (error) {
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
    if (errorOutput.includes('not found') || errorOutput.includes('does not exist')) {
      console.log(`ℹ️  Migration ${migration} n'existe pas dans la base (déjà résolue ou non appliquée)`);
    } else {
      console.error(`⚠️  Erreur lors de la résolution de ${migration}:`, errorOutput);
    }
  }
  console.log('');
}

if (resolvedCount > 0) {
  console.log(`✅ ${resolvedCount} migration(s) résolue(s)`);
  console.log('');
}

console.log('🔄 Tentative de déploiement des migrations restantes...');
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('');
  console.log('✅ Toutes les migrations ont été appliquées avec succès');
} catch (error) {
  console.error('');
  console.error('❌ Erreur lors du déploiement:', error.message);
  console.error('');
  console.error('💡 Si le problème persiste, vous pouvez:');
  console.error('   1. Vérifier l\'état des migrations: npx prisma migrate status');
  console.error('   2. Résoudre manuellement: npx prisma migrate resolve --applied <migration_name>');
  console.error('   3. Vérifier que la migration PostgreSQL est bien appliquée');
  process.exit(1);
}

