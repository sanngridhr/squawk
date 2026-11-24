import type { Provider, Session } from "@supabase/supabase-js";
import { createSignal } from "solid-js";

import { supabase } from "@/core/supabase";

const NEXT_KEY = "auth.next";

const [session, setSession] = createSignal<Session | null>(null);
const [ready, setReady] = createSignal(false);

// Seeds both signals from local storage and keeps them current through
// token refreshes, sign-ins, sign-outs, and OAuth / email-confirmation
// redirects — INITIAL_SESSION fires once the client has initialized.
supabase.auth.onAuthStateChange((_event, next) => {
  setSession(next);
  setReady(true);
});

export const auth = {
  /** The active session, or null while signed out. */
  session: (): Session | null => session(),

  /** The signed-in user, or null. */
  user: () => session()?.user ?? null,

  /** False until the stored session has been read for the first time. */
  ready: () => ready(),

  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),

  /**
   * Begin an OAuth round-trip, remembering `next` so /auth/callback can
   * finish there. On success supabase-js navigates the browser away.
   */
  signInWithOAuth: (provider: Provider, next?: string) => {
    if (next !== undefined) {
      try {
        sessionStorage.setItem(NEXT_KEY, next);
      } catch {
        // storage blocked — the round-trip just lands on "/" instead
      }
    }

    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("signOut failed:", error);
  },

  /** The path stashed before an OAuth round-trip, read once (else null). */
  takeNext: (): string | null => {
    try {
      const value = sessionStorage.getItem(NEXT_KEY);
      sessionStorage.removeItem(NEXT_KEY);
      return value;
    } catch {
      return null;
    }
  },

  /** Only same-site paths (`/…`, never `//host`) are valid redirect targets. */
  nextTarget: (value: unknown): string =>
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/",
};
