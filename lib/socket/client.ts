import { io, Socket } from 'socket.io-client';

// variable pr stocker la connexion socket
let socket: Socket | null = null;

// fonction pr récupérer ou créer la connexion socket
export function getSocket(): Socket {
  if (!socket) {
    // je récupère l'URL du serveur socket depuis les variables d'env ou j'utilise localhost en dev
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

// fonction pr déconnecter le socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

