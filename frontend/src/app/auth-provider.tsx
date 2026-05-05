"use client";

import { useEffect } from "react";
import { useUserStore } from "@/core/lib/store/userStore";
import { authGateway } from "@/core/gateway/authGateway";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authGateway.getMe();
        if (data.user) {
          setUser(data.user);
        } else {
          clearUser();
        }
      } catch (error) {
        clearUser();
      }
    };

    initAuth();
  }, [setUser, clearUser]);

  return <>{children}</>;
}
