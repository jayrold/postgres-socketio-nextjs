import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { signUpSchema } from "~/server/auth/schema";

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, input.email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          name: input.name,
        })
        .returning();

      return { message: "User created successfully" };
    }),
}); 