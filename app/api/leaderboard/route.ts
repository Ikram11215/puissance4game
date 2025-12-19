import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// route api pr récupérer le classement
export async function GET() {
  try {
    // je récupère les utilisateurs vérifiés qui ont joué au moins une partie
    const leaderboard = await prisma.user.findMany({
      where: {
        emailVerified: true,
        OR: [
          { wins: { gt: 0 } },
          { losses: { gt: 0 } },
          { draws: { gt: 0 } },
        ],
      },
      select: {
        id: true,
        pseudo: true,
        firstname: true,
        lastname: true,
        wins: true,
        losses: true,
        draws: true,
        elo: true,
      },
      // je trie par elo décroissant puis par wins
      orderBy: [
        { elo: 'desc' },
        { wins: 'desc' },
      ],
      take: 100,
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Erreur récupération classement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

