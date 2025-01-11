import { useState, useCallback } from 'react';
import { instance } from '@/lib/axios';
import { Lobby } from '@/types';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

export function useLobbies() {
	const [lobbies, setLobbies] = useState<Lobby[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigator = useNavigate();

	const fetchLobbies = useCallback(async () => {
		try {
			setLoading(true);
			const response = await instance.get('/lobbies');
			setLobbies(response.data);
			setError(null);
		} catch (err) {
			const errorMessage =
				err instanceof AxiosError && err.response
					? err.response.data?.message || 'Failed to fetch lobbies'
					: 'Failed to fetch lobbies';
			setError(errorMessage);
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, []);

	const joinLobby = async (
		lobbyId: number,
		password?: string,
		inviteCode?: string,
		privacyLevel?: string
	) => {
		try {
			const payload: Record<string, string> = {};

			if (privacyLevel === 'password_protected') {
				payload.privacy_level = 'password_protected';
				payload.password = password || '';
			}

			if (privacyLevel === 'invite_only') {
				payload.privacy_level = 'invite_only';
				payload.invite_code = inviteCode || '';
			}

			console.log(payload);

			await instance.post(`/lobbies/${lobbyId}/join`, payload);

			toast({
				title: 'Success',
				description: 'Successfully joined the lobby',
				duration: 2000,
			});

			navigator(`/lobbies/${lobbyId}/show`);
		} catch (error) {
			let errorMessage = 'Failed to join the lobby';
			if (error instanceof AxiosError && error.response) {
				const errorResponse = error.response.data;
				if (errorResponse?.message) {
					errorMessage = errorResponse.message;
				}
			}

			toast({
				title: 'Error',
				description: errorMessage,
				variant: 'destructive',
			});

			throw error;
		}
	};

	return {
		lobbies,
		loading,
		error,
		fetchLobbies,
		joinLobby,
	};
}
