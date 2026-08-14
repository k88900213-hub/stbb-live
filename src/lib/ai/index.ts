import type {
  AskRequest,
  AskResponse,
  DiagramKind,
  DiagramRequest,
  DiagramResponse,
  ExplainMode,
  ExplainRequest,
  ExplainResponse,
  LanguageCode,
  NoteRequest,
  NoteResponse,
  QuizQuestion,
  QuizRequest,
  QuizResponse,
  TranslateRequest,
  TranslateResponse,
  TutorRequest,
  TutorResponse,
} from "./types";
import { chatCompletion, extractJson, getProvider, streamChat } from "./provider";
import {
  offlineAsk,
  offlineDiagram,
  offlineExplain,
  offlineNotes,
  offlineQuiz,
  offlineTranslate,
  offlineTutor,
} from "./offline";

const SYSTEM_BASE =
  "You are Neural Sync, the AI tutor inside an enterprise live textbook. You explain concepts clearly, stay strictly within the textbook context given, adapt to the requested level, and never invent facts. Keep answers focused and well-structured.";

const MODE_PROMPTS: Record<ExplainMode, string> = {
  beginner: "Beginner mode: plain everyday language, no jargon, friendly tone.",
  intermediate: "Intermediate mode: standard secondary-school textbook language.",
  expert: "Expert mode: rigorous, technical, with full mathematical precision.",
  child: "Child-friendly mode: tiny words, playful tone, story-like examples, as if speaking to a 10-year-old.",
  exam: "Exam mode: structured like a model answer that would earn full marks; highlight marks-worthy points.",
};

const LANG_NAMES: Record<LanguageCode, string> = {
  en: "English",
  ur: "Urdu",
  ar: "Arabic",
  de: "German",
  fr: "French",
  es: "Spanish",
  hi: "Hindi",
  zh: "Chinese",
};

export async function explain(req: ExplainRequest): Promise<ExplainResponse> {
  const provider = getProvider();
  if (!provider) return offlineExplain(req);

  const userPrompt = `${MODE_PROMPTS[req.mode]}
Audience: ${req.audience || "student"}.
Textbook passage:
"""
${req.text}
"""

Explain this passage. Respond with STRICT JSON only, no markdown fences, matching exactly:
{"summary":"string","points":["string"],"example":"string","analogy":"string","question":"string","checkQuestion":"string"}`;

  try {
    const { text, provider: used } = await chatCompletion([
      { role: "system", content: SYSTEM_BASE },
      { role: "user", content: userPrompt },
    ]);
    return { ...extractJson<ExplainResponse>(text), mode: "online", provider: used.label };
  } catch (err) {
    console.error("online explain failed, falling back:", err);
    return offlineExplain(req);
  }
}

export async function ask(req: AskRequest): Promise<AskResponse> {
  const provider = getProvider();
  if (!provider) return offlineAsk(req);

  const userPrompt = `Textbook chapter: ${req.chapterTitle ?? "unknown"}
Section: ${req.sectionTitle ?? "unknown"}
Passage:
"""
${req.text}
"""
Student question: "${req.question}"

Answer helpfully and stay within the textbook context. Respond with STRICT JSON only: {"answer":"string"}`;

  try {
    const { text, provider: used } = await chatCompletion([
      { role: "system", content: SYSTEM_BASE },
      { role: "user", content: userPrompt },
    ]);
    return { ...extractJson<AskResponse>(text), mode: "online", provider: used.label };
  } catch (err) {
    console.error("online ask failed, falling back:", err);
    return offlineAsk(req);
  }
}

export async function translate(req: TranslateRequest): Promise<TranslateResponse> {
  const provider = getProvider();
  if (!provider) return offlineTranslate(req);

  const userPrompt = `Translate the following textbook passage into ${LANG_NAMES[req.language]}. Preserve any formulas, numbers and technical symbols exactly. Respond with STRICT JSON only: {"translatedText":"string"}

Passage:
${req.text}`;

  try {
    const { text, provider: used } = await chatCompletion([
      { role: "system", content: SYSTEM_BASE },
      { role: "user", content: userPrompt },
    ]);
    return {
      ...extractJson<TranslateResponse>(text),
      mode: "online",
      provider: used.label,
      preserved: true,
    };
  } catch (err) {
    console.error("online translate failed, falling back:", err);
    return offlineTranslate(req);
  }
}

