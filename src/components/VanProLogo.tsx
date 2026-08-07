export function VanProLogo({
  size = 56,
  variant = "solid",
}: {
  size?: number;
  variant?: "solid" | "outline";
}) {
  const outline = variant === "outline";
  const stroke = outline ? "var(--gold)" : "var(--primary-foreground)";

  return (
    <div
      className={
        outline
          ? "relative flex items-center justify-center rounded-2xl border-2 border-[var(--gold)]"
          : "bg-brand relative flex items-center justify-center rounded-2xl shadow-[var(--shadow-brand)]"
      }
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        style={{ width: size * 0.62, height: size * 0.62 }}
        aria-hidden="true"
      >
        <path
          d="M6 30V20a6 6 0 0 1 6-6h13.6a6 6 0 0 1 4.6 2.1l6.6 7.7A6 6 0 0 1 38.2 28V30a3 3 0 0 1-3 3h-2"
          stroke={stroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 33h4.5M20 33h9" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="15.5" cy="33.5" r="4" stroke={stroke} strokeWidth="3.2" />
        <circle cx="33.5" cy="33.5" r="4" stroke={stroke} strokeWidth="3.2" />
        <path d="M14 20h9" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
