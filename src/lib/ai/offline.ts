import type {
  AskRequest,
  AskResponse,
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

const CONCEPT_BANK: Record<
  string,
  { def: string; analogy: string; example: string; keywords: string[] }
> = {
  inertia: {
    def: "Inertia is the tendency of an object to resist any change in its state of motion.",
    analogy: "Like a heavy suitcase that refuses to be pushed along — it wants to stay where it is.",
    example: "You lurch forward when a bus suddenly brakes because your body wants to keep moving.",
    keywords: ["inertia", "first law", "resists", "rest", "stationary"],
  },
  force: {
    def: "A force is a push or a pull that can change the motion or shape of an object.",
    analogy: "Like a gentle hand nudging a shopping trolley to start it rolling.",
    example: "Pushing a door open or pulling a wagon are both forces.",
    keywords: ["force", "push", "pull", "newton"],
  },
  acceleration: {
    def: "Acceleration is the rate at which velocity changes over time.",
    analogy: "Like a car pressing the accelerator — you feel the speed building up.",
    example: "A motorcycle going from 0 to 100 km/h in 4 seconds has high acceleration.",
    keywords: ["acceleration", "accelerate", "second law", "m/s²", "m/s2"],
  },
  mass: {
    def: "Mass is the amount of matter in an object, measured in kilograms.",
    analogy: "Like the weight of a backpack full of books — more books, heavier to move.",
    example: "A feather and a hammer have different masses even in the same gravity.",
    keywords: ["mass", "kilogram", "kg", "matter"],
  },
  reaction: {
    def: "A reaction force is the equal and opposite force that one object exerts back on another.",
    analogy: "Like bouncing a ball on the floor — the floor pushes it right back up.",
    example: "A rocket launches because it pushes gas down and the gas pushes it up.",
    keywords: ["reaction", "third law", "action", "opposite"],
  },
  current: {
    def: "Electric current is the flow of electric charge through a conductor, measured in amperes.",
    analogy: "Like water flowing through a pipe — the flow itself is the current.",
    example: "Electrons drifting through a copper wire form an electric current.",
    keywords: ["current", "ampere", "amp", "flow of charge", "electrons"],
  },
  voltage: {
    def: "Voltage is the electric energy given to each unit of charge, measured in volts.",
    analogy: "Like water pressure in a pipe — it pushes the flow along.",
    example: "A 12 V battery gives each coulomb of charge 12 joules of energy.",
    keywords: ["voltage", "volt", "v =", "potential"],
  },
  resistance: {
    def: "Resistance is how strongly a component opposes the flow of current, measured in ohms.",
    analogy: "Like a narrow section of pipe that slows the water flowing through it.",
    example: "A thin, long wire resists current more than a short thick one.",
    keywords: ["resistance", "ohm", "resistor"],
  },
  "ohm's law": {
    def: "Ohm's Law states that voltage equals current multiplied by resistance (V = I·R).",
    analogy: "Like water pressure equals flow rate times pipe narrowness.",
    example: "A 12 V battery across 4 Ω drives 3 A of current.",
    keywords: ["ohm", "v = i", "i = v", "resistance", "voltage"],
  },
  circuit: {
    def: "A circuit is a closed loop that allows electric charge to keep flowing.",
    analogy: "Like a water loop where the pump keeps water moving around and around.",
    example: "A battery, wires, a switch and a bulb form a simple circuit.",
    keywords: ["circuit", "loop", "closed", "series", "parallel"],
  },
};

const MODE_STYLE: Record<ExplainMode, { tone: string; starter: string }> = {
  beginner: {
    tone: "plain, friendly, uses everyday words, no jargon",
    starter: "Imagine you have never studied this before.",
  },
  intermediate: {
    tone: "clear and concise, uses standard textbook terminology",
    starter: "Here is the concept at secondary-school level.",
  },
  expert: {
    tone: "precise and rigorous, uses full mathematical and technical language",
    starter: "Formal treatment with full rigor.",
  },
  child: {
    tone: "playful, uses tiny words, stories and examples a 10-year-old would love",
    starter: "Hey! Let's discover this together with a fun story.",
  },
  exam: {
    tone: "exam-focused, structured like a model answer, highlights marks-relevant points",
    starter: "Model exam-style explanation. Watch for the marks-worthy points.",
  },
};

const EXAMPLES = [
  "Kicking a football on a playground",
  "A bus that brakes suddenly while you stand inside",
  "Pushing a supermarket trolley that is nearly full",
  "A rocket lifting off from the launch pad",
  "Bouncing a ball off a wall",
  "Switching on a torch to light a dark room",
];

const ANALOGIES = [
  "Think of it like water in a garden hose",
  "Think of it like a tug-of-war between two equally strong teams",
  "Think of it like a heavy stone that does not want to be moved",
  "Think of it like a queue of people squeezing through a door",
];

function detectConcept(text: string): string | null {
  const lower = text.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const [name, info] of Object.entries(CONCEPT_BANK)) {
    let score = 0;
    for (const k of info.keywords) {
      if (lower.includes(k)) score += 1;
    }
    if (lower.includes(name.toLowerCase())) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return bestScore >= 1 ? best : null;
}

function hashIndex(text: string, length: number): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h % length;
}

