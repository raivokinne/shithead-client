import { ReactNode } from "react";

interface AuthFormWrapperProps {
  children: ReactNode;
}

export function AuthFormWrapper({ children }: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8 relative">
        {children}
      </div>
    </div>
  );
}
