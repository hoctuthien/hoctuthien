"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect } from "react";
import { setClientToken } from "@/core/api/client";
import { setGqlClientToken } from "@/core/api/graphql-client";

function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    const token = (session as any)?.accessToken || null;
    console.log('[TokenSync] Synchronizing token to API and GraphQL client caches:', token ? '***token***' : 'null');
    setClientToken(token);
    setGqlClientToken(token);
  }, [session]);

  return null;
}

export function AuthProvider({ 
  children, 
  session 
}: { 
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}
