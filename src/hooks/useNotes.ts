"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface SavedNote {
  id: string;
  chapter: string;
  section: string;
  text: string;
  at: number;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<SavedNote[]>("ns-notes", []);

  const addNote = (chapter: string, section: string, text: string) => {
    const note: SavedNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      chapter,
      section,
      text,
      at: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  };

  const removeNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return { notes, addNote, removeNote };
}
