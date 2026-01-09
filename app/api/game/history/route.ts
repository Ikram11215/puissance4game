import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId requis' }, { status: 400 });
    }

    const userIdNum = parseInt(userId);

    const games = await prisma.game.findMany({
      where: {
        OR: [
          { redPlayerId: userIdNum },
          { yellowPlayerId: userIdNum }
        ]
      },
      include: {
        redPlayer: {
          select: { pseudo: true, firstname: true, lastname: true }
        },
        yellowPlayer: {
          select: { pseudo: true, firstname: true, lastname: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const finishedGames = games.filter(g => g.status === 'finished');
    
    const stats = {
      wins: finishedGames.filter(g => {
        if (g.winner === 'draw') return false;
        if (g.redPlayerId === userIdNum && g.winner === 'red') return true;
        if (g.yellowPlayerId === userIdNum && g.winner === 'yellow') return true;
        return false;
      }).length,
      losses: finishedGames.filter(g => {
        if (g.winner === 'draw') return false;
        if (g.redPlayerId === userIdNum && g.winner === 'yellow') return true;
        if (g.yellowPlayerId === userIdNum && g.winner === 'red') return true;
        return false;
      }).length,
      draws: finishedGames.filter(g => g.winner === 'draw').length
    };

    return NextResponse.json({ games, stats });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
