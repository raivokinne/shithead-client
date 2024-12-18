import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import { User } from '@/types';
import { useState, useEffect } from 'react';
import { Search, Loader2, Copy, CheckCircle } from 'lucide-react';
import { instance } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

interface UserSearchProps {
  lobbyId: string;
  onSelect: (user: User) => void;
  selectedUsers: User[];
}

export function UserSearch({ lobbyId, onSelect, selectedUsers }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [copiedInviteCode, setCopiedInviteCode] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setUsers([]);
      return;
    }
    const searchUsers = async () => {
      setLoading(true);
      try {
        const response = await instance.get(`/lobbies/${lobbyId}/search?query=${debouncedQuery}`);
        setUsers(response.data.filter(
          (user: User) => !selectedUsers.some(selected => selected.id === user.id)
        ));
      } catch (error) {
        console.error('Failed to search users:', error);
        toast({
          title: 'Search Error',
          description: 'Failed to search users. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    searchUsers();
  }, [debouncedQuery, lobbyId, selectedUsers]);

  const copyInviteCode = () => {
    if (inviteCode) {
      setInviteCode('');
      navigator.clipboard.writeText(inviteCode);
      setCopiedInviteCode(true);
      setTimeout(() => setCopiedInviteCode(false), 2000);
      toast({
        title: 'Invite Code Copied',
        description: 'Invite code copied to clipboard',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex items-center space-x-2">
        {inviteCode && (
          <div className="flex items-center space-x-2">
            <Input
              value={inviteCode}
              readOnly
              className="w-24"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={copyInviteCode}
            >
              {copiedInviteCode ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[200px] rounded-md border">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length > 0 ? (
          <div className="p-4 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => onSelect(user)}>
                  Select
                </Button>
              </div>
            ))}
          </div>
        ) : query.length > 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Start typing to search for players
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