function pick<T>(list: T[], seed: string): T {
  return list[hashIndex(seed, list.length)];
}

const QUESTION_STEMS = [
  "What is the single most important idea in this text, in one sentence?",
  "Can you explain this concept with one real-life example?",
  "What would happen if this principle did not apply?",
  "How is this concept connected to the chapter title?",
];

export function offlineExplain(req: ExplainRequest): ExplainResponse {
  const text = req.text;
  const mode = req.mode;
  const concept = detectConcept(text);
  const style = MODE_STYLE[mode];
  const info = concept ? CONCEPT_BANK[concept] : null;

  const summary = info
    ? `${style.starter} ${info.def} This is the idea known as "${concept}".`
    : `${style.starter} In everyday words: ${text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\[\[(.*?)\]\]/g, "$1")
        .split(".")
        .slice(0, 2)
        .join(".")
        .trim()}.`;

  const points = [
    info
      ? `${concept}: ${info.def}`
      : `Core idea: ${summary.slice(0, 160)}...`,
    `Key term to remember: ${concept ?? "review the highlighted words"}`,
    `Tone used for this ${mode} mode: ${style.tone}.`,
    req.audience ? `Tailored for: ${req.audience}.` : "Suitable for quick revision.",
  ];

  const example = info?.example ?? pick(EXAMPLES, text);
  const analogy = info?.analogy ?? pick(ANALOGIES, text);

  const question =
    mode === "exam"
      ? `[Model answer style] Define ${concept ?? "the concept"} and give a labelled diagram-level explanation with an example.`
      : pick(QUESTION_STEMS, text);
  const checkQuestion = `Quick self-check: ${pick(
    ["Can you define", "State the meaning of", "Give one example of"],
    text,
  )} ${concept ?? "the concept you just read"} in your own words?`;

  return { mode: "offline", provider: "Demo Engine", summary, points, example, analogy, question, checkQuestion };
}

const LANGUAGE_GLOSSARY: Record<LanguageCode, Record<string, string>> = {
  en: {},
  ur: {
    force: "قوت",
    mass: "کمیت",
    acceleration: "اسراع",
    inertia: "جمود",
    velocity: "سعت",
    energy: "توانائی",
    current: "برقی رو",
    voltage: "وولٹیج",
    resistance: "مزاحمت",
    circuit: "سرکٹ",
    motion: "حرکت",
    friction: "رگڑ",
    gravity: "کشش ثقل",
    newtons: "نیوٹن",
  },
  ar: {
    force: "القوة",
    mass: "الكتلة",
    acceleration: "التسارع",
    inertia: "القصور الذاتي",
    velocity: "السرعة",
    energy: "الطاقة",
    current: "التيار",
    voltage: "الجهد",
    resistance: "المقاومة",
    circuit: "الدائرة",
    motion: "الحركة",
    friction: "الاحتكاك",
    gravity: "الجاذبية",
    newtons: "نيوتن",
  },
  de: {
    force: "Kraft",
    mass: "Masse",
    acceleration: "Beschleunigung",
    inertia: "Trägheit",
    velocity: "Geschwindigkeit",
    energy: "Energie",
    current: "Strom",
    voltage: "Spannung",
    resistance: "Widerstand",
    circuit: "Schaltkreis",
    motion: "Bewegung",
    friction: "Reibung",
    gravity: "Schwerkraft",
    newtons: "Newton",
  },
  fr: {
    force: "force",
    mass: "masse",
    acceleration: "accélération",
    inertia: "inertie",
    velocity: "vélocité",
    energy: "énergie",
    current: "courant",
    voltage: "tension",
    resistance: "résistance",
    circuit: "circuit",
    motion: "mouvement",
    friction: "frottement",
    gravity: "gravité",
    newtons: "newton",
  },
  es: {
    force: "fuerza",
    mass: "masa",
    acceleration: "aceleración",
    inertia: "inercia",
    velocity: "velocidad",
    energy: "energía",
    current: "corriente",
    voltage: "voltaje",
    resistance: "resistencia",
    circuit: "circuito",
    motion: "movimiento",
    friction: "fricción",
    gravity: "gravedad",
    newtons: "newton",
  },
  hi: {
    force: "बल",
    mass: "द्रव्यमान",
    acceleration: "त्वरण",
    inertia: "जड़त्व",
    velocity: "वेग",
    energy: "ऊर्जा",
    current: "धारा",
    voltage: "वोल्टेज",
    resistance: "प्रतिरोध",
    circuit: "परिपथ",
    motion: "गति",
    friction: "घर्षण",
    gravity: "गुरुत्वाकर्षण",
    newtons: "न्यूटन",
  },
  zh: {
    force: "力",
    mass: "质量",
    acceleration: "加速度",
    inertia: "惯性",
    velocity: "速度",
    energy: "能量",
    current: "电流",
    voltage: "电压",
    resistance: "电阻",
    circuit: "电路",
    motion: "运动",
    friction: "摩擦力",
    gravity: "重力",
    newtons: "牛顿",
  },
};

