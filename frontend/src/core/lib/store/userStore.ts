import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { operations } from '@/core/types/api.generated';

// Trích xuất type User trực tiếp từ schema của API
type UserProfile = NonNullable<
  operations['AuthController_login']['responses'][201]['content']['application/json']['user']
>;

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
