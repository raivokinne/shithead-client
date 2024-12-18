import { cn } from '@/lib/utils';

interface CardHighlightProps {
  isPlayable: boolean;
  showHints: boolean;
}

export const CardHighlight: React.FC<CardHighlightProps> = ({
  isPlayable,
  showHints,
}) => {
  if (!isPlayable || !showHints) return null;

  return (
    <div className={cn(
      "absolute inset-0 border-2 border-green-500 rounded pointer-events-none",
      "animate-pulse"
    )} />
  );
};
