import type { Chapter } from "../types";

export const newtonsLaws: Chapter = {
  slug: "physics-newtons-laws",
  title: "Newton's Laws of Motion",
  subject: "Physics",
  grade: "Grades 9–12 · University",
  shortDescription:
    "The three laws that govern how objects move and interact, from a resting book to a rocket launch.",
  keywords: [
    "force",
    "mass",
    "acceleration",
    "inertia",
    "action",
    "reaction",
    "newton",
    "friction",
    "momentum",
  ],
  readingTime: 12,
  sections: [
    {
      id: "sec-intro",
      title: "Why Motion Matters",
      blocks: [
        {
          id: "b-intro-1",
          type: "paragraph",
          content:
            "Every object around you is either at rest or in motion, and **Isaac Newton** described both states with three elegant laws published in **1687** in his masterpiece, the *Principia*. These laws are so universal that they still power modern engineering, spaceflight, and the physics of everyday life.",
        },
        {
          id: "b-intro-2",
          type: "paragraph",
          content:
            "A skateboard rolling to a stop, a car braking suddenly, a rocket escaping Earth's gravity — all of these obey the same three rules. Understanding them unlocks the logic behind nearly every machine humans have ever built.",
        },
        {
          id: "b-intro-callout",
          type: "callout",
          variant: "key",
          content:
            "The single most important idea: **motion changes only when a force acts**. No force, no change — this is the heart of Newton's First Law.",
        },
      ],
    },
    {
      id: "sec-first-law",
      title: "First Law — Inertia",
      blocks: [
        {
          id: "b-first-1",
          type: "paragraph",
          content:
            "Newton's **First Law** states: *An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction, unless acted upon by an unbalanced external force.*",
        },
        {
          id: "b-first-2",
          type: "paragraph",
          content:
            "This tendency to resist changes in motion is called **inertia**. Inertia is not a force — it is a property of mass. The more massive an object, the harder it is to start it moving, stop it, or change its direction.",
        },
        {
          id: "b-first-ex",
          type: "list",
          content: "Everyday examples of inertia:",
          items: [
            "Your body lurches forward when a bus brakes suddenly.",
            "Dust flies off a shaking rug while the rug stops.",
            "A coin resting on a card stays behind when you flick the card away.",
            "Seatbelts exist because your body keeps moving when the car stops.",
          ],
        },
        {
          id: "b-first-formula",
          type: "formula",
          formula: "\\sum \\vec{F} = 0 \\quad \\Rightarrow \\quad \\vec{v} = \\text{constant}",
          caption: "First Law in symbols: zero net force means constant velocity (including zero).",
        },
        {
          id: "b-first-sim",
          type: "simulation",
          sim: "forces",
          caption: "Interactive: apply a force and watch an object's motion. Then remove the force — does it stop or keep gliding?",
        },
      ],
    },
    {
      id: "sec-second-law",
      title: "Second Law — Force, Mass & Acceleration",
      blocks: [
        {
          id: "b-second-1",
          type: "paragraph",
          content:
            "Newton's **Second Law** quantifies how a force changes motion: the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.",
        },
        {
          id: "b-second-formula",
          type: "formula",
          formula: "\\vec{F} = m \\cdot \\vec{a} \\qquad \\Rightarrow \\qquad a = \\frac{F}{m}",
          caption: "The famous equation. Push harder → more acceleration. More mass → less acceleration.",
        },
        {
          id: "b-second-2",
          type: "paragraph",
          content:
            "Force is measured in **newtons (N)**, mass in **kilograms (kg)**, and acceleration in **meters per second squared (m/s²)**. One newton is exactly the force needed to accelerate a 1 kg mass at 1 m/s².",
        },
        {
          id: "b-second-ex",
          type: "list",
          content: "Worked ideas to train intuition:",
          items: [
            "Same force, double the mass → half the acceleration.",
            "Kicking a football and kicking a brick with equal force produce very different accelerations.",
            "A sports car accelerates faster than a truck with the same engine because its mass is lower.",
          ],
        },
        {
          id: "b-second-callout",
          type: "callout",
          variant: "tip",
          content:
            "When solving problems, always draw the free-body diagram first. Then write $\\sum F_x = m a_x$ and $\\sum F_y = m a_y$. Nearly every mechanics problem becomes routine algebra.",
        },
      ],
    },
    {
      id: "sec-third-law",
      title: "Third Law — Action & Reaction",
      blocks: [
        {
          id: "b-third-1",
          type: "paragraph",
          content:
            "Newton's **Third Law** states: *For every action there is an equal and opposite reaction.* Whenever object A pushes on object B, object B pushes back on A with the same strength in the opposite direction.",
        },
        {
          id: "b-third-2",
          type: "paragraph",
          content:
            "The pairs always act on **different objects**. This is why a rocket moves: hot gas is pushed downward and backward, so the rocket is pushed upward and forward. The forces are equal, but they act on different objects, so the rocket accelerates.",
        },
        {
          id: "b-third-ex",
          type: "list",
          content: "Classic demonstrations:",
          items: [
            "Walking — you push the ground back, the ground pushes you forward.",
            "A swimmer pushes water backwards and glides forward.",
            "A recoiling gun — the bullet goes one way, the gun kicks the other.",
            "Rowing a boat: oars push water, water pushes the boat.",
          ],
        },
        {
          id: "b-third-formula",
          type: "formula",
          formula: "\\vec{F}_{A\\to B} = -\\, \\vec{F}_{B\\to A}",
          caption: "Action and reaction are equal in magnitude, opposite in direction.",
        },
        {
          id: "b-third-callout",
          type: "callout",
          variant: "warning",
          content:
            "Common misconception: if the forces are equal, why does anything move? Because the two forces act on **different bodies** — they do not cancel. Cancellation only happens for forces on the *same* object.",
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
            "Newton's three laws form a complete recipe for motion: the First Law defines what happens without net force, the Second Law tells you exactly how acceleration depends on force and mass, and the Third Law explains interaction between bodies.",
        },
        {
          id: "b-review-callout",
          type: "callout",
          variant: "info",
          content:
            "Ask the AI tutor to generate a quiz, flashcards, or a one-page cheat sheet for this chapter. It also remembers which topics you have mastered.",
        },
      ],
    },
  ],
};
