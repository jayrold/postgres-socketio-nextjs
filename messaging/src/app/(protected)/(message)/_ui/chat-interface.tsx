"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Send, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import type { EmojiClickData } from "emoji-picker-react";

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false }
);

const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface ChatInterfaceProps {
  toUserId: string;
}

export function ChatInterface({ toUserId }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: messages } = api.message.getMessages.useQuery({ toUserId });
  const { data: user } = api.message.getAllUsers.useQuery(undefined, {
    select: (users) => users.find((u) => u.id === toUserId),
  });
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const currentContent = form.getValues("content");
    form.setValue("content", currentContent + emojiData.emoji);
  };

  if (!messages || !user) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center space-x-2 border-b p-4">
        <Link href="/chat">
          <Button size="icon" variant="ghost">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Avatar>
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
        </div>
      </div>
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.fromUserId === toUserId ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.fromUserId === toUserId
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
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
                    <div className="relative">
                      <Input
                        placeholder="Type a message..."
                        {...field}
                        disabled={isPending}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <EmojiPicker onEmojiClick={onEmojiClick} />
                        </PopoverContent>
                      </Popover>
                    </div>
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