import Link from "next/link";
import { PageFrame } from "../components/page-frame";

export const metadata = { title: "Icon C" };

// TEMPORARY: shows icon candidate C in the browser tab and at app-icon size.
export default function Page() {
  return (
    <PageFrame>
      <h1 className="font-display text-3xl font-black">Icon C</h1>
      <p className="text-muted">The browser tab shows the 32px favicon. Below: the favicon, and the 180px app icon as an iPhone would round it.</p>
      {/* eslint-disable @next/next/no-img-element */}
      <div className="flex items-end gap-6">
        <img src="/icon-c/icon" width={32} height={32} alt="Favicon C" />
        <img src="/icon-c/icon" width={16} height={16} alt="Favicon C, small" />
        <img src="/icon-c/apple-icon" width={180} height={180} alt="App icon C" className="rounded-[40px]" />
      </div>
      {/* eslint-enable @next/next/no-img-element */}
      <Link href="/icon-b" className="underline underline-offset-4">
        See the other candidate
      </Link>
    </PageFrame>
  );
}
