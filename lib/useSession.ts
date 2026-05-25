"use client";

import { useCallback, useEffect, useState } from "react";
import { withBasePath } from "@/lib/paths";

export type ClientSessionUser = {
  id: number;
  email: string;
  name: string;
  memberType: "personal" | "company";
  companyApproved: boolean;
  role: "user" | "admin";
};

type SessionState = {
  status: "loading" | "authenticated" | "anonymous";
  user: ClientSessionUser | null;
  refresh: () => void;
  signOut: () => Promise<void>;
};

const SESSION_EVENT = "session:changed";

export function useSession(): SessionState {
  const [status, setStatus] = useState<SessionState["status"]>("loading");
  const [user, setUser] = useState<ClientSessionUser | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(withBasePath("/api/auth/session"), {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) {
        setUser(null);
        setStatus("anonymous");
        return;
      }
      const data = (await response.json()) as { authenticated: boolean; user?: ClientSessionUser };
      if (data.authenticated && data.user) {
        setUser(data.user);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("anonymous");
      }
    } catch {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    load();
    function onChanged() {
      load();
    }
    window.addEventListener(SESSION_EVENT, onChanged);
    return () => window.removeEventListener(SESSION_EVENT, onChanged);
  }, [load]);

  const signOut = useCallback(async () => {
    await fetch(withBasePath("/api/auth/logout"), {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
    setStatus("anonymous");
    window.dispatchEvent(new Event(SESSION_EVENT));
  }, []);

  return { status, user, refresh: load, signOut };
}

export function notifySessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EVENT));
}
