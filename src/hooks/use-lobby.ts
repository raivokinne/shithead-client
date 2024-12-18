import { useCallback, useEffect, useState } from "react";
import { toast } from "./use-toast";
import { instance } from "@/lib/axios";
import { Lobby } from "@/types";
import { useNavigate } from "react-router";

export function useLobby(id: string | undefined) {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const fetchLobbyDetails = useCallback(async () => {
    if (!id) return;
    try {
      const response = await instance.get(`/lobbies/${id}/show`);
      setLobby(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lobby details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLobbyDetails();
    const interval = setInterval(fetchLobbyDetails, 1000);
    return () => clearInterval(interval);
  }, [fetchLobbyDetails]);

  const joinLobby = useCallback(async () => {
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      await instance.post(`/lobbies/${id}/join`);
      toast({
        title: "Success",
        description: "You've joined the lobby!",
      });
      await fetchLobbyDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the lobby",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  }, [id, isJoining, fetchLobbyDetails]);

  useEffect(() => {
    fetchLobbyDetails();
    const interval = setInterval(fetchLobbyDetails, 50000);
    return () => clearInterval(interval);
  }, [fetchLobbyDetails]);

  const updateParticipantStatus = useCallback((participantId: number, status: 'ready' | 'not_ready') => {
    setLobby(currentLobby => {
      if (!currentLobby) return null;
      return {
        ...currentLobby,
        participants: currentLobby.participants.map(p =>
          p.id === participantId ? { ...p, status } : p
        )
      };
    });
  }, []);

  const startGame = useCallback(async () => {
    try {
      const response = await instance.post(`/games/${id}/start`);
      if (response.status === 200) {
        navigate(`/games/${id}`);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start the game',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the game",
        variant: "destructive",
      });
    }
  }, []);

  const leaveLobby = useCallback(async () => {
    try {
      await instance.post(`/lobbies/${id}/leave`);
      toast({
        title: "Success",
        description: "You've left the lobby",
      });
      navigate('/lobbies');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to leave the lobby",
        variant: "destructive",
      });
    }
  }, [id, navigate]);

  const inviteUserToLobby = async (lobbyId: string | undefined, userId: number) => {
    setLoading(true);
    try {
      const response = await instance.post(`/lobbies/${lobbyId}/invite`, { invited_user_id: userId });
      if (response.status === 200) {
        setLobby(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to invite user',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    lobby,
    loading,
    isJoining,
    joinLobby,
    fetchLobbyDetails,
    updateParticipantStatus,
    startGame,
    leaveLobby,
    inviteUserToLobby
  };
}
