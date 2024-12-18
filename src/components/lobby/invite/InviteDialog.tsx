import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserSearch } from './UserSearch';
import { InviteList } from './InviteList';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { User } from '@/types';

interface InviteDialogProps {
  lobbyId: string;
  maxPlayers: number;
  currentPlayers: number;
}

export function InviteDialog({ lobbyId, maxPlayers, currentPlayers }: InviteDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const remainingSlots = maxPlayers - currentPlayers;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Invite Players
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Players</DialogTitle>
          <DialogDescription>
            {remainingSlots > 0
              ? `You can invite up to ${remainingSlots} more players`
              : 'The lobby is currently full'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <UserSearch
            lobbyId={lobbyId}
            onSelect={(user) => {
              if (selectedUsers.length < remainingSlots) {
                setSelectedUsers(prev => [...prev, user]);
              }
            }}
            selectedUsers={selectedUsers}
          />

          <InviteList
            users={selectedUsers}
            onRemove={(id) => {
              setSelectedUsers(prev => prev.filter(u => u.id !== id));
            }}
            lobbyId={lobbyId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