export function offlineTranslate(req: TranslateRequest): TranslateResponse {
  const glossary = LANGUAGE_GLOSSARY[req.language] ?? {};
  let translatedText = req.text;
  const lower = req.text.toLowerCase();
  for (const [en, translated] of Object.entries(glossary)) {
    translatedText = translatedText.replace(new RegExp(`\\b${en}\\b`, "gi"), translated);
  }
  const knownTerms = Object.keys(glossary).filter((t) => lower.includes(t)).length;
  const preserved = true;
  if (knownTerms === 0) {
    translatedText = `[Demo mode] Full ${req.language} translation requires an AI provider key. The text's key science terms would be translated; here they are mapped automatically: ${req.text}`;
  } else {
    translatedText = `${translatedText}\n\n(Key scientific terms translated to ${req.language}${req.language === "ur" ? " — اردو" : ""}. Connect an AI provider for full fluency.)`;
  }
  return { mode: "offline", provider: "Demo Engine", translatedText, preserved };
}

export function offlineAsk(req: AskRequest): AskResponse {
  const concept = detectConcept(`${req.text} ${req.question}`);
  const q = req.question.toLowerCase();

  if (q.includes("what does") || q.includes("meaning") || q.includes("mean") || q.includes("what is")) {
    if (concept) {
      const info = CONCEPT_BANK[concept];
      return {
        mode: "offline",
        provider: "Demo Engine",
        answer: `${info.def} ${info.analogy} Example: ${info.example}`,
      };
    }
    return {
      mode: "offline",
      provider: "Demo Engine",
      answer: "Here is a plain-language reading of this passage: " + req.text.replace(/\*\*/g, "").split(".").slice(0, 2).join(". ") + ".",
    };
  }

  if (q.includes("example")) {
    const ex = concept ? CONCEPT_BANK[concept].example : pick(EXAMPLES, req.text);
    return { mode: "offline", provider: "Demo Engine", answer: `Example: ${ex}` };
  }

  if (q.includes("like i") || q.includes("ten") || q.includes("10")) {
    const concept2 = detectConcept(req.text);
    if (concept2) {
      return {
        mode: "offline",
        provider: "Demo Engine",
        answer: `Imagine you're 10! ${CONCEPT_BANK[concept2].analogy}`,
      };
    }
  }

  if (q.includes("urdu")) {
    const t = offlineTranslate({ text: req.text, language: "ur" });
    return { mode: "offline", provider: "Demo Engine", answer: t.translatedText };
  }

  if (q.includes("math") || q.includes("formula") || q.includes("equation")) {
    return {
      mode: "offline",
      provider: "Demo Engine",
      answer: "Mathematically, look for the key relationships in this chapter. For example, Newton's Second Law is F = m·a and Ohm's Law is V = I·R. Express every quantity in SI units before substituting.",
    };
  }

  const concept3 = detectConcept(req.text);
  const info = concept3 ? CONCEPT_BANK[concept3] : null;
  return {
    mode: "offline",
    provider: "Demo Engine",
    answer: info
      ? `${info.def} A good way to check understanding: ${info.analogy}`
      : "Great question! In demo mode, try asking 'what does this mean', 'give an example', or 'explain like I'm 10'. Connect an AI provider key (OPENAI_API_KEY or GEMINI_API_KEY) for unlimited free-form answers.",
  };
}

