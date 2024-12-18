import { FC } from 'react';

interface ProfileHeaderProps {
  title: string;
  description: string;
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ title, description }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
