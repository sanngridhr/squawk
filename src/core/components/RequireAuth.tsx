import { useLocation, useNavigate } from "@solidjs/router";
import type { ParentComponent, ParentProps } from "solid-js";
import { createEffect, Show } from "solid-js";

import { auth } from "@/core/auth";

const RequireAuth: ParentComponent = (props: ParentProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect once the stored session has been read and there is no user.
  createEffect(
    () => {
      if (!auth.ready() || auth.user()) return undefined;
      return `${location.pathname}${location.search}`;
    },
    (next) => {
      if (next !== undefined)
        navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
    }
  );

  return (
    <Show when={auth.ready() && auth.user()} fallback={<p>Loading…</p>}>
      {props.children}
    </Show>
  );
};

export default RequireAuth;
