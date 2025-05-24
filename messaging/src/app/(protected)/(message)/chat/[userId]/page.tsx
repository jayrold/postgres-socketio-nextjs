import { ChatInterface } from "../../_ui/chat-interface";

interface ChatPageProps {
  params: {
    userId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <div className="container mx-auto h-screen max-w-4xl">
      <ChatInterface toUserId={params.userId} />
    </div>
  );
} 