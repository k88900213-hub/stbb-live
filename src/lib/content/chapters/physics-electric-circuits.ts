import type { Chapter } from "../types";

export const electricCircuits: Chapter = {
  slug: "physics-electric-circuits",
  title: "Electric Circuits",
  subject: "Physics",
  grade: "Grades 9–12 · University",
  shortDescription:
    "How electric charge flows, what resists it, and how to build a working circuit from battery, wires, switch and bulb.",
  keywords: [
    "current",
    "voltage",
    "resistance",
    "ohm",
    "circuit",
    "series",
    "parallel",
    "battery",
    "conductor",
    "electron",
  ],
  readingTime: 11,
  sections: [
    {
      id: "sec-charge",
      title: "Charge, Current & Voltage",
      blocks: [
        {
          id: "b-charge-1",
          type: "paragraph",
          content:
            "An **electric circuit** is a closed path that lets charge flow continuously. Charge is carried by tiny particles called **electrons**, which drift through conductors such as copper wire when pushed by an electric field.",
        },
        {
          id: "b-charge-2",
          type: "paragraph",
          content:
            "**Current ($I$)** is the rate of charge flow through a wire, measured in **amperes (A)**. **Voltage ($V$)** is the energy given to each unit of charge by the battery, measured in **volts (V)**. Think of voltage as pressure and current as the flow itself.",
        },
        {
          id: "b-charge-formula",
          type: "formula",
          formula: "I = \\frac{\\Delta Q}{\\Delta t} \\qquad V = \\frac{W}{Q}",
          caption: "Current is charge per time; voltage is energy per unit charge.",
        },
        {
          id: "b-charge-callout",
          type: "callout",
          variant: "key",
          content:
            "A circuit must be **closed** for current to flow. A break anywhere — a loose wire or an open switch — stops the flow everywhere.",
        },
      ],
    },
    {
      id: "sec-ohm",
      title: "Ohm's Law & Resistance",
      blocks: [
        {
          id: "b-ohm-1",
          type: "paragraph",
          content:
            "Materials resist the flow of charge. **Resistance ($R$)** measures how strongly a component opposes current, and is measured in **ohms (Ω)**.",
        },
        {
          id: "b-ohm-formula",
          type: "formula",
          formula: "V = I \\cdot R \\qquad \\Rightarrow \\qquad I = \\frac{V}{R}",
          caption: "Ohm's Law: the current through a resistor is directly proportional to voltage and inversely proportional to resistance.",
        },
        {
          id: "b-ohm-2",
          type: "paragraph",
          content:
            "This single relationship is the most used equation in electronics. A 12 V battery connected across a 4 Ω resistor drives a current of 3 A. Increase the resistance and the current drops; raise the voltage and the current rises.",
        },
        {
          id: "b-ohm-list",
          type: "list",
          content: "Quick checks with Ohm's Law:",
          items: [
            "V = 12 V, R = 6 Ω  →  I = 2 A",
            "V = 9 V, R = 3 Ω  →  I = 3 A",
            "V = 5 V, I = 0.5 A  →  R = 10 Ω",
            "I = 2 A, R = 8 Ω  →  V = 16 V",
          ],
        },
        {
          id: "b-ohm-callout",
          type: "callout",
          variant: "tip",
          content:
            "A thicker wire has **lower** resistance; a longer wire has **higher** resistance. Temperature also matters — most conductors resist more when hot.",
        },
      ],
    },
    {
      id: "sec-series",
      title: "Series & Parallel Circuits",
      blocks: [
        {
          id: "b-series-1",
          type: "paragraph",
          content:
            "Components can be connected in two fundamental ways. In a **series** circuit there is a single path — the same current flows through every component, and the total resistance is the sum of the individual resistances.",
        },
        {
          id: "b-series-formula",
          type: "formula",
          formula: "R_{\\text{total}} = R_1 + R_2 + \\cdots + R_n",
          caption: "Series: resistances add.",
        },
        {
          id: "b-series-2",
          type: "paragraph",
          content:
            "In a **parallel** circuit each component has its own branch connected across the same voltage. The total current splits among branches, and the total resistance is smaller than the smallest single resistor.",
        },
        {
          id: "b-series-formula2",
          type: "formula",
          formula: "\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots + \\frac{1}{R_n}",
          caption: "Parallel: reciprocals add.",
        },
        {
          id: "b-series-callout",
          type: "callout",
          variant: "info",
          content:
            "Household wiring is parallel: if one bulb burns out, the others stay on. Series strings like old fairy lights fail as a whole when one bulb breaks.",
        },
        {
          id: "b-series-sim",
          type: "simulation",
          sim: "circuit",
          caption: "Interactive: build a circuit from a battery, switch, wires and a bulb. Flip the switch and watch the electrons flow.",
        },
      ],
    },
    {
      id: "sec-review",
      title: "Chapter Review",
      blocks: [
        {
          id: "b-review-1",
          type: "paragraph",
          content:
            "Electric circuits are about three quantities — current, voltage and resistance — tied together by Ohm's Law, and arranged in series or parallel. Master these ideas and you can analyze any simple circuit in seconds.",
        },
        {
          id: "b-review-callout",
          type: "callout",
          variant: "info",
          content:
            "Ask the AI tutor to generate a quiz, flashcards, or a cheat sheet for this chapter, or ask it to explain Ohm's Law like you are ten years old.",
        },
      ],
    },
  ],
};