export async function quiz(req: QuizRequest): Promise<QuizResponse> {
  const provider = getProvider();
  if (!provider) return offlineQuiz(req);

  const userPrompt = `Difficulty: ${req.difficulty}. Generate exactly ${req.count} multiple-choice questions about this passage. Respond with STRICT JSON only, matching exactly:
{"questions":[{"type":"mcq","prompt":"string","options":["string","string","string","string"],"correctIndex":number,"explanation":"string"}]}

Passage:
"""
${req.text}
"""`;

  try {
    const { text, provider: used } = await chatCompletion([
      { role: "system", content: SYSTEM_BASE },
      { role: "user", content: userPrompt },
    ]);
    const parsed = extractJson<{ questions: QuizQuestion[] }>(text);
    return { mode: "online", provider: used.label, questions: parsed.questions };
  } catch (err) {
    console.error("online quiz failed, falling back:", err);
    return offlineQuiz(req);
  }
}

export async function notes(req: NoteRequest): Promise<NoteResponse> {
  const provider = getProvider();
  if (!provider) return offlineNotes(req);

  const kindPrompt: Record<string, string> = {
    smart: `detailed, descriptive study notes. Build these sections in order:
1. "Core Idea" — one clear paragraph capturing the heart of the passage.
2. "Key Terms" — each key term in bold followed by a plain-language definition.
3. "How It Works" — the main section: explain every concept in the passage in full descriptive sentences (at least 4-6 sentences).
4. "Real-World Examples" — concrete everyday examples that illustrate the ideas.
5. "Connections" — how the ideas link to each other and to the chapter as a whole.
6. "Common Mistakes" — typical misunderstandings students make, and how to avoid them.
7. "Self-Test" — 3 descriptive questions with brief answers to check understanding.`,
    keypoints: `descriptive key points: every bullet is a complete, informative sentence that clearly explains one idea. Group them under headings (Main Ideas, In Depth, Examples, Exam Tip) and add one memorable memory hook.`,
    cheatsheet: `a one-page cheat sheet: a one-line summary, every important formula written out and explained in words, the golden rule to remember, and one quick worked example. Make each section descriptive and self-contained.`,
    flashcards: `at least 4 detailed flashcards: {front, back} pairs. The front asks a clear question; the back is a full descriptive answer of 2-4 complete sentences (never a single word or fragment).`,
  };

  const userPrompt = `Generate ${kindPrompt[req.kind]} Respond with STRICT JSON only, matching exactly:
{"kind":"${req.kind}","title":"string","sections":[{"heading":"string","body":"detailed descriptive paragraph"}],"cards":[{"front":"string","back":"string"}]}
Write every "body" as a descriptive paragraph of complete sentences, not bullet fragments. Include "cards" only for flashcards kind.

Passage:
"""
${req.text}
"""`;

  try {
    const { text, provider: used } = await chatCompletion([
      { role: "system", content: SYSTEM_BASE },
      { role: "user", content: userPrompt },
    ]);
    const parsed = extractJson<NoteResponse>(text);
    return { ...parsed, mode: "online", provider: used.label };
  } catch (err) {
    console.error("online notes failed, falling back:", err);
    return offlineNotes(req);
  }
}

export async function tutor(req: TutorRequest): Promise<TutorResponse> {
  const provider = getProvider();
  if (!provider) return offlineTutor(req);

  const system = `${SYSTEM_BASE}
You are also a personal tutor who remembers the learner's progress. Be encouraging, use Socratic prompting, and adapt to their level.`;
  const context = req.context
    ? `\nCurrent textbook context:\nChapter: ${req.context.chapterTitle}\nSection: ${req.context.sectionTitle}\nExcerpt: ${req.context.excerpt ?? ""}\n`
    : "";
  const langNote = req.language && req.language !== "en"
    ? `\nRespond in ${LANG_NAMES[req.language]}.`
    : "";

  const messages = [
    { role: "system" as const, content: system + context + langNote },
    ...req.messages.slice(-10),
  ];
  const userPrompt = `Answer the student's latest message. Respond with STRICT JSON only: {"reply":"string"}`;

  try {
    const { text, provider: used } = await chatCompletion(
      [...messages, { role: "user", content: userPrompt }],
      { temperature: 0.6 },
    );
    return { ...extractJson<TutorResponse>(text), mode: "online", provider: used.label };
  } catch (err) {
    console.error("online tutor failed, falling back:", err);
    return offlineTutor(req);
  }
}

