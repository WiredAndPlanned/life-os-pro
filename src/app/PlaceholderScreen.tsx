/**
 * PHASE 0 PLACEHOLDER — scaffold only.
 *
 * Each primary destination renders this stand-in so the app is navigable and
 * the exit gate (boots + routes across five destinations, both themes, with
 * working back/forward) can be met. These carry NO product design and NO real
 * content — the real Today (§13), Plan/Life module hubs (§11–12), Search (§14),
 * and Settings (§18) are built in later phases against the frozen scaffold.
 *
 * This component uses only bootstrap tokens and plain elements; it deliberately
 * does not anticipate the Phase 2 component library.
 */

interface PlaceholderScreenProps {
  title: string;
  note?: string;
}

export function PlaceholderScreen({ title, note }: PlaceholderScreenProps) {
  return (
    <section
      style={{
        padding: "24px",
        maxWidth: "540px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>
        {title}
      </h1>
      <p style={{ color: "var(--ink-3)", margin: 0, fontSize: "0.95rem" }}>
        {note ?? "Scaffold placeholder — built in a later phase."}
      </p>
    </section>
  );
}
