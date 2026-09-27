import { notFound } from "next/navigation";
import { PageFrame } from "@/app/components/page-frame";
import { blackoutSets } from "@/content/blackout";
import { constraintSets } from "@/content/constraint";
import { fillInSets } from "@/content/fill-in";
import { BlackoutScreen } from "./blackout-screen";
import { ConstraintScreen } from "./constraint-screen";
import { FillInScreen } from "./fill-in-screen";

// Every set page is built ahead of time. Any other id is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...constraintSets, ...fillInSets, ...blackoutSets].map((set) => ({ id: set.id }));
}

export default async function SetPage({ params }: PageProps<"/sets/[id]">) {
  const { id } = await params;
  const constraint = constraintSets.findIndex((set) => set.id === id);
  const fillIn = fillInSets.findIndex((set) => set.id === id);
  const blackout = blackoutSets.findIndex((set) => set.id === id);
  if (constraint === -1 && fillIn === -1 && blackout === -1) notFound();

  return (
    <PageFrame backHref="/">
      {constraint !== -1 ? (
        <ConstraintScreen set={constraintSets[constraint]} number={constraint + 1} total={constraintSets.length} />
      ) : fillIn !== -1 ? (
        <FillInScreen set={fillInSets[fillIn]} number={fillIn + 1} total={fillInSets.length} />
      ) : (
        <BlackoutScreen set={blackoutSets[blackout]} number={blackout + 1} total={blackoutSets.length} />
      )}
    </PageFrame>
  );
}
