import type { ParentComponent, ParentProps } from "solid-js";
import { Errored } from "solid-js";

interface ErrorInfo {
  kind: string;
  message: string;
}

function describeError(err: unknown): ErrorInfo {
  if (err instanceof Error) {
    return {
      kind: err.constructor.name, // or err.name
      message: err.message,
    };
  }

  // Supabase errors
  if (typeof err == "object" && err != null && "message" in err) {
    const e = err as { message: unknown; code?: unknown };
    return {
      kind: e.code ? String(e.code) : "Unknown error",
      message: String(e.message),
    };
  }

  return { kind: "Unknown error", message: String(err) };
}

const ErrorBoundary: ParentComponent = (props: ParentProps) => (
  <Errored
    fallback={(err, reset) => {
      console.error(err());

      const { kind, message } = describeError(err());

      return (
        <div class="page page--error" role="alert">
          <h1>Something went wrong</h1>
          <h2>{kind}</h2>
          <p>{message}</p>
          <button onClick={reset}>Try again</button>
        </div>
      );
    }}
  >
    {props.children}
  </Errored>
);

export default ErrorBoundary;
