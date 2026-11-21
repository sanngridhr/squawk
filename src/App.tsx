import "./index.css";

import {
  createRouter,
  defineRoutes,
  type RouteDefinition,
  type RouterInstance,
} from "@solidjs/router";
import { type Component, lazy } from "solid-js";

import Layout from "@/components/Layout";

const routes: RouteDefinition[] = defineRoutes([
  { path: "/", component: lazy(() => import("@/pages/Home")) },
  { path: "/secret-santa", component: lazy(() => import("@/pages/SecretSanta")) },
  { path: "/wishlist", component: lazy(() => import("@/pages/Wishlist")) },
  { path: "/*rest", component: lazy(() => import("@/pages/NotFound")) },
]);

const Router: RouterInstance = createRouter({ routes });

const App: Component = () => <Router>{Layout}</Router>;
export default App;
