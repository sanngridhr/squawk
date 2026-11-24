import { Title } from "@solidjs/meta";
import type { ParentComponent, ParentProps } from "solid-js";

interface PageProps extends ParentProps {
  title: string;
  wide?: boolean;
}

const Page: ParentComponent<PageProps> = (props: PageProps) => (
  <div class={props.wide ? "page page--wide" : "page"}>
    <Title>{props.title} ◊ Squawk!</Title>

    <h1>{props.title}</h1>
    {props.children}
  </div>
);

export default Page;
