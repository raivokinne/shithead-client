import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { useAuthStore } from '@/store/useAuthStore';

export function useProtectedRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  return { isLoading, isAuthenticated };
}
