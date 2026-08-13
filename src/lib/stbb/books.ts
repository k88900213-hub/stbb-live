export interface StbbBookInfo {
  id: number;
  slug: string;
  title: string;
  subject: string;
  medium: string;
  grade: string;
  year: string | null;
  available: boolean;
}

export const STBB_BOOKS: StbbBookInfo[] = [
  {
    "id": 117,
    "slug": "biology-ix-biology-ix-117",
    "title": "Biology IX",
    "subject": "Biology",
    "medium": "English",
    "grade": "IX",
    "year": null,
    "available": true
  },
  {
    "id": 195,
    "slug": "chemistry-ix-chemsitry-ix-195",
    "title": "Chemsitry IX",
    "subject": "Chemistry",
    "medium": "English",
    "grade": "IX",
    "year": null,
    "available": true
  },
  {
    "id": 174,
    "slug": "physics-ix-physics-ix-174",
    "title": "Physics IX",
    "subject": "Physics",
    "medium": "English",
    "grade": "IX",
    "year": "2026",
    "available": true
  },
  {
    "id": 188,
    "slug": "biology-x-biology-x-188",
    "title": "Biology X",
    "subject": "Biology",
    "medium": "English",
    "grade": "X",
    "year": null,
    "available": true
  },
  {
    "id": 198,
    "slug": "chemistry-x-chemsitry-x-198",
    "title": "Chemsitry X",
    "subject": "Chemistry",
    "medium": "English",
    "grade": "X",
    "year": null,
    "available": true
  },
  {
    "id": 202,
    "slug": "physics-x-physics-x-202",
    "title": "Physics X",
    "subject": "Physics",
    "medium": "English",
    "grade": "X",
    "year": "2026",
    "available": true
  }
];
