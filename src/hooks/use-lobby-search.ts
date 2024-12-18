import { useState, useMemo } from 'react';
import { Lobby } from '@/types';

export function useLobbySearch(lobbies: Lobby[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLobbies = useMemo(() => {
    if (!searchQuery.trim()) return lobbies;

    const query = searchQuery.toLowerCase();
    return lobbies.filter((lobby) => {
      return (
        lobby.name.toLowerCase().includes(query) ||
        lobby.id.toString().includes(query) ||
        lobby.status.toLowerCase().includes(query)
      );
    });
  }, [lobbies, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredLobbies,
  };
}
