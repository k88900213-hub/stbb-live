# Diagram authoring guide (STBB books)

Author static SVG diagrams for the textbook chapters. Each diagram is a standalone file in
`public/diagrams/` and is referenced from a chapter with the `figure()` builder helper:

```ts
figure("The incident ray, the reflected ray and the normal", "/diagrams/optics-reflection.svg")
```

The `BlockView` component renders `block.src` inside an `<img>`; the caption renders underneath.

## File template

Start every SVG from this exact skeleton (640x360 canvas, warm-white background, shared arrow
markers `ar` = slate, `arA` = orange):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs>
    <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#64748b"/></marker>
    <marker id="arA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#c2410c"/></marker>
  </defs>
  <rect width="640" height="360" fill="#fffdf7"/>
  <text x="320" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#c2410c">TITLE GOES HERE</text>
  ...diagram body...
</svg>
```

## Design tokens

- **Title**: centered at (320, 30), font-size 17, bold, `#c2410c` (physics orange).
- **Labels**: font-family `Arial, sans-serif`, fill `#334155`, font-size 12–14. Never smaller than 11.
- **Lines/axes**: stroke `#475569` width 2. Grid/guide lines: `#94a3b8` width 1.
- **Arrows**: `stroke="#64748b"` with `marker-end="url(#ar)"`; orange emphasis arrows `#c2410c` with `url(#arA)`.
- **Accent boxes**: rounded `rx="8"` cards.
  - Green idea cards: fill `#ecfdf5`, stroke `#16a34a`, text `#166534`.
  - Amber objects: fill `#fde68a`, stroke `#b45309`, text `#92400e`.
  - Blue objects: fill `#dbeafe`, stroke `#2563eb`, text `#1e40af`.
  - Red warnings: fill `#fef2f2`, stroke `#dc2626`, text `#991b1b`.
  - Slate neutrals: fill `#e2e8f0`, stroke `#475569`.
- **Subject accent for chapter title**: physics `#c2410c`, chemistry `#047857`, biology `#0369a1`.
- Keep the canvas 640x360 and leave ~20px margins on all sides.

## Content rules

- A diagram must clearly match its caption. Label every important part.
- Use a "takeaway line" at the bottom (y ≈ 330) stating the key physics/chemistry/biology idea.
- Prefer unicode for small subscripts/superscripts in SVG text (e.g. `10³`, `m₁`, `F = G·m₁·m₂ / r²`).
  Do NOT use LaTeX in SVGs.
- Never create more than ~70 lines per file; keep it readable and not cluttered.
- Escape `&` as `&amp;` in SVG text.

## Naming

`public/diagrams/<topic-prefix>-<subject>.svg` with a short lowercase kebab name, e.g.
`optics-prism.svg`, `cell-mitosis.svg`, `electrostatics-field-lines.svg`.

## Reference examples

- `public/diagrams/pq-vernier-calliper.svg` (instrument with labelled parts)
- `public/diagrams/pq-screw-gauge.svg` (mechanism + takeaway line)
