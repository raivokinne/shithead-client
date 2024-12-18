import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface GameSetupProps {
  onStart: (botCount: number) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [botCount, setBotCount] = React.useState(2);

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Shithead</DialogTitle>
          <DialogDescription>
            A classic card game where the goal is to get rid of all your cards.
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Number of Opponents</h3>
            <Select
              value={botCount.toString()}
              onValueChange={(value) => setBotCount(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bot count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Opponents</SelectItem>
                <SelectItem value="2">2 Opponents</SelectItem>
                <SelectItem value="3">3 Opponents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => onStart(botCount)}
            className="w-full"
            size="lg"
          >
            Start Game
          </Button>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
