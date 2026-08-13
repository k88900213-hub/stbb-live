import { getChapter } from "@/lib/content/catalog";
import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/reader/ReaderShell";

export async function generateStaticParams() {
  return [
    { slug: "physics-newtons-laws" },
    { slug: "physics-electric-circuits" },
  ];
}

export async function generateMetadata({ params }: PageProps<"/read/[slug]">) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  return {
    title: chapter ? `${chapter.title} · Neural Sync Infinity Live Textbook` : "Chapter",
    description: chapter?.shortDescription,
  };
}

export default async function ReaderPage({ params }: PageProps<"/read/[slug]">) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  return <ReaderShell chapter={chapter} />;
}
