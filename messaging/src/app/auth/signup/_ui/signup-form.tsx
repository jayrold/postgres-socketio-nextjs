"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { signUpSchema, type SignUpSchema } from "~/server/auth/schema";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const signup = api.auth.signup.useMutation({
    onSuccess: () => {
      router.push("/auth/signin");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = async (data: SignUpSchema) => {
    setError(null);
    signup.mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            sign in to your account
          </Link>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="-space-y-px flex flex-col gap-2">
          <div>
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              {...register("name")}
              type="text"
              placeholder="Name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="sr-only">
              Email address
            </Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="Email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </Label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
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
          <Button
            type="submit"
            disabled={signup.isPending}
            className="w-full"
            >
            {signup.isPending ? "Creating account..." : "Sign up"}
          </Button>
        </div>
      </form>
    </div>
  );
}
