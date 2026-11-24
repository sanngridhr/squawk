import { useLocation, useNavigate } from "@solidjs/router";
import type { Provider } from "@supabase/supabase-js";
import type { Component } from "solid-js";
import { createEffect, createSignal, For, Show } from "solid-js";

import { auth } from "@/core/auth";
import Page from "@/core/components/PageTemplate";
import { signInSchema, signUpSchema } from "@/core/schemas/auth";

type Mode = "signin" | "signup";

const OAUTH_PROVIDERS = [
  { provider: "google", label: "Google" },
  { provider: "discord", label: "Discord" },
] as const;

const Login: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = createSignal<Mode>("signin");
  const [error, setError] = createSignal<string | null>(null);
  const [notice, setNotice] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const next = (): string => auth.nextTarget(location.query.next);

  // Already signed in — leave for the page that was asked for.
  createEffect(
    () => (auth.ready() && auth.user() ? next() : undefined),
    (target) => {
      if (target !== undefined) navigate(target, { replace: true });
    }
  );

  const switchMode = (): void => {
    setMode((current) => (current == "signin" ? "signup" : "signin"));
    setError(null);
    setNotice(null);
  };

  const submit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();

    const form = new FormData(event.currentTarget as HTMLFormElement);
    const credentials = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const parsed = (mode() == "signin" ? signInSchema : signUpSchema).safeParse(credentials);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your entries and try again.");
      return;
    }

    setPending(true);
    setError(null);
    setNotice(null);

    try {
      if (mode() == "signin") {
        const { error: failure } = await auth.signInWithPassword(
          parsed.data.email,
          parsed.data.password
        );
        if (failure) {
          setError(failure.message);
          return;
        }
        navigate(next(), { replace: true });
        return;
      }

      const { data, error: failure } = await auth.signUp(parsed.data.email, parsed.data.password);
      if (failure) {
        setError(failure.message);
        return;
      }
      if (data.session == null) {
        setNotice("Check your email to confirm your address, then sign in.");
        return;
      }
      navigate(next(), { replace: true });
    } finally {
      setPending(false);
    }
  };

  const oauth = async (provider: Provider): Promise<void> => {
    setError(null);
    setNotice(null);
    setPending(true);

    try {
      const { error: failure } = await auth.signInWithOAuth(provider, next());
      if (failure) setError(failure.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Page title={mode() == "signin" ? "Sign in" : "Sign up"}>
      <Show
        when={notice()}
        fallback={
          <>
            <form class="auth-form" onSubmit={submit}>
              <Show when={error()}>
                <p class="auth-error" role="alert">
                  {error()}
                </p>
              </Show>

              <label>
                Email
                <input name="email" type="email" required autocomplete="email" />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  autocomplete={mode() == "signin" ? "current-password" : "new-password"}
                />
              </label>

              <button type="submit" disabled={pending()}>
                {mode() == "signin" ? "Sign in" : "Sign up"}
              </button>

              <For each={OAUTH_PROVIDERS}>
                {(entry) => (
                  <button type="button" onClick={() => oauth(entry.provider)} disabled={pending()}>
                    Sign in with {entry.label}
                  </button>
                )}
              </For>
            </form>

            <p class="auth-switch">
              {mode() == "signin" ? "No account yet?" : "Already have an account?"}{" "}
              <button type="button" class="link-button" onClick={switchMode}>
                {mode() == "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        }
      >
        <p class="auth-notice" role="status">
          {notice()}
        </p>
        <button type="button" onClick={switchMode}>
          Back to sign in
        </button>
      </Show>
    </Page>
  );
};

export default Login;
