import { PageFrame } from "./components/page-frame";

export default function Home() {
  return (
    <PageFrame>
      <h1 className="font-display text-4xl font-extrabold leading-tight">
        Build your writing muscles.
      </h1>
      <p className="text-muted">Short, scored writing sets.</p>
      <div className="rounded-2xl border border-border bg-surface p-4">
        The first sets are on their way.
      </div>
    </PageFrame>
  );
}
