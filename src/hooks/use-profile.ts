import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { instance } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export function useProfile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);

      await instance.put(`/profile/${user?.uid}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await instance.get(`/profile/${user?.uid}/show`);
    } catch (err) {
      setError("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      await instance.put(`/profile/${user.id}/password`, formData);
    } catch (err) {
      setError("Password update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      await instance.delete(`/profile/${user.id}/delete`);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      setError("Account deletion failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profileData: user,
    loading,
    error,
    updateProfile,
    updatePassword,
    deleteAccount,
  };
}
