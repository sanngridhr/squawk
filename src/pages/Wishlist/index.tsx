import type { Accessor, Component } from "solid-js";
import { createMemo, For } from "solid-js";

import Page from "@/core/components/PageTemplate";
import { supabase } from "@/core/supabase";
import { Wish, wishSchema } from "@/core/schemas/wishlist";

const WishlistPage: Component = () => {
  const wishlist: Accessor<Wish[]> = createMemo(async () => {
    const { data, error } = await supabase.schema("wishlist").from("wishes").select();

    if (error) throw error;
    return data.map((w): Wish => wishSchema.parse(w));
  });

  return (
    <Page title="Wishlist">
      <h2>Your wishes:</h2>
      <For each={wishlist()}>{(wish: any) => <p>{wish}</p>}</For>
    </Page>
  );
};

export default WishlistPage;
