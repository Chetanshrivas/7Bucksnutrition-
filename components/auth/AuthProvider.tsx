"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  /*
   * STABLE `user` REFERENCE
   *
   * Supabase fires onAuthStateChange for background events too —
   * most notably TOKEN_REFRESHED, which happens automatically
   * whenever the tab regains focus/visibility. That hands back a
   * brand new `session` (and therefore a brand new `session.user`
   * object) for the SAME logged-in account.
   *
   * Every page that does `useEffect(..., [user, ...])` was treating
   * that new object reference as "the user changed", so it refetched
   * everything and flashed its loading skeleton on every tab switch.
   *
   * These refs let us keep handing out the SAME `user` object as
   * long as the underlying user id hasn't actually changed — so a
   * token refresh no longer looks like an account change to anyone
   * consuming this context.
   */
  const lastUserIdRef = useRef<string | null>(null);
  const stableUserRef = useRef<User | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialiseAuth() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error(
            "Failed to initialise authentication:",
            error
          );

          setSession(null);
        } else {
          setSession(currentSession);
        }
      } catch (error) {
        if (!mounted) return;

        console.error(
          "Authentication initialisation failed:",
          error
        );

        setSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialiseAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Derive a `user` object that only changes identity when the
  // actual signed-in account changes (login, logout, or switching
  // accounts) — not on every background token refresh.
  const user = useMemo(() => {
    const nextUser = session?.user ?? null;
    const nextId = nextUser?.id ?? null;

    if (nextId === lastUserIdRef.current) {
      return stableUserRef.current;
    }

    lastUserIdRef.current = nextId;
    stableUserRef.current = nextUser;

    return nextUser;
  }, [session]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signOut,
    }),
    [user, session, loading, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}