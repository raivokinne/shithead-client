import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Loader2 } from 'lucide-react';
import { useLobbies } from '@/hooks/use-lobbies';
import { LobbyContainer } from '@/components/lobby/LobbyContainer';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function Index() {
  const navigate = useNavigate();
  const { lobbies, loading, error, fetchLobbies, joinLobby } = useLobbies();
  const { isLoading: authLoading, isAuthenticated } = useProtectedRoute();

  useEffect(() => {
    fetchLobbies();
  }, [fetchLobbies]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p>Please login to view lobbies</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader className="h-8 w-4 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="mb-4 flex items-center py-4 border-b">
        <div className="flex items-center gap-2">
          <NotificationCenter />
        </div>
      </header>
      <LobbyContainer
        lobbies={lobbies}
        onJoinLobby={joinLobby}
        onRefresh={fetchLobbies}
        onCreateNew={() => navigate('/lobbies/new')}
      />
    </div>
  );
}
