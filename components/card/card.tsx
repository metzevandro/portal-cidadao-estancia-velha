"use client";

interface StatusCardProps {
  title: string;
  count: number;
}

export function StatusCard({ title, count }: StatusCardProps) {
  const phaseColors: Record<string, string> = {
    "Em análise": "#FACC15",
    Pendentes: "#F97316",
    Concluídas: "#10B981",
  };

  const color = phaseColors[title] || "#6B7280";
  const bgColor = `${color}1A`;

  return (
    <div
      className="card"
      style={{
        backgroundColor: bgColor,
        color: color,
        borderRadius: "var(--s-border-radius-medium)",
        padding: "var(--s-spacing-small)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        gap: "var(--s-spacing-xx-small)",
        width: "100%",
      }}
    >
      <p>{title}</p>
      <h2>{count}</h2>
    </div>
  );
}
