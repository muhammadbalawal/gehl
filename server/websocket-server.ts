import { WebSocketServer } from 'ws';
import http from 'http';

const port = 8080;

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection from:', req.socket.remoteAddress);

  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());
    if (msg.event === 'start') {
      console.log('Media stream started:', msg);
    } else if (msg.event === 'media') {
      // You receive raw audio in base64-encoded format
      const audio = msg.media.payload;
      // Forward this to AssemblyAI/Deepgram/etc.
    } else if (msg.event === 'stop') {
      console.log('Media stream stopped');
    }
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});

server.listen(port, () => {
  console.log(`WebSocket server listening on ws://localhost:${port}`);
});
