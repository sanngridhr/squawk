import { createAuth0Client } from "@auth0/auth0-spa-js";
import { env } from "./env";

export const auth0Client = await createAuth0Client({
  domain: env.VITE_AUTH0_DOMAIN,
  clientId: env.VITE_AUTH0_CLIENT_ID,
  cacheLocation: "localstorage",
  authorizationParams: { redirect_uri: window.location.origin },
})