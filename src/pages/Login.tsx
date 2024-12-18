import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, LogIn } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, googleLogin, githubLogin, isLoading } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      await login({
        email: values.email,
        password: values.password,
      });

      toast({
        title: "Welcome back! 👋",
        duration: 2000,
        description: "Successfully signed in to your account.",
      });

      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        duration: 2000,
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    }
  }

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      const loginMethod = provider === "google" ? googleLogin : githubLogin;
      const user = await loginMethod();

      toast({
        title: `Welcome back, ${user.displayName || "User"}!`,
        description: `Successfully signed in with ${provider === "google" ? "Google" : "GitHub"}.`,
        duration: 2000,
      });

      navigate("/");
    } catch {
      toast({
        variant: "destructive",
        title: `${provider === "google" ? "Google" : "GitHub"} login failed`,
        description: "Something went wrong. Please try again.",
        duration: 2000,
      });
    }
  };

  return (
    <AuthFormWrapper>
      <AuthHeader
        icon={LogIn}
        title="Welcome Back"
        description="Sign in to access your account"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000"
        >
          <div className="space-y-2">
            <Button
              type="button"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-100"
              onClick={() => handleOAuthLogin("google")}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              Log in with Google
            </Button>
            <Button
              type="button"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white hover:bg-gray-900"
              onClick={() => handleOAuthLogin("github")}
            >
              <FaGithub className="mr-2 h-4 w-4" />
              Log in with GitHub
            </Button>
          </div>
          <div className="space-y-4">
            <AuthFormField
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
            />
            <AuthFormField
              form={form}
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full bg-white text-black hover:bg-gray-100",
              "transition-all duration-200 ease-in-out",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-white hover:underline focus:outline-none"
            >
              Create account
            </button>
          </p>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}

