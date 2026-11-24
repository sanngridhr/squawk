import { useLocation, useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { createEffect, Show } from "solid-js";

import { auth } from "@/core/auth";
import Page from "@/core/components/PageTemplate";

const AuthCallback: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // supabase-js exchanges the code / consumes the hash tokens while the
  // client initializes; once the session lands, finish the round-trip.
  createEffect(
    () => (auth.ready() ? auth.user() : undefined),
    (user) => {
      if (user)
        navigate(auth.nextTarget(auth.takeNext() ?? location.query.next), { replace: true });
    }
  );

  const failure = (): string => {
    const detail =
      location.query.error_description ?? location.query.error_code ?? location.query.error;
    if (typeof detail === "string" && detail.length > 0) return `Sign-in failed: ${detail}`;
    return "This sign-in link is invalid or has expired.";
  };

  return (
    <Page title="Signing in">
      <Show when={auth.ready()} fallback={<p>Signing you in…</p>}>
        <Show
          when={auth.user()}
          fallback={
            <>
              <p class="auth-error" role="alert">
                {failure()}
              </p>
              <p>
                <a href="/login">Back to sign in</a>
              </p>
            </>
          }
        >
          <p>Redirecting…</p>
        </Show>
      </Show>
    </Page>
  );
};

export default AuthCallback;
