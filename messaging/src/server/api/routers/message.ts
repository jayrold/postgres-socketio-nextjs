import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, or, not, sql, isNull } from "drizzle-orm";
import { users, messages } from "../../db/schema";

export const messageRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
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

  getUnreadMessagesCount: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;

    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.toUserId, currentUserId),
          isNull(messages.readAt)
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

      const allMessages = await ctx.db
        .select({
          id: messages.id,
          content: messages.content,
          fromUserId: messages.fromUserId,
          toUserId: messages.toUserId,
          createdAt: messages.createdAt,
          updatedAt: messages.updatedAt,
          readAt: messages.readAt,
          fromUser: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
          toUser: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(messages)
        .where(
          or(
            and(
              eq(messages.fromUserId, currentUserId),
              eq(messages.toUserId, input.toUserId)
            ),
            and(
              eq(messages.fromUserId, input.toUserId),
              eq(messages.toUserId, currentUserId)
            )
          )
        )
        .orderBy(messages.createdAt);

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

      // Fetch the complete message with user details
      const [completeMessage] = await ctx.db
        .select({
          id: messages.id,
          content: messages.content,
          fromUserId: messages.fromUserId,
          toUserId: messages.toUserId,
          createdAt: messages.createdAt,
          updatedAt: messages.updatedAt,
          readAt: messages.readAt,
          fromUser: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
          toUser: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(messages)
        .where(eq(messages.id, newMessage.id));

      if (!completeMessage) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch created message",
        });
      }

      return completeMessage;
    }),
});
