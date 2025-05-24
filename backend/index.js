import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'pg';
const { Client } = pkg;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://host.docker.internal:3000"
      ],
      methods: ["GET", "POST"],
    },
  });

const port = process.env.REALTIME_PORT || 4001;

// PostgreSQL client config (adjust according to your .env or setup)
const pgClient = new Client({
  host: process.env.DB_HOST || 'host.docker.internal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'realtime_db',
  port: process.env.DB_PORT || 15432,
});

const subscriptions = new Map(); // Map<socket.id, {table, user_id?}>

async function start() {
  await pgClient.connect();

  // Listen on channels you want (e.g. 'messages_changes')
  await pgClient.query('LISTEN messages_changes');
  // Add more channels if needed
  // await pgClient.query('LISTEN posts_changes');

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // When client subscribes
    socket.on('subscribe', (payload) => {
      subscriptions.set(socket.id, payload);
      console.log(`Client ${socket.id} subscribed to`, payload);
    });

    socket.on('disconnect', () => {
      subscriptions.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });

  // PG NOTIFICATION handler
  pgClient.on('notification', (msg) => {
    try {
      const payload = JSON.parse(msg.payload); // { operation, table, data }

      for (const [socketId, sub] of subscriptions.entries()) {
        if (sub.table === payload.table) {
          // Optional user filtering:
          if (sub.user_id && payload.data.user_id !== sub.user_id) continue;

          io.to(socketId).emit(payload.table, payload);
        }
      }

      console.log(`Broadcasted to filtered clients on channel ${msg.channel}`, payload);
    } catch (err) {
      console.error('Failed to parse notification payload:', err);
    }
  });

  // Start HTTP + Socket.io server
  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start().catch((err) => console.error('Failed to start:', err));

// Optional: basic express route for testing
app.get('/', (req, res) => {
  res.send('Realtime server is running');
});
