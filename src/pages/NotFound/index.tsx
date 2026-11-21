import type { Component } from "solid-js";

import Page from "@/core/components/PageTemplate";

const NotFoundPage: Component = () => {
  return (
    <div class="page--error">
      <Page title="Not found">
        <p>The page you were looking for was not found.</p>
      </Page>
    </div>
  );
};

export default NotFoundPage;
