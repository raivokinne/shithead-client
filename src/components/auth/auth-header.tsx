import { LucideIcon } from "lucide-react";

interface AuthHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function AuthHeader({ icon: Icon, title, description }: AuthHeaderProps) {
  return (
    <>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center animate-in fade-in duration-500">
        <Icon className="w-8 h-8 text-black" />
      </div>

      <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-gray-400">
          {description}
        </p>
      </div>
    </>
  );
}
