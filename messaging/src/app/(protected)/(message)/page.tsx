import { ChatList } from "./_ui/chat-list";

export default function MessagesPage() {
  return (
    <div className="container mx-auto h-screen max-w-4xl">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <ChatList />
      </div>
    </div>
  );
} 