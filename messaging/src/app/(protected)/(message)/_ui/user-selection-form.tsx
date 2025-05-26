"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export function UserSelectionForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users } = api.message.getAllUsers.useQuery();

  if (!users) return null;

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="space-y-2">
        {filteredUsers.map((user) => (
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
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No users found</p>
        )}
      </div>
    </div>
  );
} 