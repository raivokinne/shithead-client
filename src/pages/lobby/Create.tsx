import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { instance } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

const lobbySchema = z.object({
  name: z.string().min(3, 'Lobby name must be at least 3 characters'),
  max_players: z.coerce.number().min(2).max(4, 'Maximum 4 players allowed'),
  type: z.string().optional(),
  game_mode: z.enum(['casual', 'ranked', 'tournament']).optional().default('casual'),
  privacy_level: z.enum(['open', 'invite_only', 'password_protected']).optional().default('open'),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  spectator_allowed: z.boolean().optional().default(true),
  invite_code: z.string().optional(),
  game_settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

type LobbyFormData = z.infer<typeof lobbySchema>;

export default function Create() {
  const { isLoading: authLoading } = useProtectedRoute();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSettings, setCustomSettings] = useState<{ key: string, value: string }[]>([]);

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LobbyFormData>({
    resolver: zodResolver(lobbySchema),
    defaultValues: {
      name: '',
      max_players: 4,
      type: 'public',
      game_mode: 'casual',
      privacy_level: 'open',
      spectator_allowed: true,
      password_confirmation: '',
      password: '',
      game_settings: {},
    },
  });

  const onSubmit = async (data: LobbyFormData) => {
    const finalGameSettings = customSettings.reduce((acc, setting) => {
      let processedValue: string | number | boolean = setting.value;
      if (processedValue === 'true') processedValue = true;
      else if (processedValue === 'false') processedValue = false;
      else if (!isNaN(Number(processedValue))) processedValue = Number(processedValue);

      return { ...acc, [setting.key]: processedValue };
    }, data.game_settings || {});

    setIsSubmitting(true);
    try {
      const response = await instance.post('/lobbies', {
        ...data,
        game_settings: finalGameSettings,
        status: 'waiting',
      });

      toast({
        title: 'Lobby Created',
        description: 'Successfully created a new lobby and game.',
        duration: 2000,
      });

      navigate(`/lobbies/${response.data.lobby.id}/show`);
    } catch (error) {
      toast({
        title: 'Lobby Creation Failed',
        description: 'Please try again.',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCustomSetting = () => {
    setCustomSettings([...customSettings, { key: '', value: '' }]);
  };

  const removeCustomSetting = (indexToRemove: number) => {
    setCustomSettings(customSettings.filter((_, index) => index !== indexToRemove));
  };

  const updateCustomSetting = (index: number, field: 'key' | 'value', value: string) => {
    const newSettings = [...customSettings];
    newSettings[index] = { ...newSettings[index], [field]: value };
    setCustomSettings(newSettings);
  };

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Lobby</CardTitle>
          <CardDescription>Set up a game lobby for your friends</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Lobby Name</Label>
              <Input
                {...register('name')}
                placeholder="Enter lobby name"
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Maximum Players</Label>
              <Controller
                name="max_players"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select max players" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Players
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.max_players && <p className="text-red-500 text-sm">{errors.max_players.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Game Mode</Label>
              <Controller
                name="game_mode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="ranked">Ranked</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Privacy Level</Label>
              <Controller
                name="privacy_level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value} disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select privacy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="invite_only">Invite Only</SelectItem>
                      <SelectItem value="password_protected">Password Protected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {watch('privacy_level') === 'password_protected' && (
              <div className="space-y-2">
                <Label>Lobby Password</Label>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="Enter lobby password"
                  disabled={isSubmitting}
                />
                <Label>Confirm Password</Label>
                <Input
                  {...register('password_confirmation')}
                  type="password"
                  placeholder="Confirm lobby password"
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Custom Game Settings</Label>
              {customSettings.map((setting, index) => (
                <div key={index} className="flex space-x-2 items-center">
                  <Input
                    placeholder="Setting Key"
                    value={setting.key}
                    onChange={(e) => updateCustomSetting(index, 'key', e.target.value)}
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                  <Input
                    placeholder="Setting Value"
                    value={setting.value}
                    onChange={(e) => updateCustomSetting(index, 'value', e.target.value)}
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeCustomSetting(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={addCustomSetting}
                disabled={isSubmitting}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Setting
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Lobby...' : 'Create Lobby'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
