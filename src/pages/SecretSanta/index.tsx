import type { Component } from "solid-js";

import Page from "@/core/components/PageTemplate";
import RequireAuth from "@/core/components/RequireAuth";

const SecretSantaPage: Component = () => (
  <RequireAuth>
    <Page title="Secret Santa" />
  </RequireAuth>
);

export default SecretSantaPage;
