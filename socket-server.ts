import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import type { Room, PlayerInfo, Player } from './lib/game/types';
import { createEmptyBoard, dropPiece, checkWinner, getOpponentColor } from './lib/game/logic';
import { calculateEloChange } from './lib/game/elo';

// j'initialise prisma pr gérer la bdd
const prisma = new PrismaClient();
// je crée le serveur http
const httpServer = createServer((req, res) => {
  // route de santé pour que Render détecte le service
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'socket.io' }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});
// je configure socket.io avc cors pr accepter les connexions
// en production, j'utilise l'URL de l'app depuis les variables d'env
const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// map pr stocker les rooms en mémoire
const rooms = new Map<string, Room>();

// quand un client se connecte
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  // gestion de la création d'une room
  socket.on('create-room', async (playerInfo: { pseudo: string, userId: number }) => {
    // je génère un uuid pr la room
    const roomId = uuidv4();
    // je crée le joueur qui crée la room (toujours rouge)
    const player: PlayerInfo = {
      id: socket.id,
      pseudo: playerInfo.pseudo,
      color: 'red',
      isReady: false,
      userId: playerInfo.userId,
    };

    // je crée la room avc le joueur et un plateau vide
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

    // je sauvegarde la partie ds la bdd
    await prisma.game.create({
      data: {
        roomId: roomId,
        redPlayerId: playerInfo.userId,
        status: 'waiting',
      },
    });

    // j'ajoute la room ds la map et je fais rejoindre le socket
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room-created', { roomId, room });
    console.log(`Room créée: ${roomId}`);
  });

  // gestion de la connexion à une room
  socket.on('join-room', async (data: { roomId: string; pseudo: string; userId: number }) => {
    // je récupère la room depuis la map
    let room = rooms.get(data.roomId);

    // si la room n'est pas en mémoire, je la restaure depuis la bdd
    if (!room) {
      const game = await prisma.game.findUnique({ 
        where: { roomId: data.roomId },
        include: { redPlayer: true, yellowPlayer: true }
      });
      
      // si la partie n'existe pas, j'envoie une erreur
      if (!game) {
        socket.emit('error', { message: 'Cette partie n\'existe pas' });
        return;
      }

      // je reconstruis la liste des joueurs depuis la bdd
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

      // je recrée la room avc les infos de la bdd
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

      // je remets la room ds la map
      rooms.set(data.roomId, room);
      console.log(`Room restaurée depuis la BDD: ${data.roomId}`);
    }

    // je vérifie si le joueur est déjà connecté avc ce socket
    const existingPlayerBySocket = room.players.find(p => p.id === socket.id);
    if (existingPlayerBySocket) {
      socket.emit('room-joined', { room });
      return;
    }

    // je cherche si le joueur existe déjà par son userId (reconnexion)
    const existingPlayerByUser = room.players.find(p => p.userId === data.userId);

    if (existingPlayerByUser) {
      console.log(`Joueur trouvé par userId: ${data.userId}, pseudo: ${data.pseudo}`);
      // je mets à jour le socket id pr la reconnexion
      existingPlayerByUser.id = socket.id;
      existingPlayerByUser.disconnected = false;
      existingPlayerByUser.userId = data.userId;
      socket.join(data.roomId);
      
      // si la partie était en pause et que tous sont reconnectés, je reprends
      if (room.board.status === 'paused') {
        const allConnected = room.players.every(p => !p.disconnected);
        if (allConnected) {
          room.board.status = 'playing';
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

    // je vérifie que la room n'est pas pleine
    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Cette partie est complète' });
      return;
    }

    // je vérifie que la partie n'a pas déjà commencé
    if (room.board.status !== 'waiting') {
      socket.emit('error', { message: 'Cette partie a déjà commencé' });
      return;
    }

    // nouveau joueur, il est jaune
    const player: PlayerInfo = {
      id: socket.id,
      pseudo: data.pseudo,
      color: 'yellow',
      isReady: false,
      userId: data.userId,
    };

    // j'ajoute le joueur à la room
    room.players.push(player);
    socket.join(data.roomId);

    // je mets à jour la bdd avc le joueur jaune
    await prisma.game.update({
      where: { roomId: data.roomId },
      data: { yellowPlayerId: data.userId },
    });

    socket.emit('room-joined', { room });
    io.to(data.roomId).emit('player-joined', { room });
    console.log(`Joueur rejoint la room ${data.roomId}`);
  });

  // gestion du statut "prêt" d'un joueur
  socket.on('player-ready', async (data: { roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;

    // je marque le joueur comme prêt
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
    }

    // si les 2 joueurs sont prêts, je démarre la partie
    if (room.players.length === 2 && room.players.every(p => p.isReady)) {
      room.board.status = 'playing';
      
      // je mets à jour la bdd
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
      // sinon j'envoie juste la mise à jour
      io.to(data.roomId).emit('player-ready-update', { room });
    }
  });

  // gestion d'un coup joué
  socket.on('make-move', async (data: { roomId: string; column: number }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;

    // je vérifie que la partie est en cours
    if (room.board.status !== 'playing') {
      socket.emit('error', { message: 'La partie n\'est pas en cours' });
      return;
    }

    // je vérifie qu'aucun joueur n'est déconnecté
    const hasDisconnectedPlayer = room.players.some(p => p.disconnected);
    if (hasDisconnectedPlayer) {
      socket.emit('error', { message: 'Un joueur est déconnecté. Attendez sa reconnexion.' });
      return;
    }

    // je vérifie que c'est bien le tour du joueur
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.color !== room.board.currentPlayer) {
      socket.emit('error', { message: 'Ce n\'est pas votre tour' });
      return;
    }

    // je pose le jeton
    const result = dropPiece(room.board.grid, data.column, room.board.currentPlayer);
    
    if (!result) {
      socket.emit('error', { message: 'Colonne pleine ou invalide' });
      return;
    }

    // je mets à jour le plateau et je vérifie s'il y a un gagnant
    room.board.grid = result.newBoard;
    const winner = checkWinner(result.newBoard, result.row, data.column);

    // si y a un gagnant, je finis la partie et je mets à jour les stats
    if (winner) {
      room.board.winner = winner;
      room.board.status = 'finished';
      
      // je récupère la partie depuis la bdd pr avoir les infos des joueurs
      const game = await prisma.game.findUnique({
        where: { roomId: data.roomId },
        include: { redPlayer: true, yellowPlayer: true }
      });

      if (game && game.yellowPlayerId) {
        try {
          // si match nul, j'incrémente les draws
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
            // sinon je calcule les changements d'elo et je mets à jour
            const winnerId = winner === 'red' ? game.redPlayerId : game.yellowPlayerId;
            const loserId = winner === 'red' ? game.yellowPlayerId : game.redPlayerId;
            
            const winnerUser = await prisma.user.findUnique({ where: { id: winnerId } });
            const loserUser = await prisma.user.findUnique({ where: { id: loserId } });
            
            if (winnerUser && loserUser) {
              // je calcule le changement d'elo
              const eloChange = calculateEloChange(winnerUser.elo, loserUser.elo, false);
              
              // je mets à jour les stats du gagnant
              await prisma.user.update({
                where: { id: winnerId },
                data: { 
                  wins: { increment: 1 },
                  elo: { increment: eloChange.winnerChange }
                }
              });
              
              // je mets à jour les stats du perdant
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
      
      // je mets à jour la partie ds la bdd
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
      // pas de gagnant, je change de joueur et j'envoie le coup
      room.board.currentPlayer = getOpponentColor(room.board.currentPlayer);
      io.to(data.roomId).emit('move-made', { room, column: data.column, row: result.row });
    }
  });

  // gestion de la déconnexion d'un joueur
  socket.on('disconnect', async () => {
    console.log('Client déconnecté:', socket.id);
    
    // je parcours toutes les rooms pr trouver celle du joueur
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        
        // si la partie est en cours et qu'il y a 2 joueurs, je déclare l'autre gagnant
        if (room.board.status === 'playing' && room.players.length === 2) {
          const remainingPlayer = room.players.find(p => p.id !== socket.id);
          
          if (remainingPlayer) {
            room.board.winner = remainingPlayer.color;
            room.board.status = 'finished';
            disconnectedPlayer.disconnected = true;
            
            // je récupère la partie depuis la bdd
            const game = await prisma.game.findUnique({
              where: { roomId: roomId },
              include: { redPlayer: true, yellowPlayer: true }
            });

            if (game && game.yellowPlayerId) {
              try {
                // je calcule qui a gagné et qui a perdu
                const winnerId = remainingPlayer.color === 'red' ? game.redPlayerId : game.yellowPlayerId;
                const loserId = remainingPlayer.color === 'red' ? game.yellowPlayerId : game.redPlayerId;
                
                const winnerUser = await prisma.user.findUnique({ where: { id: winnerId } });
                const loserUser = await prisma.user.findUnique({ where: { id: loserId } });
                
                if (winnerUser && loserUser) {
                  // je calcule le changement d'elo
                  const eloChange = calculateEloChange(winnerUser.elo, loserUser.elo, false);
                  
                  // je mets à jour les stats
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
                  
                  console.log(`Victoire par abandon: ${winnerUser.pseudo} (+${eloChange.winnerChange} ELO), Défaite: ${loserUser.pseudo} (${eloChange.loserChange} ELO)`);
                }
              } catch (error) {
                console.error('Erreur mise à jour stats après abandon:', error);
              }
            }
            
            // je mets à jour la partie ds la bdd
            await prisma.game.update({
              where: { roomId: roomId },
              data: { 
                status: 'finished',
                winner: remainingPlayer.color,
                finishedAt: new Date()
              },
            });

            // j'envoie l'événement de fin de partie
            io.to(roomId).emit('game-over', { 
              room, 
              winner: remainingPlayer.color,
              reason: 'abandon'
            });
            
            console.log(`Partie terminée par abandon dans la room ${roomId}, vainqueur: ${remainingPlayer.pseudo}`);
          }
        } else if (room.board.status === 'waiting' || room.board.status === 'paused') {
          // si la partie n'a pas commencé ou est en pause, je retire juste le joueur
          room.players.splice(playerIndex, 1);
          
          // si plus personne, je supprime la room
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

// je récupère le port depuis les variables d'env (Render utilise PORT, sinon SOCKET_PORT, sinon 3001)
// je convertis en nombre car process.env retourne des strings
const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || '3001', 10);

// je démarre le serveur (0.0.0.0 pour que Render puisse le détecter)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
  console.log(`📍 Accessible sur http://0.0.0.0:${PORT}`);
});

