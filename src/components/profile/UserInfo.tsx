import { Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

export const UserInfo = ({ user }: { user: User | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="text-lg">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-semibold">{user?.name}</h3>
            <p className="text-muted-foreground">Premium Member</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              Joined {new Date(user?.created_at || "").toDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
