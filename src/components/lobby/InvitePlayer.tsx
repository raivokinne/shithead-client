import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useLobby } from '@/hooks/use-lobby';
import { User } from '@/types';

export function InvitePlayers({ lobbyId }: { lobbyId: string | undefined }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { inviteUserToLobby } = useLobby(lobbyId);
  const debouncedQuery = query.trim();

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInvite = async (userId: string) => {
    try {
      await inviteUserToLobby(lobbyId, userId);
      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to user ${userId}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to invite user',
      });
    }
  };

  useEffect(() => {
    if (debouncedQuery.length < 3) return;

    const fetchUsers = async () => {
      const response = await fetch(`/api/lobbies/${lobbyId}/search-users?query=${debouncedQuery}`);
      const result = await response.json();
      setUsers(result);
    };

    fetchUsers();
  }, [debouncedQuery, lobbyId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Search for Users</h3>
      <Input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search by name"
      />
      <div className="space-y-2">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="flex justify-between items-center">
              <span>{user.name}</span>
              <Button onClick={() => handleInvite(user.id)} size="sm">
                Invite
              </Button>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

