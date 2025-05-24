"use client";

import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ChatInterfaceProps {
  toUserId: string;
}

export function ChatInterface({ toUserId }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: messages } = api.message.getMessages.useQuery({ toUserId });
  const utils = api.useUtils();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const { mutate: sendMessage, isPending } = api.message.createMessage.useMutation({
    onSuccess: () => {
      form.reset();
      utils.message.getMessages.invalidate({ toUserId });
      utils.message.getUnreadMessagesCount.invalidate();
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = (values: MessageFormValues) => {
    sendMessage({
      toUserId,
      content: values.content,
    });
  };

  if (!messages) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.fromUserId === toUserId ? "" : "flex-row-reverse"
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    message.fromUserId === toUserId
                      ? message.fromUser.image ?? undefined
                      : message.toUser.image ?? undefined
                  }
                />
                <AvatarFallback>
                  {(message.fromUserId === toUserId
                    ? message.fromUser.name
                    : message.toUser.name
                  )?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.fromUserId === toUserId
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="mt-1 text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Type a message..."
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 