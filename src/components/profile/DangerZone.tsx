import { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DangerZoneProps {
  onDelete: () => Promise<void>;
}

export const DangerZone: FC<DangerZoneProps> = ({ onDelete }) => {
  return (
    <Card className="border-destructive/20 bg-destructive/10">
      <CardHeader>
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription>Irreversible account actions</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you absolutely sure? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <Button variant="destructive" onClick={onDelete} className="w-full">
              Confirm Account Deletion
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
