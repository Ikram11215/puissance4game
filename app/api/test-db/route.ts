import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test de connexion
    await prisma.$connect();
    
    // Test des tables
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    
    return NextResponse.json({
      success: true,
      message: "✅ Base de données accessible - Les migrations sont OK !",
      database: {
        connected: true,
        tables: {
          user: {
            exists: true,
            count: userCount,
            status: "✅ OK"
          },
          game: {
            exists: true,
            count: gameCount,
            status: "✅ OK"
          }
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "❌ Erreur de base de données",
      error: error.message,
      hint: "Les migrations n'ont peut-être pas été appliquées correctement."
    }, { status: 500 });
  }
}

