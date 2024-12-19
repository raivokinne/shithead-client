import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@/types/auth";

interface ProfileFormProps {
  profileData: User;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ProfileForm: FC<ProfileFormProps> = ({
  profileData,
  onSubmit,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              name="name"
              defaultValue={profileData.name || profileData.displayName || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              defaultValue={profileData.email || ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <Input
              type="file"
              name="avatar"
              accept="image/*"
              className="file:text-black"
            />
          </div>
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
