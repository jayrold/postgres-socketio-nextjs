'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

let socket: Socket;

export default function RealtimeClient() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4001');

    socket.on('messages_changes', (data: Message) => {
      console.log('Realtime message:', data);
      setMessages((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <ul className="space-y-4">
        {messages.map((msg) => (
          <li key={Math.random()} className="bg-white p-4 rounded shadow">
            <pre className="whitespace-pre-wrap text-black">{JSON.stringify(msg, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
