import type { Component } from "solid-js";
import { createMemo, createSignal, For, refresh, Show } from "solid-js";

import { auth } from "@/core/auth";
import Page from "@/core/components/PageTemplate";
import RequireAuth from "@/core/components/RequireAuth";
import type { Wish } from "@/core/schemas/wishlist";
import { createWishSchema, updateWishSchema, wishSchema } from "@/core/schemas/wishlist";
import { supabase } from "@/core/supabase";

type SortKey = "name" | "gifted" | "gifter" | "created_at" | "updated_at";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "gifted", label: "Gifted" },
  { key: "gifter", label: "Gifter" },
  { key: "created_at", label: "Created" },
  { key: "updated_at", label: "Updated" },
];

const COMPARE: Record<SortKey, (a: Wish, b: Wish) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  gifted: (a, b) => Number(a.gifted) - Number(b.gifted),
  gifter: (a, b) => {
    if (a.gifter == null || b.gifter == null) {
      return a.gifter == b.gifter ? 0 : a.gifter == null ? 1 : -1; // nulls last
    }
    return a.gifter.localeCompare(b.gifter);
  },
  created_at: (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
  updated_at: (a, b) => Date.parse(a.updated_at) - Date.parse(b.updated_at),
};

const formatDate = (value: string): string =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const WishlistPage: Component = () => {
  // Initial load. refresh(wishes) re-asks the same question after every
  // write — a bare refresh is quiet, so the fresh list reveals itself
  // without the page falling back to <Loading>.
  const wishes = createMemo(async () => {
    const { data, error } = await supabase
      .from("wishes")
      .select("id::text, user_id, name, gifted, gifter, created_at, updated_at");

    if (error) throw error;
    return data.map((row): Wish => wishSchema.parse(row));
  });

  const [sort, setSort] = createSignal<{ key: SortKey; dir: 1 | -1 }>({
    key: "created_at",
    dir: -1,
  });

  const sorted = createMemo((): Wish[] => {
    const rows = [...wishes()];
    const { key, dir } = sort();

    rows.sort((a, b) => {
      const cmp = COMPARE[key](a, b);
      // Ids are random — as a tie-break they only need to be stable.
      return (cmp != 0 ? cmp : a.id.localeCompare(b.id, undefined, { numeric: true })) * dir;
    });

    return rows;
  });

  const toggleSort = (key: SortKey): void => {
    setSort((current) =>
      current.key == key ? { key, dir: current.dir == 1 ? -1 : 1 } : { key, dir: 1 }
    );
  };

  // A failed re-fetch already surfaces through the page's ErrorBoundary
  // (the memo throws); swallow the promise so it isn't reported twice.
  const reload = async (): Promise<void> => {
    try {
      await refresh(wishes);
    } catch {
      // handled by the ErrorBoundary
    }
  };

  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editError, setEditError] = createSignal<string | null>(null);
  const [editPending, setEditPending] = createSignal(false);

  const startEdit = (wish: Wish): void => {
    setEditError(null);
    setEditingId(wish.id);
  };

  const cancelEdit = (): void => {
    setEditError(null);
    setEditingId(null);
  };

  const saveEdit = async (event: SubmitEvent, wish: Wish): Promise<void> => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const parsed = updateWishSchema.safeParse({
      name: String(form.get("name") ?? ""),
      gifter: String(form.get("gifter") ?? ""),
      gifted: form.get("gifted") != null,
    });
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? "Check your entries and try again.");
      return;
    }

    setEditPending(true);
    setEditError(null);
    try {
      const { error: failure } = await supabase
        .from("wishes")
        .update({
          name: parsed.data.name,
          gifter: parsed.data.gifter == "" ? null : parsed.data.gifter,
          gifted: parsed.data.gifted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wish.id);
      if (failure) {
        setEditError(failure.message);
        return;
      }

      await reload();
      setEditingId(null);
    } finally {
      setEditPending(false);
    }
  };

  const [createError, setCreateError] = createSignal<string | null>(null);
  const [createNotice, setCreateNotice] = createSignal<string | null>(null);
  const [createPending, setCreatePending] = createSignal(false);

  const addWish = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();

    // currentTarget only exists during dispatch — capture before awaiting.
    const form = event.currentTarget as HTMLFormElement;
    const parsed = createWishSchema.safeParse({ name: String(form.get("name") ?? "") });
    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? "Check your entries and try again.");
      return;
    }

    const user = auth.user();
    if (user == null) {
      setCreateError("Your session expired — sign in again.");
      return;
    }

    setCreatePending(true);
    setCreateError(null);
    setCreateNotice(null);
    try {
      const now = new Date().toISOString();
      const { error: failure } = await supabase.from("wishes").insert({
        name: parsed.data.name,
        user_id: user.id,
        gifted: false,
        gifter: null,
        created_at: now,
        updated_at: now,
      });
      if (failure) {
        setCreateError(failure.message);
        return;
      }

      await reload();
      form.reset();
      setCreateNotice("Wish added.");
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <RequireAuth>
      <Page title="Wishlist">
        <h2>Your wishes:</h2>

        <Show when={sorted().length > 0} fallback={<p>No wishes yet — add one below.</p>}>
          <div class="wish-wrap">
            <table class="wish-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <For each={COLUMNS}>
                    {(column) => (
                      <th
                        scope="col"
                        aria-sort={
                          sort().key == column.key
                            ? sort().dir == 1
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          class="wish-sort"
                          onClick={() => toggleSort(column.key)}
                        >
                          {column.label}
                          <Show when={sort().key == column.key}>
                            <span aria-hidden="true">{sort().dir == 1 ? "↑" : "↓"}</span>
                          </Show>
                        </button>
                      </th>
                    )}
                  </For>
                  <th scope="col">
                    <span class="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={sorted()}>
                  {(wish, index) => (
                    <Show
                      when={editingId() == wish.id}
                      fallback={
                        <tr>
                          <td>{index() + 1}</td>
                          <td>{wish.name}</td>
                          <td>{wish.gifted ? "Yes" : "No"}</td>
                          <td>{wish.gifter ?? "—"}</td>
                          <td>{formatDate(wish.created_at)}</td>
                          <td>{formatDate(wish.updated_at)}</td>
                          <td>
                            <button type="button" onClick={() => startEdit(wish)}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      }
                    >
                      <tr>
                        <td colspan={7} class="wish-edit-cell">
                          <form class="wish-edit-form" onSubmit={(event) => saveEdit(event, wish)}>
                            <Show when={editError()}>
                              <p class="wish-error" role="alert">
                                {editError()}
                              </p>
                            </Show>

                            <label>
                              Name
                              <input name="name" type="text" required value={wish.name} />
                            </label>

                            <label>
                              Gifter
                              <input
                                name="gifter"
                                type="text"
                                placeholder="(none)"
                                value={wish.gifter ?? ""}
                              />
                            </label>

                            <label class="wish-gifted">
                              <input name="gifted" type="checkbox" checked={wish.gifted} />
                              Gifted
                            </label>

                            <button type="submit" disabled={editPending()}>
                              Save
                            </button>
                            <button type="button" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </form>
                        </td>
                      </tr>
                    </Show>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>

        <h2>Add a wish</h2>
        <form class="wish-form" onSubmit={addWish}>
          <Show when={createError()}>
            <p class="wish-error" role="alert">
              {createError()}
            </p>
          </Show>
          <Show when={createNotice()}>
            <p class="wish-notice" role="status">
              {createNotice()}
            </p>
          </Show>

          <label>
            Name
            <input name="name" type="text" required autocomplete="off" />
          </label>

          <button type="submit" disabled={createPending()}>
            Add wish
          </button>
        </form>
      </Page>
    </RequireAuth>
  );
};

export default WishlistPage;
