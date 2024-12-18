import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export function useProtectedRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
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