export function offlineQuiz(req: QuizRequest): QuizResponse {
  const { text, difficulty, count } = req;
  const concept = detectConcept(text);
  const n = Math.min(count, 5);
  const questions: QuizQuestion[] = [];
  const sentences = text
    .replace(/\*\*/g, "")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const base = concept ? CONCEPT_BANK[concept] : null;
  const target = (concept ?? "this concept") as string;

  const pool: QuizQuestion[] = [
    {
      id: "q1",
      type: "mcq",
      prompt: `What does ${target} mean in physics?`,
      options: [
        base ? base.def : "It is a core idea introduced in this chapter.",
        "It is a measurement tool used in laboratories.",
        "It is a unit of length.",
        "It has no relation to the chapter.",
      ],
      correctIndex: 0,
      explanation: base
        ? `${base.def} ${base.analogy}`
        : "The first option reflects the definition in the text.",
    },
    {
      id: "q2",
      type: "mcq",
      prompt: `Which statement is TRUE about ${target}?`,
      options: [
        "It can be explained with a real-life example.",
        "It only applies to outer space.",
        "It never appears in daily life.",
        "It contradicts the other laws in the chapter.",
      ],
      correctIndex: 0,
      explanation: "Physics concepts are confirmed by everyday observations and experiments.",
    },
    {
      id: "q3",
      type: "mcq",
      prompt: `A good study habit for mastering ${target} is:`,
      options: [
        "Practising with examples and self-check questions.",
        "Memorising without understanding.",
        "Skipping diagrams.",
        "Avoiding practice tests.",
      ],
      correctIndex: 0,
      explanation: "Active recall with examples builds lasting understanding.",
    },
  ];

  if (difficulty !== "easy") {
    pool.push({
      id: "q4",
      type: "mcq",
      prompt: `(${difficulty} level) Which of these best matches the text you just read?`,
      options: [
        sentences[0] ?? "The text defines a physical law.",
        "The text is about cooking recipes.",
        "The text is a poem.",
        "The text is unrelated to science.",
      ],
      correctIndex: 0,
      explanation: "Sentence 1 of the passage restates the core idea.",
    });
    pool.push({
      id: "q5",
      type: "mcq",
      prompt: `Identify the correct application of ${target}:`,
      options: [
        base ? base.example : "Applying the idea in a real device.",
        "Using it to measure temperature only.",
        "Applying it only in space.",
        "None of these.",
      ],
      correctIndex: 0,
      explanation: base
        ? `Real example: ${base.example}`
        : "The concept applies to real-world devices and situations.",
    });
  }

  for (let i = 0; i < n && i < pool.length; i++) {
    const q = { ...pool[hashIndex(text + i + difficulty, pool.length) % pool.length], id: `q${i + 1}-${Date.now()}` };
    if (!questions.some((x) => x.prompt === q.prompt)) questions.push(q);
    if (questions.length >= n) break;
  }
  return { mode: "offline", provider: "Demo Engine", questions };
}

export function offlineNotes(req: NoteRequest): NoteResponse {
  const { text, kind } = req;
  const concept = detectConcept(text);
  const info = concept ? CONCEPT_BANK[concept] : null;
  const clean = text.replace(/\*\*/g, "").replace(/\[\[(.*?)\]\]/g, "$1");
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 15);
  const core = info
    ? `${info.def} Key real-life example: ${info.example}.`
    : sentences.slice(0, 2).join(" ");

  const sections =
    kind === "smart"
      ? [
          { heading: "Core Idea", body: core },
          {
            heading: "How It Works",
            body: sentences.length
              ? `${sentences.slice(0, 3).join(" ")} ${sentences.length > 3 ? "The passage then shows how these ideas fit together and apply in real situations." : ""}`.trim()
              : core,
          },
          {
            heading: "Key Terms",
            body: concept
              ? `${concept} — ${info?.def ?? "core chapter term"}. Know its definition, its symbol (if any) and one example before moving on.`
              : "Identify the main technical words in the passage; each one is a key term. Write a one-line definition for each in your own words.",
          },
          { heading: "Real-World Example", body: pick(EXAMPLES, text) },
          {
            heading: "Connections",
            body: `"${concept ?? "This idea"}" builds on what came before in the section and links to the chapter's main theme. Describe how the ideas support one another and where this topic reappears later.`,
          },
          {
            heading: "Common Mistakes",
            body: "A frequent mistake is mixing up cause and effect, or forgetting the units in calculations. Re-read the passage, then check every claim against the definition and its example.",
          },
          {
            heading: "Self-Test",
            body: "Without looking, write a three-sentence summary of the passage, list its key terms, and explain how any two of them relate. Then compare your answer with the text.",
          },
        ]
      : kind === "keypoints"
        ? [
            { heading: "Key Points", body: core },
            {
              heading: "In Depth",
              body: sentences.length
                ? `${sentences.slice(0, 2).join(" ")} ${sentences.length > 2 ? "Continue building the explanation step by step until every idea in the passage is covered." : ""}`.trim()
                : core,
            },
            { heading: "Memory Hook", body: info?.analogy ?? "Use the chapter title as a hook: link each key term to the big idea so one reminds you of the other." },
            { heading: "Exam Note", body: "State the law or principle, give the formula, then apply it to one worked example in three clear lines." },
          ]
        : kind === "cheatsheet"
          ? [
              { heading: "One-Liner", body: core },
              { heading: "Formula(s)", body: concept === "ohm's law" || concept === "resistance" || concept === "current" || concept === "voltage" ? "V = I·R  |  I = V/R  |  R = V/I — voltage equals current times resistance; the other two are rearrangements." : "F = m·a  |  a = F/m  |  action = −reaction — force equals mass times acceleration; acceleration equals force divided by mass." },
              { heading: "Golden Rule", body: info?.analogy ?? "Always define your symbols and use SI units before calculating." },
              { heading: "Quick Example", body: pick(EXAMPLES, text) },
            ]
          : [];

  const cards: { front: string; back: string }[] = [];
  if (kind === "flashcards" && concept) {
    cards.push({ front: `Define "${concept}"`, back: `${info!.def} In everyday terms, this means ${info!.analogy.toLowerCase()}` });
    cards.push({ front: `Give an example of ${concept}`, back: `${info!.example} Notice how the example shows the definition in action.` });
    cards.push({ front: `Analogy for ${concept}`, back: `${info!.analogy} An analogy makes the abstract idea feel familiar.` });
    cards.push({ front: "What does F = m·a mean in words?", back: "Acceleration is directly proportional to force and inversely proportional to mass: push harder and it speeds up more, while heavier objects need more force for the same acceleration." });
  } else if (kind === "flashcards") {
    cards.push({ front: "State the main idea of this passage", back: core });
    cards.push({ front: "Give one everyday example", back: pick(EXAMPLES, text) });
    cards.push({ front: "Rewrite it in your own words", back: sentences.slice(0, 1).join(" ").slice(0, 140) });
  }

  return {
    mode: "offline",
    provider: "Demo Engine",
    kind,
    title: `${kind === "smart" ? "Smart Notes" : kind === "keypoints" ? "Key Points" : kind === "cheatsheet" ? "Cheat Sheet" : "Flashcards"} · ${concept ?? "Chapter"} `,
    sections,
    cards: cards.length ? cards : undefined,
  };
}

