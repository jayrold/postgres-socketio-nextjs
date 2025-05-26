import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, or, not, sql, isNull, desc } from "drizzle-orm";
import { users, messages } from "../../db/schema";

export const messageRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;
    
    const allUsers = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(not(eq(users.id, currentUserId)));

    return allUsers;
  }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;
    
    const chatUsers = await ctx.db.query.messages.findMany({
      where: or(
        eq(messages.fromUserId, currentUserId),
        eq(messages.toUserId, currentUserId)
      ),
      orderBy: (messages) => [desc(messages.createdAt)],
      with: {
        fromUser: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        toUser: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Get unique users and their latest message
    const uniqueUsers = new Map();
    chatUsers.forEach((message) => {
      const otherUser = message.fromUserId === currentUserId ? message.toUser : message.fromUser;
      if (!uniqueUsers.has(otherUser.id)) {
        uniqueUsers.set(otherUser.id, {
          user: otherUser,
          latestMessage: message,
          unreadCount: 0, // Initialize unread count
        });
      }
    });

    // Get unread counts for all users in a single query
    const unreadCounts = await ctx.db
      .select({
        fromUserId: messages.fromUserId,
        count: sql<number>`count(*)`,
      })
      .from(messages)
      .where(
        and(
          eq(messages.toUserId, currentUserId),
          isNull(messages.readAt)
        )
      )
      .groupBy(messages.fromUserId);

    // Update unread counts
    unreadCounts.forEach(({ fromUserId, count }) => {
      const userData = uniqueUsers.get(fromUserId);
      if (userData) {
        userData.unreadCount = count;
      }
    });

    return Array.from(uniqueUsers.values());
  }),

  getUnreadMessagesCount: protectedProcedure
    .input(
      z.object({
        fromUserId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const result = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          and(
            eq(messages.toUserId, currentUserId),
            isNull(messages.readAt),
            input.fromUserId ? eq(messages.fromUserId, input.fromUserId) : undefined
          )
        );

      return result[0]?.count ?? 0;
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        toUserId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const allMessages = await ctx.db.query.messages.findMany({
        where: or(
          and(
            eq(messages.fromUserId, currentUserId),
            eq(messages.toUserId, input.toUserId)
          ),
          and(
            eq(messages.fromUserId, input.toUserId),
            eq(messages.toUserId, currentUserId)
          )
        ),
        orderBy: (messages) => [messages.createdAt],
        with: {
          fromUser: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          toUser: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Mark messages as read
      await ctx.db
        .update(messages)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(messages.fromUserId, input.toUserId),
            eq(messages.toUserId, currentUserId),
            isNull(messages.readAt)
          )
        );

      return allMessages;
    }),

  createMessage: protectedProcedure
    .input(
      z.object({
        toUserId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const [newMessage] = await ctx.db
        .insert(messages)
        .values({
          content: input.content,
          fromUserId: currentUserId,
          toUserId: input.toUserId,
        })
        .returning();

      if (!newMessage) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create message",
        });
      }

      const completeMessage = await ctx.db.query.messages.findFirst({
        where: eq(messages.id, newMessage.id),
        with: {
          fromUser: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
          toUser: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!completeMessage) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch created message",
        });
      }

      return completeMessage;
    }),
});
