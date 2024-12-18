import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameSettings {
  showPlayableHints: boolean;
  setShowPlayableHints: (show: boolean) => void;
}

export const useSettings = create<GameSettings>()(
  persist(
    (set) => ({
      showPlayableHints: true,
      setShowPlayableHints: (show) => set({ showPlayableHints: show }),
    }),
    {
      name: 'game-settings',
    }
  )
);
