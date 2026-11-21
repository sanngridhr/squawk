import { Title } from "@solidjs/meta";
import type { ParentComponent, ParentProps } from "solid-js";

interface PageProps extends ParentProps {
  title: string;
}

const Page: ParentComponent<PageProps> = (props: PageProps) => (
  <div class="page">
    <Title>{props.title} ◊ Squawk!</Title>

    <h1>{props.title}</h1>
    {props.children}
  </div>
);

export default Page;
