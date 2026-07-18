import { io, Socket } from 'socket.io-client';

// Change this to your actual public NestJS Railway domain
const SOCKET_URL = 'https://collaborate-backend-production.up.railway.app';

export const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true, // Connects automatically when the app loads
});

// Helper function to send messages from any UI screen
export const sendLiveUpdate = (text: string) => {
  socket.emit('sendMessage', { message: text });
};
