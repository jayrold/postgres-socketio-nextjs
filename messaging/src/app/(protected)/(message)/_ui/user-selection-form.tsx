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
  const { data: users } = api.message.getUsers.useQuery();

  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredUsers?.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers?.map((user) => (
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
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 