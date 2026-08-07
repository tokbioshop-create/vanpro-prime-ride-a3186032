import { Star } from "lucide-react";

export function StarPicker({
  value,
  onChange,
  size = "size-8",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="press"
        >
          <Star
            className={
              size +
              " transition " +
              (n <= value ? "fill-[oklch(0.84_0.15_87)] text-[oklch(0.84_0.15_87)]" : "text-muted-foreground")
            }
          />
        </button>
      ))}
    </div>
  );
}