export function offlineTutor(req: TutorRequest): TutorResponse {
  const last = req.messages[req.messages.length - 1];
  const q = last.content.toLowerCase();
  const context = req.context?.excerpt ?? "";

  if (q.includes("quiz") || q.includes("test") || q.includes("questions")) {
    return {
      mode: "offline",
      provider: "Demo Engine",
      reply: "I can create a quiz for you. Use the Quiz tool in the toolbar, pick a difficulty, and I'll build questions from this chapter. When you finish, your score is saved to your progress dashboard.",
    };
  }
  if (q.includes("flashcard")) {
    return {
      mode: "offline",
      provider: "Demo Engine",
      reply: "Head to the Flashcards tool — I generate cards automatically from this section. Tap each card to flip it and test yourself.",
    };
  }
  if (q.includes("summary") || q.includes("summar")) {
    const concept = detectConcept(context);
    return {
      mode: "offline",
      provider: "Demo Engine",
      reply: `Summary: ${concept ? CONCEPT_BANK[concept].def + " " + CONCEPT_BANK[concept].example : "This section explains a core concept of " + (req.context?.chapterTitle ?? "this chapter") + ". Review the key bolded terms, then try the self-test."}`,
    };
  }
  const answer = offlineAsk({
    text: context || "Newton's laws of motion and electric circuits.",
    question: last.content,
    chapterTitle: req.context?.chapterTitle,
    sectionTitle: req.context?.sectionTitle,
  });
  return { mode: answer.mode, provider: answer.provider, reply: answer.answer };
}

