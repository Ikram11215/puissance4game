import { PrismaClient } from '@prisma/client';

// je crée un type pr stocker prisma globalement (pr éviter les multiples instances)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// je récupère l'instance existante ou j'en crée une nouvelle
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// en dev, je garde l'instance globale pr éviter les reconnexions
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

