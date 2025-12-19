import { io, Socket } from 'socket.io-client';

// variable pr stocker la connexion socket
let socket: Socket | null = null;

// fonction pr récupérer ou créer la connexion socket
export function getSocket(): Socket {
  if (!socket) {
    // je me connecte au serveur socket sur le port 3001
    socket = io('http://localhost:3001', {
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

