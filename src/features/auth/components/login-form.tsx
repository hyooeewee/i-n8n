"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type loginFormValues = z.infer<typeof loginSchema>;
const LoginForm = () => {
  const router = useRouter();
  const form = useForm<loginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (values: loginFormValues) => {
    console.log(values);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
  };
  const isPending = form.formState.isSubmitting;
  const signInWith = async (provider: "google" | "github") => {
    await authClient.signIn.social(
      { provider },
      {
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          toast.error(`Something went wrong: ${ctx.error.message}`);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="flex flex-col gap-6">
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => signInWith("github")}
                  >
                    <Image
                      src="/logos/github.svg"
                      alt="GitHub"
                      width={20}
                      height={20}
                    />
                    Continue with GitHub
                  </Button>
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => signInWith("google")}
                  >
                    <Image
                      src="/logos/google.svg"
                      alt="Google"
                      width={20}
                      height={20}
                    />
                    Continue with Google
                  </Button>
                </div>
                <div className="grid gap-6">
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full"
                    disabled={isPending}
                  >
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have a account?&nbsp;
                  <Link
                    href="/signup"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
