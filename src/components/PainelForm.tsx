import type { ReactNode } from "react";
import { Check, Save } from "lucide-react";
import { Field, inputClass } from "@/components/AppScreen";

export function PainelCard({ children }: { children: ReactNode }) {
  return <div className="card-elevated space-y-4 p-4">{children}</div>;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        className={inputClass + " resize-none leading-relaxed"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1.5 block text-[11px] text-muted-foreground">{hint}</span>}
    </Field>
  );
}

export function SaveButton({ salvo, onClick }: { salvo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press bg-brand mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
    >
      {salvo ? <Check className="size-4.5" /> : <Save className="size-4.5" />}
      {salvo ? "Salvo com sucesso" : "Salvar alterações"}
    </button>
  );
}
