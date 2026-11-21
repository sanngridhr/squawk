import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { createSignal, onSettled } from "solid-js";

// theme
type Theme = "light" | "dark";

const THEME_KEY = "theme";

const isTheme = (value: string | null): value is Theme => value === "light" || value === "dark";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const storedTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
};

const TOGGLE_LABEL: Record<Theme, string> = { light: "☀ Light", dark: "☾ Dark" };

// layout
const Logo: Component = () => (
  <svg width="30" height="30" viewBox="0 0 36 36" aria-hidden="true">
    <image href="/logo.png" width="36" height="36" />
  </svg>
);

const Layout = (props: RouteSectionProps) => {
  const [theme, setTheme] = createSignal<Theme>(storedTheme() ?? systemTheme());

  onSettled(() => {
    // follow the OS theme until the visitor pins one with the toggle
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      if (storedTheme() === null) setTheme(systemTheme());
    };
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  });

  const toggleTheme = () => {
    const next: Theme = theme() === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage blocked — the choice still holds for this visit
    }
  };

  const target = () => (theme() === "dark" ? "light" : "dark");

  return (
    <div>
      <header class="topbar">
        <a href="/" class="logo-button">
          <Logo />
          <span>Squawk</span>
        </a>
        <div class="topbar-actions">
          <nav class="topbar-nav">
            <a href="/">Home</a>
            <a href="/secret-santa">Secret Santa</a>
            <a href="/wishlist">Wishlist</a>
          </nav>
          <button
            type="button"
            class="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${target()} theme`}
          >
            {TOGGLE_LABEL[target()]}
          </button>
        </div>
      </header>
      {props.children}
    </div>
  );
};

export default Layout;
