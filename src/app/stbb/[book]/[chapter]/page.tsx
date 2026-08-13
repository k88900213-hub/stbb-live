import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { getStbbBook, getStbbChapter, getStbbChapterIndex } from "@/lib/stbb/catalog";

type Props = { params: Promise<{ book: string; chapter: string }> };

export async function generateStaticParams() {
  const params: { book: string; chapter: string }[] = [];
  for (const book of [
    "physics-ix-physics-ix-174",
    "physics-x-physics-x-202",
    "chemistry-ix-chemsitry-ix-195",
    "biology-ix-biology-ix-117",
    "chemistry-x-chemsitry-x-198",
    "biology-x-biology-x-188",
  ]) {
    const b = getStbbBook(book);
    if (!b) continue;
    for (const ch of b.chapters) params.push({ book, chapter: ch.slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { book, chapter } = await params;
  const b = getStbbBook(book);
  const ch = b && getStbbChapter(book, chapter);
  return {
    title: ch ? `${ch.title} · ${b?.title}` : "STBB Chapter",
    description: ch?.shortDescription,
  };
}

export default async function StbbReaderPage({ params }: Props) {
  const { book, chapter } = await params;
  const b = getStbbBook(book);
  const ch = b && getStbbChapter(book, chapter);
  if (!b || !ch) notFound();

  const index = getStbbChapterIndex(b, chapter);

  return (
    <ReaderShell
      chapter={ch}
      navChapters={b.chapters}
      chapterPosition={index}
      navLabel={b.title}
    />
  );
}