export async function diagram(req: DiagramRequest): Promise<DiagramResponse> {
  const provider = getProvider();
  if (!provider) return offlineDiagram(req);

  const PALETTE = `COLOR PALETTE (use ONLY these colors):
- Primary nodes: #6366f1 (indigo)
- Secondary nodes: #0ea5e9 (sky)
- Accent/highlight: #f59e0b (amber)
- Success/positive: #10b981 (emerald)
- Danger/negative: #ef4444 (rose)
- Background: #f8fafc (slate-50)
- Card fill: #ffffff (white)
- Dark text: #1e293b (slate-800)
- Medium text: #475569 (slate-600)
- Light text/lines: #94a3b8 (slate-400)
- Borders: #e2e8f0 (slate-200)
- Arrow stroke: #64748b (slate-500)`;

  const kindInstructions: Record<DiagramKind, string> = {
    flowchart: `FLOWCHART rules:
- Start with an oval/rounded-rect "Start" node at top
- Use rectangles for process steps, diamonds for decisions
- Connect with arrows pointing DOWN for flow, SIDEWAYS for branches
- Decision diamonds have "Yes" and "No" branch labels
- End with an oval "End" node
- Each box: max 6 words, center-aligned white text
- Vertical layout, 4-8 steps max
- Box width: 200-260px, height: 44-52px, gap: 28-36px between nodes`,

    "concept-map": `CONCEPT MAP rules:
- Central concept in a LARGE rounded rectangle (280x60px) at center
- Related concepts in medium rounded rects (180x44px) radiating outward
- Connect with labeled lines: relationship text in 11px italic above/beside lines
- Use curved or angled connectors, not all straight
- 4-6 surrounding concepts max
- Color-code: central=#6366f1, sub-concepts alternate #0ea5e9/#10b981/#f59e0b`,

    cycle: `CYCLE rules:
- Arrange 3-6 stages in a CIRCLE formation
- Each stage: rounded rect (140x44px) positioned around a center point
- Connect with curved arrows between stages, arrowheads show direction
- Stage numbers or small icons inside each box
- Stage labels below each box
- Center: empty or small label like "Cycle"
- Color gradient around the cycle: #6366f1 -> #0ea5e9 -> #10b981 -> #f59e0b -> #ef4444 -> #8b5cf6
- Use transform="rotate()" on text if needed for curved labels`,

    hierarchy: `HIERARCHY rules:
- Tree layout: root at top, branches go DOWN
- Root node: large rounded rect (220x50px), fill #6366f1
- Level 2: medium rounded rects (160x40px), fill #0ea5e9
- Level 3: small rounded rects (130x34px), fill #10b981
- Connect with straight vertical lines, then horizontal branches
- Use line elements for connectors, not paths
- Center-align all text
- Max 3 levels, 3-4 nodes per level
- Equal spacing between siblings`,

    sequence: `SEQUENCE rules:
- Two or three vertical lifelines (dashed lines) from top to bottom
- Actor boxes at top of each lifeline (rounded rects, 100x36px)
- Messages as horizontal arrows between lifelines
- Message labels above arrows in 11px
- Messages alternate direction (left-to-right, right-to-left)
- 3-5 messages max
- Add "loop" or "alt" box around repeated sections if applicable
- Color: actor boxes different colors (#6366f1, #0ea5e9), arrows #64748b`,

    comparison: `COMPARISON rules:
- Two-column layout, side by side
- Column headers: large rounded rects (240x44px), fills #6366f1 and #0ea5e9
- 3-5 rows of comparison items
- Each row: two matching rectangles (240x38px), white fill, #e2e8f0 border
- Row content: short phrases (3-5 words max)
- Vertical alignment between rows
- Optional: "VS" label between columns
- Add checkmark icons (✓) or colored indicators for advantages`,
  };

  const userPrompt = `Generate an educational SVG diagram for CBSE Class 10 Science.

TOPIC: "${req.title ?? req.text.slice(0, 80)}"
TYPE: ${req.kind}

${kindInstructions[req.kind]}

${PALETTE}

TEXTBOOK CONTEXT:
"""
${req.text.slice(0, 2500)}
"""

CRITICAL SVG RULES:
1. Start with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 HEIGHT">
2. Use ONLY inline presentation attributes (fill, stroke, font-size, font-weight, text-anchor, rx, etc.)
3. DO NOT use <style> blocks, style="" attributes, <defs>, <clipPath>, <filter>, or <image>
4. DO NOT use XML declarations or DOCTYPE
5. All text MUST use font-family="system-ui, -apple-system, sans-serif"
6. All rectangles MUST have rx="8" or rx="10" for rounded corners
7. Arrows: use <line> with marker-end="url(#arrow)" — define the marker in a minimal <defs> block ONLY for arrows
8. Keep total SVG under 4000 characters
9. Height should be auto-calculated based on content (typically 400-700)
10. Center-align all text with text-anchor="middle"
11. White text (#ffffff) on colored backgrounds, dark text (#1e293b) on light backgrounds

RESPOND WITH STRICT JSON ONLY (no markdown, no explanation):
{"title":"string","svg":"<svg>...complete valid SVG...</svg>","description":"2-3 sentence explanation of what the diagram shows and how to read it"}`;

  try {
    const { text, provider: used } = await chatCompletion(
      [
        { role: "system", content: "You are an expert educational SVG diagram generator. You produce clean, valid SVG XML that renders perfectly in browsers. Output strict JSON only." },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 4000 },
    );
    return { ...extractJson<DiagramResponse>(text), mode: "online", provider: used.label };
  } catch (err) {
    console.error("online diagram failed, falling back:", err);
    return offlineDiagram(req);
  }
}

