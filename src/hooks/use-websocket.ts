import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GameStateType } from '@/pages/game/Show';

interface GameUpdate {
  card_played?: {
    id: string;
    location_type: string;
    player_id: string | null;
  };
  card_drawn?: {
    id: string;
    location_type: string;
    player_id: string | null;
  };
  current_player_id?: string;
  game_state?: GameStateType;
}

interface GameWebSocketProps {
  gameId: string | undefined;
  onGameUpdate?: (update: GameUpdate) => void;
}

type WebSocketMessage = {
  type: string;
  payload: Record<string, any>;
}

interface GameData {
  payload: {
    [key: string]: any;
  };
}

export const useGameWebSocket = ({
  gameId,
  onGameUpdate,
}: GameWebSocketProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const [data, setData] = useState<GameData>();
  const [connectionStatus, setConnectionStatus] = useState<WebSocket['readyState']>(
    WebSocket.CONNECTING
  );

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection Error",
        description: "Not connected to game server",
        variant: "destructive",
      });
      return;
    }
    wsRef.current.send(JSON.stringify(message));
  }, [toast]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'game_started':
          toast({
            title: "Success",
            description: "Game started successfully",
          });
          if (data.payload.redirect) {
            navigate(data.payload.redirect);
          }
          break;

        case 'lobby_ready':
          if (data.payload.is_ready !== undefined) {
            const isReady = data.payload.is_ready === "true";
            toast({
              title: isReady ? '👍 Ready to Play' : '✋ No Longer Ready',
              description: isReady
                ? 'Waiting for other players'
                : 'You can make changes before the game starts',
            });
            setData(data);
          }
          break;

        case 'game_update':
          // Transform the payload into the expected GameUpdate format
          const gameUpdate: GameUpdate = {
            card_played: data.payload.card_played,
            card_drawn: data.payload.card_drawn,
            current_player_id: data.payload.current_player_id,
            game_state: data.payload.game_state
          };
          onGameUpdate?.(gameUpdate);
          break;

        case 'game_error':
          toast({
            title: "Error",
            description: data.payload.message || "An error occurred",
            variant: "destructive",
          });
          break;

        default:
          console.log('Unhandled message type:', data.type);
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      toast({
        title: "Error",
        description: "Failed to process server message",
        variant: "destructive",
      });
    }
  }, [navigate, onGameUpdate, toast]);

  useEffect(() => {
    if (!gameId) return;

    // const wsUrl = `${
    //   window.location.protocol === 'https:'
    //     ? `wss://api.troika.id.lv/games/${gameId}`
    //     : `ws://10.13.59.2:8000/games/${gameId}`
    // }`;

    const ws = new WebSocket(`wss://api.troika.id.lv/games/${gameId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus(WebSocket.OPEN);
    };

    ws.onclose = () => {
      setConnectionStatus(WebSocket.CLOSED);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to game server",
        variant: "destructive",
      });
    };

    ws.onmessage = handleMessage;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [gameId, handleMessage, toast]);

  const playCard = useCallback((payload: {
    cardId: string;
    gameId: string;
    playerId: string;
  }) => {
    sendMessage({
      type: 'play_card',
      payload
    });
  }, [sendMessage]);

  const drawCard = useCallback((payload: {
    gameId: string;
    playerId: string;
  }) => {
    sendMessage({
      type: 'draw_card',
      payload
    });
  }, [sendMessage]);

  return {
    connectionStatus,
    playCard,
    drawCard,
    wsRef,
  };
};

export default useGameWebSocket;
