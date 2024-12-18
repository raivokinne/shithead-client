import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { instance, getCurrentUser, getCsrfToken } from '@/lib/axios';
import { User } from '@/types';

export function useProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({} as User);
  const [profileData, setProfileData] = useState<User>({
    id: 0,
    name: '',
    email: '',
    avatar: null
  } as User);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const response = await instance.get(`/profile/${currentUser.id}/show`);
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    const initializeProfile = async () => {
      await getCsrfToken();
      await fetchUserProfile();
    };

    initializeProfile();
  }, []);

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      await getCsrfToken();
      await instance.put(`/profile/${user.id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const response = await instance.get(`/profile/${user.id}/show`);
      setProfileData(response.data);
    } catch (err) {
      setError('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      await getCsrfToken();
      await instance.put(`/profile/${user.id}/password`, formData);
    } catch (err) {
      setError('Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      await getCsrfToken();
      await instance.delete(`/profile/${user.id}/delete`);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError('Account deletion failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profileData,
    loading,
    error,
    updateProfile,
    updatePassword,
    deleteAccount
  };
}
