import { ChatList } from "../_ui/chat-list";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Link href="/create-message">
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <ChatList />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Select a conversation</h3>
          <p className="text-sm text-muted-foreground">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    </div>
  );
}
