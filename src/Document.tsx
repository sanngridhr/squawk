import { HydrationScript } from "@solidjs/web";
import type { ParentProps } from "solid-js";

// The document shell (the index.html replacement), picked up by the
// src/Document.* convention; it must render the full <html> and ships no
// client JS. <HydrationScript /> is stripped from the prerendered shell in
// client mode and activates under `ssr: true`. Delete this file to fall
// back to the plugin's built-in shell.
// Applies the saved theme before first paint, so the shell never flashes
// the wrong paper while the client bundle loads. Deliberately free of "&"
// and "<": the SSR serializer escapes those in text content.
const THEME_BOOT =
  '(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();';

export default function Document(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>Squawk</title>
        <script>{THEME_BOOT}</script>
        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
