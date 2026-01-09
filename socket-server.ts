import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import type { Room, PlayerInfo, Player } from './lib/game/types';
import { createEmptyBoard, dropPiece, checkWinner, getOpponentColor } from './lib/game/logic';
import { calculateEloChange } from './lib/game/elo';

const prisma = new PrismaClient();

const httpServer = createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'socket.io' }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('create-room', async (playerInfo: { pseudo: string, userId: number }) => {
    const roomId = uuidv4();
    const player: PlayerInfo = {
      id: socket.id,
      pseudo: playerInfo.pseudo,
      color: 'red',
      isReady: false,
      userId: playerInfo.userId,
    };

    const room: Room = {
      id: roomId,
      players: [player],
      board: {
        grid: createEmptyBoard(),
        currentPlayer: 'red',
        winner: null,
        status: 'waiting',
      },
      createdAt: new Date(),
    };

    await prisma.game.create({
      data: {
        roomId: roomId,
        redPlayerId: playerInfo.userId,
        status: 'waiting',
      },
    });

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room-created', { roomId, room });
    console.log(`Room créée: ${roomId}`);
  });

  socket.on('join-room', async (data: { roomId: string; pseudo: string; userId: number }) => {
    let room = rooms.get(data.roomId);

    if (!room) {
      const game = await prisma.game.findUnique({ 
        where: { roomId: data.roomId },
        include: { redPlayer: true, yellowPlayer: true }
      });
      
      if (!game) {
        socket.emit('error', { message: 'Cette partie n\'existe pas' });
        return;
      }

      const players: PlayerInfo[] = [];
      
      if (game.redPlayer) {
        players.push({
          id: '',
          pseudo: game.redPlayer.pseudo,
          color: 'red',
          isReady: false,
          userId: game.redPlayerId,
          disconnected: game.status === 'paused',
        });
      }
      
      if (game.yellowPlayer) {
        players.push({
          id: '',
          pseudo: game.yellowPlayer.pseudo,
          color: 'yellow',
          isReady: false,
          userId: game.yellowPlayerId!,
          disconnected: game.status === 'paused',
        });
      }

      room = {
        id: data.roomId,
        players,
        board: {
          grid: createEmptyBoard(),
          currentPlayer: game.winner === null ? (game.status === 'playing' ? 'red' : 'red') : 'red',
          winner: game.winner as Player | 'draw' | null,
          status: game.status as any,
        },
        createdAt: game.createdAt,
      };

      rooms.set(data.roomId, room);
      console.log(`Room restaurée depuis la BDD: ${data.roomId}`);
    }

    const existingPlayerBySocket = room.players.find(p => p.id === socket.id);
    if (existingPlayerBySocket) {
      socket.emit('room-joined', { room });
      return;
    }

    const existingPlayerByUser = room.players.find(p => p.userId === data.userId);

    if (existingPlayerByUser) {
      console.log(`Joueur trouvé par userId: ${data.userId}, pseudo: ${data.pseudo}`);
      existingPlayerByUser.id = socket.id;
      existingPlayerByUser.disconnected = false;
      existingPlayerByUser.userId = data.userId;
      socket.join(data.roomId);
      
      if (room.board.status === 'paused') {
        const allConnected = room.players.every(p => !p.disconnected);
        if (allConnected) {
          room.board.status = 'playing';
          
          await prisma.game.update({
            where: { roomId: data.roomId },
            data: { 
              status: 'playing'
            },
          });
          
          io.to(data.roomId).emit('player-reconnected', { room });
          console.log(`Joueur reconnecté, partie reprend dans la room ${data.roomId}`);
        } else {
          socket.emit('room-joined', { room });
        }
      } else {
        socket.emit('room-joined', { room });
      }
      console.log(`Joueur rejoint la room ${data.roomId} (reconnexion)`);
      return;
    }

    console.log(`Joueur non trouvé, userId cherché: ${data.userId}, players:`, room.players.map(p => ({ userId: p.userId, pseudo: p.pseudo })));

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Cette partie est complète' });
      return;
    }

    if (room.board.status !== 'waiting') {
      socket.emit('error', { message: 'Cette partie a déjà commencé' });
      return;
    }

    const player: PlayerInfo = {
      id: socket.id,
      pseudo: data.pseudo,
      color: 'yellow',
      isReady: false,
      userId: data.userId,
    };

    room.players.push(player);
    socket.join(data.roomId);

    await prisma.game.update({
      where: { roomId: data.roomId },
      data: { yellowPlayerId: data.userId },
    });

    socket.emit('room-joined', { room });
    io.to(data.roomId).emit('player-joined', { room });
    console.log(`Joueur rejoint la room ${data.roomId}`);
  });

  socket.on('player-ready', async (data: { roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    if (room.players.length === 2 && room.players.every(p => p.isReady)) {
      room.board.status = 'playing';
      
      await prisma.game.update({
        where: { roomId: data.roomId },
        data: { 
          status: 'playing',
          startedAt: new Date()
        },
      });

      io.to(data.roomId).emit('game-start', { room });
      console.log(`Partie commence dans la room ${data.roomId}`);
    } else {
      io.to(data.roomId).emit('player-ready-update', { room });
    }
  });

  socket.on('request-rematch', async (data: { roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    io.to(data.roomId).emit('rematch-requested', { room });

    if (room.players.length === 2 && room.players.every(p => p.isReady)) {
      room.board = {
        grid: createEmptyBoard(),
        currentPlayer: 'red',
        winner: null,
        status: 'playing'
      };

      room.players.forEach(p => {
        p.isReady = false;
      });

      await prisma.game.update({
        where: { roomId: data.roomId },
        data: { 
          status: 'playing',
          winner: null,
          startedAt: new Date(),
          finishedAt: null
        },
      });

      io.to(data.roomId).emit('rematch-started', { room });
      console.log(`Partie relancée (rematch) dans la room ${data.roomId}`);
    }
  });

  socket.on('make-move', async (data: { roomId: string; column: number }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;

    if (room.board.status !== 'playing') {
      socket.emit('error', { message: 'La partie n\'est pas en cours' });
      return;
    }

    const hasDisconnectedPlayer = room.players.some(p => p.disconnected);
    if (hasDisconnectedPlayer) {
      socket.emit('error', { message: 'Un joueur est déconnecté. Attendez sa reconnexion.' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.color !== room.board.currentPlayer) {
      socket.emit('error', { message: 'Ce n\'est pas votre tour' });
      return;
    }

    const result = dropPiece(room.board.grid, data.column, room.board.currentPlayer);
    
    if (!result) {
      socket.emit('error', { message: 'Colonne pleine ou invalide' });
      return;
    }

    room.board.grid = result.newBoard;
    const winner = checkWinner(result.newBoard, result.row, data.column);

    if (winner) {
      room.board.winner = winner;
      room.board.status = 'finished';
      
      const game = await prisma.game.findUnique({
        where: { roomId: data.roomId },
        include: { redPlayer: true, yellowPlayer: true }
      });

      if (game && game.yellowPlayerId) {
        try {
          if (winner === 'draw') {
            await prisma.user.update({
              where: { id: game.redPlayerId },
              data: { draws: { increment: 1 } }
            });
            await prisma.user.update({
              where: { id: game.yellowPlayerId },
              data: { draws: { increment: 1 } }
            });
            console.log(`Match nul: stats mises à jour pour ${game.redPlayerId} et ${game.yellowPlayerId}`);
          } else {
            const winnerId = winner === 'red' ? game.redPlayerId : game.yellowPlayerId;
            const loserId = winner === 'red' ? game.yellowPlayerId : game.redPlayerId;
            
            const winnerUser = await prisma.user.findUnique({ where: { id: winnerId } });
            const loserUser = await prisma.user.findUnique({ where: { id: loserId } });
            
            if (winnerUser && loserUser) {
              const eloChange = calculateEloChange(winnerUser.elo, loserUser.elo, false);
              
              await prisma.user.update({
                where: { id: winnerId },
                data: { 
                  wins: { increment: 1 },
                  elo: { increment: eloChange.winnerChange }
                }
              });
              
              await prisma.user.update({
                where: { id: loserId },
                data: { 
                  losses: { increment: 1 },
                  elo: { increment: eloChange.loserChange }
                }
              });
              
              console.log(`Victoire: ${winnerUser.pseudo} (+${eloChange.winnerChange} ELO), Défaite: ${loserUser.pseudo} (${eloChange.loserChange} ELO)`);
            } else {
              console.error(`Joueurs non trouvés: winnerId=${winnerId}, loserId=${loserId}`);
            }
          }
        } catch (error) {
          console.error('Erreur mise à jour stats:', error);
        }
      } else {
        console.error('Game ou yellowPlayerId manquant:', { game: !!game, yellowPlayerId: game?.yellowPlayerId });
      }
      
      await prisma.game.update({
        where: { roomId: data.roomId },
        data: { 
          status: 'finished',
          winner: winner === 'draw' ? 'draw' : winner,
          finishedAt: new Date()
        },
      });

      io.to(data.roomId).emit('game-over', { room, winner });
    } else {
      room.board.currentPlayer = getOpponentColor(room.board.currentPlayer);
      io.to(data.roomId).emit('move-made', { room, column: data.column, row: result.row });
    }
  });

  socket.on('disconnect', async () => {
    console.log('Client déconnecté:', socket.id);
    
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        
        if (room.board.status === 'playing' && room.players.length === 2) {
          const remainingPlayer = room.players.find(p => p.id !== socket.id);
          
          if (remainingPlayer) {
            disconnectedPlayer.disconnected = true;
            disconnectedPlayer.id = '';
            room.board.status = 'paused';
            
            await prisma.game.update({
              where: { roomId: roomId },
              data: { 
                status: 'paused'
              },
            });

            io.to(roomId).emit('player-disconnected', { 
              room, 
              disconnectedPlayer: disconnectedPlayer.pseudo
            });
            
            console.log(`Joueur déconnecté dans la room ${roomId}: ${disconnectedPlayer.pseudo}, partie en pause`);
          }
        } else if (room.board.status === 'waiting' || room.board.status === 'paused') {
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} supprimée`);
          } else {
            io.to(roomId).emit('player-left', { room });
          }
        }
      }
    }
  });

});

const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || '3001', 10);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
  console.log(`📍 Accessible sur http://0.0.0.0:${PORT}`);
});
