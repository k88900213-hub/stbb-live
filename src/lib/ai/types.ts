export type ExplainMode =
  | "beginner"
  | "intermediate"
  | "expert"
  | "child"
  | "exam";

export type LanguageCode =
  | "en"
  | "ur"
  | "ar"
  | "de"
  | "fr"
  | "es"
  | "hi"
  | "zh";

export interface AiEngineResult {
  mode: "online" | "offline";
  provider: string;
}

export interface ExplainRequest {
  text: string;
  mode: ExplainMode;
  audience?: string;
}

export interface ExplainResponse extends AiEngineResult {
  summary: string;
  points: string[];
  example: string;
  analogy: string;
  question: string;
  checkQuestion: string;
}

export interface AskRequest {
  text: string;
  question: string;
  chapterTitle?: string;
  sectionTitle?: string;
}

export interface AskResponse extends AiEngineResult {
  answer: string;
}

export interface TranslateRequest {
  text: string;
  language: LanguageCode;
}

export interface TranslateResponse extends AiEngineResult {
  translatedText: string;
  preserved: boolean;
}

export interface QuizQuestion {
  id: string;
  type: "mcq";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizRequest {
  text: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}

export interface QuizResponse extends AiEngineResult {
  questions: QuizQuestion[];
}

export type NoteKind =
  | "smart"
  | "keypoints"
  | "cheatsheet"
  | "flashcards";

export interface NoteRequest {
  text: string;
  kind: NoteKind;
}

export interface NoteResponse extends AiEngineResult {
  kind: NoteKind;
  title: string;
  sections: { heading: string; body: string }[];
  cards?: { front: string; back: string }[];
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  messages: TutorMessage[];
  context?: {
    chapterTitle: string;
    sectionTitle: string;
    excerpt?: string;
  };
  language?: LanguageCode;
}

export interface TutorResponse extends AiEngineResult {
  reply: string;
}

export type DiagramKind = "flowchart" | "concept-map" | "cycle" | "hierarchy" | "sequence" | "comparison";

export interface DiagramRequest {
  text: string;
  kind: DiagramKind;
  title?: string;
}

export interface DiagramResponse extends AiEngineResult {
  title: string;
  svg: string;
  description: string;
}
