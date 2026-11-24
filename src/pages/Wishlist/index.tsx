import type { Component } from "solid-js";

import Page from "@/core/components/PageTemplate";
import RequireAuth from "@/core/components/RequireAuth";

const WishlistPage: Component = () => (
  <RequireAuth>
    <Page title="Wishlist" />
  </RequireAuth>
);

export default WishlistPage;