export interface StreamResult {
  stream: ReadableStream<string>;
  mode: "online" | "offline";
  provider: string;
}

/** Emit text in small chunks so the offline demo also streams token-by-token. */
function chunkOfflineText(text: string): ReadableStream<string> {
  const parts = text.split(/(\s+)/);
  let i = 0;
  return new ReadableStream<string>({
    async pull(ctrl) {
      if (i >= parts.length) {
        ctrl.close();
        return;
      }
      const part = parts[i++];
      if (part) ctrl.enqueue(part);
      await new Promise((r) => setTimeout(r, 6));
    },
  });
}

export async function askStream(req: AskRequest): Promise<StreamResult> {
  const provider = getProvider();
  if (!provider) {
    const res = offlineAsk(req);
    return { stream: chunkOfflineText(res.answer), mode: "offline", provider: "Demo Engine" };
  }

  const userPrompt = `Textbook chapter: ${req.chapterTitle ?? "unknown"}
Section: ${req.sectionTitle ?? "unknown"}
Passage:
"""
${req.text}
"""
Student question: "${req.question}"

Answer helpfully and stay strictly within the textbook context. Reply as plain text (markdown allowed) — no JSON, no code fences. Be concise but thorough.`;

  try {
    const { stream, provider: used } = await streamChat([
      { role: "system", content: SYSTEM_BASE },
      { role: "user", content: userPrompt },
    ]);
    return { stream, mode: "online", provider: used.label };
  } catch (err) {
    console.error("online askStream failed, falling back:", err);
    const res = offlineAsk(req);
    return { stream: chunkOfflineText(res.answer), mode: "offline", provider: "Demo Engine" };
  }
}

export async function tutorStream(req: TutorRequest): Promise<StreamResult> {
  const system = `${SYSTEM_BASE}
You are also a personal tutor who remembers the learner's progress. Be encouraging, use Socratic prompting, and adapt to their level. Reply as plain text (markdown allowed) — no JSON, no code fences.`;
  const context = req.context
    ? `\nCurrent textbook context:\nChapter: ${req.context.chapterTitle}\nSection: ${req.context.sectionTitle}\nExcerpt: ${req.context.excerpt ?? ""}\n`
    : "";
  const langNote = req.language && req.language !== "en"
    ? `\nRespond in ${LANG_NAMES[req.language]}.`
    : "";
  const messages = [
    { role: "system" as const, content: system + context + langNote },
    ...req.messages.slice(-10),
  ];

  const provider = getProvider();
  if (!provider) {
    const res = offlineTutor(req);
    return { stream: chunkOfflineText(res.reply), mode: "offline", provider: "Demo Engine" };
  }

  try {
    const { stream, provider: used } = await streamChat(messages, { temperature: 0.6 });
    return { stream, mode: "online", provider: used.label };
  } catch (err) {
    console.error("online tutorStream failed, falling back:", err);
    const res = offlineTutor(req);
    return { stream: chunkOfflineText(res.reply), mode: "offline", provider: "Demo Engine" };
  }
}
