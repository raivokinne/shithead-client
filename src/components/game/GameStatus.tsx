interface GameStatusProps {
  lastAction?: string;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  lastAction,
}) => {
  return (
    <>
      {lastAction && (
        <div className="absolute top-16 left-20 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
          {lastAction}
        </div>
      )}
    </>
  );
};
