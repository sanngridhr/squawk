import type { Accessor, Component } from "solid-js";
import { createMemo, For } from "solid-js";

import Page from "@/core/components/PageTemplate";
import { supabase } from "@/core/supabase";

const WishlistPage: Component = () => {
  const wishlist: Accessor<any[]> = createMemo(async () => {
    const { data, error } = await supabase.from("wishlists").select();

    if (error) throw error;
    return data;
  });

  return (
    <Page title="Wishlist">
      <h2>Your wishes:</h2>
      <For each={wishlist()}>{(wish: any) => <p>{wish}</p>}</For>
    </Page>
  );
};

export default WishlistPage;
