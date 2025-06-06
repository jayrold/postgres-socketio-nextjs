'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/session-context";

export function RealtimeMessages() {
  const utils = api.useUtils();
  const { session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4001');
    const tableName = 'dynamic-table_chat_message';
    console.log('connecting...');
    socket.on('connect', () => {
        socket.emit('subscribe', { table: tableName });
    
        // Optional: subscribe to specific user_id
        // socket.emit('subscribe', { table: 'messages', user_id: 123 });
      });


    socket.on(tableName, (data) => {
      console.log('New realtime message:', data);
      
      // Invalidate relevant queries to trigger a refetch
      void utils.message.getMessages.invalidate();
      void utils.message.getUnreadMessagesCount.invalidate();
      void utils.message.getUsers.invalidate();
    });
  
    return () => {
      socket.disconnect();
    };
  }, [utils, session?.user?.id]);

  // This component doesn't render anything
  return null;
} 