"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";

export function ChatList() {
  const router = useRouter();
  const { data: chatUsers } = api.message.getUsers.useQuery();

  if (!chatUsers) return null;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-2 p-4">
        {chatUsers.map(({ user, latestMessage, unreadCount }) => (
          <button
            key={user.id}
            onClick={() => router.push(`/chat/${user.id}`)}
            className="flex w-full items-center space-x-4 rounded-lg p-3 hover:bg-accent"
          >
            <Avatar>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestMessage.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {latestMessage.content}
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {unreadCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
} 