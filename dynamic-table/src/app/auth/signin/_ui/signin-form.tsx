"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { signInSchema, type SignInSchema } from "~/server/auth/schema";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInSchema) => {
    try {
      setIsPending(true);
      setError(null);

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      // Redirect to the callback URL or dashboard
      const callbackUrl = searchParams.get("callbackUrl") ?? "/";
      router.push(callbackUrl);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              {...register("email")}
              type="email"
              className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
} 