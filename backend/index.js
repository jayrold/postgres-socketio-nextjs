const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Client } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.REALTIME_PORT || 4001;

// PostgreSQL client config (adjust according to your .env or setup)
const pgClient = new Client({
  host: process.env.DB_HOST || 'host.docker.internal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'realtime_db',
  port: process.env.DB_PORT || 15432,
});

async function start() {
  await pgClient.connect();

  // Listen on channels you want (e.g. 'messages_changes')
  await pgClient.query('LISTEN messages_changes');
  // Add more channels if needed
  // await pgClient.query('LISTEN posts_changes');

  // When a notification comes in from Postgres
  pgClient.on('notification', (msg) => {
    try {
      const payload = JSON.parse(msg.payload);
      // Emit via socket.io to all connected clients
      io.emit(msg.channel, payload);
      console.log(`Sent update on channel ${msg.channel}`, payload);
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
