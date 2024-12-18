import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signupSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation
      });

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account has been successfully created.",
        duration: 2000
      });

      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        duration: 2000,
        description: "Please check your information and try again.",
      });
    }
  }

  return (
    <AuthFormWrapper>
      <AuthHeader
        icon={UserPlus}
        title="Create Account"
        description="Join us to unlock all features and benefits"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000"
        >
          <div className="space-y-4">
            <AuthFormField
              form={form}
              name="name"
              label="Full Name"
              placeholder="John Doe"
            />
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
            <AuthFormField
              form={form}
              name="password_confirmation"
              label="Confirm Password"
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-white hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </form>
      </Form>
    </AuthFormWrapper>
  );
}