const SIMPLE_SVGS: Record<string, string> = {
  flowchart: `<svg viewBox="0 0 600 620" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L9,5 L0,9z" fill="#c2843f"/></marker></defs>
  <rect width="600" height="620" fill="#fdf8f3" rx="12"/>
  <text x="300" y="36" text-anchor="middle" font-family="system-ui" font-size="20" font-weight="bold" fill="#241a12">Process Flowchart</text>
  <rect x="210" y="56" width="180" height="44" rx="22" fill="#f97316"/>
  <text x="300" y="83" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="600" fill="#fff">Start</text>
  <line x1="300" y1="100" x2="300" y2="132" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <rect x="170" y="132" width="260" height="48" rx="8" fill="#f59e0b"/>
  <text x="300" y="161" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">1. Collect Raw Data</text>
  <line x1="300" y1="180" x2="300" y2="212" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <rect x="170" y="212" width="260" height="48" rx="8" fill="#f59e0b"/>
  <text x="300" y="241" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">2. Process &amp; Analyze</text>
  <line x1="300" y1="260" x2="300" y2="292" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <polygon points="300,292 390,332 300,372 210,332" fill="#fb923c" stroke="#eadfc9" stroke-width="1"/>
  <text x="300" y="337" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#241a12">Valid?</text>
  <line x1="210" y1="332" x2="100" y2="332" stroke="#c2843f" stroke-width="2"/>
  <line x1="100" y1="332" x2="100" y2="432" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <text x="152" y="326" font-family="system-ui" font-size="11" font-weight="500" fill="#ef4444">No</text>
  <rect x="30" y="432" width="140" height="44" rx="8" fill="#ef4444"/>
  <text x="100" y="459" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Flag for Review</text>
  <line x1="300" y1="372" x2="300" y2="432" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <text x="318" y="400" font-family="system-ui" font-size="11" font-weight="500" fill="#10b981">Yes</text>
  <rect x="170" y="432" width="260" height="48" rx="8" fill="#10b981"/>
  <text x="300" y="461" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">3. Generate Report</text>
  <line x1="300" y1="480" x2="300" y2="512" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <rect x="170" y="512" width="260" height="48" rx="8" fill="#10b981"/>
  <text x="300" y="541" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">4. Store Results</text>
  <line x1="300" y1="560" x2="300" y2="576" stroke="#c2843f" stroke-width="2" marker-end="url(#a1)"/>
  <rect x="210" y="576" width="180" height="38" rx="19" fill="#f97316"/>
  <text x="300" y="600" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">End</text>
</svg>`,

  "concept-map": `<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9z" fill="#c2843f"/></marker></defs>
  <rect width="600" height="500" fill="#fdf8f3" rx="12"/>
  <text x="300" y="36" text-anchor="middle" font-family="system-ui" font-size="20" font-weight="bold" fill="#241a12">Concept Map</text>
  <rect x="180" y="210" width="240" height="60" rx="12" fill="#f97316"/>
  <text x="300" y="247" text-anchor="middle" font-family="system-ui" font-size="16" font-weight="bold" fill="#fff">Core Concept</text>
  <rect x="50" y="80" width="170" height="48" rx="10" fill="#f59e0b"/>
  <text x="135" y="109" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">Definition</text>
  <line x1="220" y1="110" x2="260" y2="210" stroke="#d9c3a8" stroke-width="1.8" marker-end="url(#a2)"/>
  <text x="226" y="156" font-family="system-ui" font-size="10" fill="#8a6b4f" font-style="italic">defines</text>
  <rect x="380" y="80" width="170" height="48" rx="10" fill="#fb923c"/>
  <text x="465" y="109" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">Properties</text>
  <line x1="380" y1="110" x2="340" y2="210" stroke="#d9c3a8" stroke-width="1.8" marker-end="url(#a2)"/>
  <text x="374" y="156" font-family="system-ui" font-size="10" fill="#8a6b4f" font-style="italic">describes</text>
  <rect x="50" y="360" width="170" height="48" rx="10" fill="#10b981"/>
  <text x="135" y="389" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">Applications</text>
  <line x1="220" y1="384" x2="260" y2="270" stroke="#d9c3a8" stroke-width="1.8" marker-end="url(#a2)"/>
  <text x="226" y="334" font-family="system-ui" font-size="10" fill="#8a6b4f" font-style="italic">used in</text>
  <rect x="380" y="360" width="170" height="48" rx="10" fill="#f59e0b"/>
  <text x="465" y="389" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">Examples</text>
  <line x1="380" y1="384" x2="340" y2="270" stroke="#d9c3a8" stroke-width="1.8" marker-end="url(#a2)"/>
  <text x="374" y="334" font-family="system-ui" font-size="10" fill="#8a6b4f" font-style="italic">illustrates</text>
  <rect x="200" y="420" width="200" height="44" rx="10" fill="#f97316" opacity="0.15"/>
  <text x="300" y="447" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#f97316">Related: See Chapter 5</text>
  <line x1="300" y1="270" x2="300" y2="420" stroke="#d9c3a8" stroke-width="1.2" stroke-dasharray="4"/>
</svg>`,

  cycle: `<svg viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L9,5 L0,9z" fill="#c2843f"/></marker></defs>
  <rect width="600" height="520" fill="#fdf8f3" rx="12"/>
  <text x="300" y="36" text-anchor="middle" font-family="system-ui" font-size="20" font-weight="bold" fill="#241a12">Cycle Diagram</text>
  <circle cx="300" cy="280" r="140" fill="none" stroke="#eadfc9" stroke-width="2.5" stroke-dasharray="8 4"/>
  <rect x="220" y="80" width="160" height="48" rx="10" fill="#f97316"/>
  <text x="300" y="109" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">1. Initiation</text>
  <line x1="370" y1="120" x2="430" y2="190" stroke="#c2843f" stroke-width="2" marker-end="url(#a3)"/>
  <rect x="420" y="190" width="160" height="48" rx="10" fill="#fb923c"/>
  <text x="500" y="219" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">2. Execution</text>
  <line x1="520" y1="248" x2="470" y2="340" stroke="#c2843f" stroke-width="2" marker-end="url(#a3)"/>
  <rect x="370" y="380" width="160" height="48" rx="10" fill="#10b981"/>
  <text x="450" y="409" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">3. Evaluation</text>
  <line x1="370" y1="404" x2="270" y2="404" stroke="#c2843f" stroke-width="2" marker-end="url(#a3)"/>
  <rect x="80" y="380" width="160" height="48" rx="10" fill="#f59e0b"/>
  <text x="160" y="409" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#241a12">4. Optimization</text>
  <line x1="130" y1="380" x2="180" y2="310" stroke="#c2843f" stroke-width="2" marker-end="url(#a3)"/>
  <rect x="80" y="190" width="160" height="48" rx="10" fill="#ef4444"/>
  <text x="160" y="219" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">5. Review</text>
  <line x1="180" y1="190" x2="240" y2="128" stroke="#c2843f" stroke-width="2" marker-end="url(#a3)"/>
  <text x="300" y="285" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#d9c3a8">Repeat</text>
</svg>`,

  hierarchy: `<svg viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="480" fill="#fdf8f3" rx="12"/>
  <text x="300" y="36" text-anchor="middle" font-family="system-ui" font-size="20" font-weight="bold" fill="#241a12">Hierarchy</text>
  <rect x="190" y="56" width="220" height="52" rx="10" fill="#f97316"/>
  <text x="300" y="88" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="bold" fill="#fff">Kingdom</text>
  <line x1="300" y1="108" x2="300" y2="138" stroke="#c2843f" stroke-width="2"/>
  <line x1="100" y1="138" x2="500" y2="138" stroke="#c2843f" stroke-width="2"/>
  <line x1="100" y1="138" x2="100" y2="168" stroke="#c2843f" stroke-width="2"/>
  <line x1="230" y1="138" x2="230" y2="168" stroke="#c2843f" stroke-width="2"/>
  <line x1="370" y1="138" x2="370" y2="168" stroke="#c2843f" stroke-width="2"/>
  <line x1="500" y1="138" x2="500" y2="168" stroke="#c2843f" stroke-width="2"/>
  <rect x="35" y="168" width="130" height="42" rx="8" fill="#f59e0b"/>
  <text x="100" y="194" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Animalia</text>
  <rect x="165" y="168" width="130" height="42" rx="8" fill="#f59e0b"/>
  <text x="230" y="194" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Plantae</text>
  <rect x="305" y="168" width="130" height="42" rx="8" fill="#fb923c"/>
  <text x="370" y="194" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Fungi</text>
  <rect x="435" y="168" width="130" height="42" rx="8" fill="#fb923c"/>
  <text x="500" y="194" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Monera</text>
  <line x1="100" y1="210" x2="100" y2="248" stroke="#c2843f" stroke-width="1.5"/>
  <line x1="55" y1="248" x2="145" y2="248" stroke="#c2843f" stroke-width="1.5"/>
  <line x1="55" y1="248" x2="55" y2="278" stroke="#c2843f" stroke-width="1.5"/>
  <line x1="145" y1="248" x2="145" y2="278" stroke="#c2843f" stroke-width="1.5"/>
  <rect x="20" y="278" width="70" height="32" rx="6" fill="#10b981"/>
  <text x="55" y="299" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#fff">Vertebrata</text>
  <rect x="110" y="278" width="70" height="32" rx="6" fill="#10b981"/>
  <text x="145" y="299" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#fff">Invertebrata</text>
  <line x1="230" y1="210" x2="230" y2="248" stroke="#c2843f" stroke-width="1.5"/>
  <line x1="190" y1="248" x2="270" y2="248" stroke="#c2843f" stroke-width="1.5"/>
  <line x1="190" y1="248" x2="190" y2="278" stroke="#c2843f" stroke-width="1.5"/>
  <line x1="270" y1="248" x2="270" y2="278" stroke="#c2843f" stroke-width="1.5"/>
  <rect x="155" y="278" width="70" height="32" rx="6" fill="#f59e0b"/>
  <text x="190" y="299" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#241a12">Angiosperm</text>
  <rect x="235" y="278" width="70" height="32" rx="6" fill="#f59e0b"/>
  <text x="270" y="299" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#241a12">Gymnosperm</text>
  <rect x="150" y="340" width="300" height="40" rx="8" fill="#f97316" opacity="0.1"/>
  <text x="300" y="365" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#f97316">Five Kingdom Classification (Whittaker, 1969)</text>
</svg>`,

  sequence: `<svg viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,1 L9,5 L0,9z" fill="#c2843f"/></marker></defs>
  <rect width="600" height="480" fill="#fdf8f3" rx="12"/>
  <text x="300" y="36" text-anchor="middle" font-family="system-ui" font-size="20" font-weight="bold" fill="#241a12">Sequence Diagram</text>
  <rect x="80" y="56" width="130" height="42" rx="10" fill="#f97316"/>
  <text x="145" y="82" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">Client</text>
  <rect x="390" y="56" width="130" height="42" rx="10" fill="#f59e0b"/>
  <text x="455" y="82" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="600" fill="#fff">Server</text>
  <line x1="145" y1="98" x2="145" y2="440" stroke="#d9c3a8" stroke-width="1.5" stroke-dasharray="5 3"/>
  <line x1="455" y1="98" x2="455" y2="440" stroke="#d9c3a8" stroke-width="1.5" stroke-dasharray="5 3"/>
  <rect x="115" y="114" width="60" height="16" rx="4" fill="#f97316" opacity="0.12"/>
  <text x="145" y="126" text-anchor="middle" font-family="system-ui" font-size="8" font-weight="500" fill="#f97316">activate</text>
  <line x1="165" y1="144" x2="435" y2="144" stroke="#f97316" stroke-width="2" marker-end="url(#a4)"/>
  <text x="300" y="138" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#241a12">1. sendRequest()</text>
  <rect x="430" y="156" width="50" height="14" rx="4" fill="#f59e0b" opacity="0.12"/>
  <text x="455" y="166" text-anchor="middle" font-family="system-ui" font-size="8" font-weight="500" fill="#f59e0b">process</text>
  <line x1="435" y1="190" x2="165" y2="190" stroke="#f59e0b" stroke-width="2" marker-end="url(#a4)"/>
  <text x="300" y="184" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#241a12">2. sendData()</text>
  <line x1="165" y1="228" x2="435" y2="228" stroke="#f97316" stroke-width="2" marker-end="url(#a4)"/>
  <text x="300" y="222" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#241a12">3. processData()</text>
  <rect x="400" y="242" width="110" height="64" rx="6" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="1"/>
  <text x="455" y="258" text-anchor="middle" font-family="system-ui" font-size="10" font-weight="600" fill="#f59e0b">loop [more data]</text>
  <line x1="435" y1="280" x2="165" y2="280" stroke="#f59e0b" stroke-width="2" marker-end="url(#a4)"/>
  <text x="300" y="274" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#241a12">4. chunk()</text>
  <line x1="165" y1="320" x2="435" y2="320" stroke="#f97316" stroke-width="2" marker-end="url(#a4)"/>
  <text x="300" y="314" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#241a12">5. finalize()</text>
  <line x1="435" y1="358" x2="165" y2="358" stroke="#10b981" stroke-width="2" marker-end="url(#a4)"/>
  <text x="300" y="352" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#241a12">6. ACK + complete</text>
  <rect x="115" y="374" width="60" height="16" rx="4" fill="#f97316" opacity="0.12"/>
  <text x="145" y="386" text-anchor="middle" font-family="system-ui" font-size="8" font-weight="500" fill="#f97316">deactivate</text>
</svg>`,

  comparison: `<svg viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="520" fill="#fdf8f3" rx="12"/>
  <text x="300" y="36" text-anchor="middle" font-family="system-ui" font-size="20" font-weight="bold" fill="#241a12">Comparison</text>
  <rect x="30" y="56" width="250" height="48" rx="10" fill="#f97316"/>
  <text x="155" y="85" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="bold" fill="#fff">Option A</text>
  <rect x="320" y="56" width="250" height="48" rx="10" fill="#f59e0b"/>
  <text x="445" y="85" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="bold" fill="#fff">Option B</text>
  <line x1="30" y1="120" x2="280" y2="120" stroke="#eadfc9" stroke-width="1"/>
  <line x1="320" y1="120" x2="570" y2="120" stroke="#eadfc9" stroke-width="1"/>
  <rect x="40" y="130" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="155" y="156" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 1: Speed</text>
  <rect x="330" y="130" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="445" y="156" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 1: Speed</text>
  <rect x="40" y="182" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="155" y="208" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 2: Cost</text>
  <rect x="330" y="182" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="445" y="208" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 2: Cost</text>
  <rect x="40" y="234" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="155" y="260" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 3: Accuracy</text>
  <rect x="330" y="234" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="445" y="260" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 3: Accuracy</text>
  <rect x="40" y="286" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="155" y="312" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 4: Ease of Use</text>
  <rect x="330" y="286" width="230" height="42" rx="8" fill="#fff" stroke="#eadfc9" stroke-width="1"/>
  <text x="445" y="312" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="500" fill="#241a12">Feature 4: Ease of Use</text>
  <rect x="95" y="348" width="120" height="36" rx="8" fill="#10b981"/>
  <text x="155" y="371" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Recommended</text>
  <rect x="385" y="348" width="120" height="36" rx="8" fill="#ef4444"/>
  <text x="445" y="371" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="600" fill="#fff">Alternative</text>
  <rect x="140" y="410" width="320" height="38" rx="8" fill="#f97316" opacity="0.1"/>
  <text x="300" y="434" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="500" fill="#f97316">Choose based on your specific requirements</text>
</svg>`,
};

export function offlineDiagram(req: DiagramRequest): DiagramResponse {
  const kind = req.kind || "concept-map";
  const svg = SIMPLE_SVGS[kind] ?? SIMPLE_SVGS["concept-map"];
  return {
    mode: "offline",
    provider: "Demo Engine",
    title: req.title ?? "Diagram",
    svg,
    description: `A simple ${kind} diagram showing the concept. Connect to the internet for AI-generated, topic-specific diagrams with richer detail.`,
  };
}
