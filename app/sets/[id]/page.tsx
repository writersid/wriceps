import { notFound } from "next/navigation";
import { PageFrame } from "@/app/components/page-frame";
import { constraintSets } from "@/content/constraint";
import { ConstraintScreen } from "./constraint-screen";

// Every set page is built ahead of time. Any other id is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return constraintSets.map((set) => ({ id: set.id }));
}

export default async function SetPage({ params }: PageProps<"/sets/[id]">) {
  const { id } = await params;
  const index = constraintSets.findIndex((set) => set.id === id);
  if (index === -1) notFound();

  return (
    <PageFrame backHref="/">
      <ConstraintScreen set={constraintSets[index]} number={index + 1} total={constraintSets.length} />
    </PageFrame>
  );
}
