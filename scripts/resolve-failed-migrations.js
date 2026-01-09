#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Script de résolution des migrations échouées');
console.log('');

function checkMigrationExists(migrationName) {
  const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', migrationName);
  const migrationFile = path.join(migrationPath, 'migration.sql');
  return fs.existsSync(migrationFile);
}

console.log('🔍 Vérification des migrations...');
console.log('');

const failedMigrations = [
  '20251203193630_init_user',
  '20251203215341_add_email_verification',
  '20251204075206_add_game_history',
  '20251217131158_add_user_stats'
];

const validMigrations = failedMigrations.filter(m => checkMigrationExists(m));
const invalidMigrations = failedMigrations.filter(m => !checkMigrationExists(m));

if (invalidMigrations.length > 0) {
  console.log('⚠️  Migrations manquantes (seront ignorées):', invalidMigrations.join(', '));
  console.log('');
}

if (validMigrations.length === 0) {
  console.log('ℹ️  Aucune migration MySQL à résoudre');
  console.log('');
} else {
  console.log('📋 Migrations MySQL à résoudre:', validMigrations.join(', '));
  console.log('');
  console.log('Ce script marque les migrations MySQL échouées comme résolues');
  console.log('car elles ne sont plus nécessaires (migration PostgreSQL déjà appliquée)');
  console.log('');

  let resolvedCount = 0;
  let skippedCount = 0;
  
  for (const migration of validMigrations) {
    try {
      console.log(`🔄 Résolution de la migration ${migration}...`);
      const output = execSync(`npx prisma migrate resolve --applied ${migration} 2>&1`, {
        stdio: 'pipe',
        env: process.env,
        encoding: 'utf8'
      });
      
      const outputLower = output.toLowerCase();
      if (outputLower.includes('p3014') || 
          outputLower.includes('not found') || 
          outputLower.includes('does not exist') ||
          outputLower.includes('no migration found')) {
        console.log(`ℹ️  Migration ${migration} n'existe pas dans la base (jamais appliquée, c'est normal)`);
        skippedCount++;
      } else if (outputLower.includes('already') || outputLower.includes('resolved')) {
        console.log(`ℹ️  Migration ${migration} déjà résolue`);
        skippedCount++;
      } else {
        console.log(`✅ Migration ${migration} marquée comme appliquée`);
        resolvedCount++;
      }
    } catch (error) {
      const exitCode = error.status || error.code;
      const errorOutput = (error.stdout?.toString() || error.stderr?.toString() || error.message || '').toLowerCase();
      
      if (exitCode === 1 && (
          errorOutput.includes('p3014') || 
          errorOutput.includes('not found') || 
          errorOutput.includes('does not exist') ||
          errorOutput.includes('no migration found'))) {
        console.log(`ℹ️  Migration ${migration} n'existe pas dans la base (jamais appliquée, c'est normal)`);
        skippedCount++;
      } else if (errorOutput.includes('already applied') || errorOutput.includes('already resolved')) {
        console.log(`ℹ️  Migration ${migration} déjà résolue`);
        skippedCount++;
      } else {
        console.log(`ℹ️  Migration ${migration} ignorée (n'existe pas dans la base de données)`);
        skippedCount++;
      }
    }
    console.log('');
  }

  if (resolvedCount > 0) {
    console.log(`✅ ${resolvedCount} migration(s) traitée(s)`);
  }
  if (skippedCount > 0) {
    console.log(`ℹ️  ${skippedCount} migration(s) ignorée(s) (n'existent pas dans la base)`);
  }
  if (resolvedCount > 0 || skippedCount > 0) {
    console.log('');
  }
}

console.log('🔄 Vérification de l\'état des migrations...');
try {
  execSync('npx prisma migrate status', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.log('');
}

console.log('');
console.log('🔄 Tentative de déploiement des migrations...');
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('');
  console.log('✅ Toutes les migrations ont été appliquées avec succès');
} catch (error) {
  const errorMessage = error.message || error.toString();
  console.error('');
  console.error('❌ Erreur lors du déploiement:', errorMessage);
  
  if (errorMessage.includes('P3009') || errorMessage.includes('failed migrations')) {
    console.error('');
    console.error('💡 Il y a encore des migrations échouées. Essayez de les résoudre manuellement:');
    console.error('   npx prisma migrate resolve --applied <migration_name>');
  } else if (errorMessage.includes('P3015')) {
    console.error('');
    console.error('💡 Il y a un dossier de migration vide. Supprimez-le:');
    console.error('   rmdir prisma/migrations/<nom_du_dossier_vide>');
  }
  
  console.error('');
  console.error('💡 Autres commandes utiles:');
  console.error('   1. Vérifier l\'état: npx prisma migrate status');
  console.error('   2. Voir les migrations: ls prisma/migrations/');
  process.exit(1);
}

