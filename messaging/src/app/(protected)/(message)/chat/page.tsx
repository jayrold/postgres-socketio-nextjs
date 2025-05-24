import { ChatList } from "../_ui/chat-list";

export default function ChatPage() {
  return (
    <div className="container mx-auto h-screen max-w-6xl">
      <div className="flex h-full">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r">
          <div className="border-b p-4">
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <ChatList />
        </div>

        {/* Welcome Message */}
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Welcome to Messages</h2>
            <p className="mt-2 text-muted-foreground">
              Select a conversation from the list to start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
