import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PasswordFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const PasswordForm: FC<PasswordFormProps> = ({ onSubmit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" name="current_password" required />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" name="new_password" required />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" name="new_password_confirmation" required />
          </div>
          <Button type="submit" className="w-full">Change Password</Button>
        </form>
      </CardContent>
    </Card>
  );
};
