import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { StarPicker } from "@/components/StarPicker";
import { useFeedbacks } from "@/data/feedback";

export function FeedbackEmpresa() {
  const { lista, enviar } = useFeedbacks("empresa");
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [estrelas, setEstrelas] = useState(0);

  function submit() {
    if (!nome.trim() || !mensagem.trim() || estrelas === 0) {
      toast.error("Preencha nome, mensagem e escolha as estrelas.");
      return;
    }
    enviar({ nome: nome.trim(), mensagem: mensagem.trim(), estrelas });
    setNome("");
    setMensagem("");
    setEstrelas(0);
    toast.success("Obrigado! Seu feedback foi enviado ao empresário.");
  }

  return (
    <section className="bg-navy mt-4 space-y-3 rounded-3xl p-4 shadow-[var(--shadow-brand-soft)] ring-1 ring-[oklch(1_0_0/0.12)]">
      <div>
        <h2 className="text-sm font-extrabold text-[oklch(0.99_0_0)]">Feedback para o empresário</h2>
        <p className="text-[11px] text-[oklch(0.84_0.02_265)]">
          Conte como foi sua experiência com a empresa de transporte.
        </p>
      </div>

      <input
        className="w-full rounded-xl bg-[oklch(1_0_0/0.08)] px-4 py-3 text-sm text-[oklch(0.99_0_0)] placeholder:text-[oklch(0.78_0.02_265)] outline-none ring-1 ring-[oklch(1_0_0/0.12)] focus:ring-2 focus:ring-[var(--gold)]"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={80}
      />
      <textarea
        rows={3}
        className="w-full resize-none rounded-xl bg-[oklch(1_0_0/0.08)] px-4 py-3 text-sm leading-relaxed text-[oklch(0.99_0_0)] placeholder:text-[oklch(0.78_0.02_265)] outline-none ring-1 ring-[oklch(1_0_0/0.12)] focus:ring-2 focus:ring-[var(--gold)]"
        placeholder="Sua mensagem"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        maxLength={500}
      />
      <StarPicker value={estrelas} onChange={setEstrelas} size="size-7" />

      <button
        type="button"
        onClick={submit}
        className="press bg-gold text-navy flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-extrabold shadow-[var(--shadow-gold)]"
      >
        <Send className="size-4" /> Enviar feedback
      </button>

      {lista.length > 0 && (
        <ul className="space-y-2 pt-1">
          {lista.slice(0, 3).map((f, i) => (
            <li key={i} className="rounded-xl bg-[oklch(1_0_0/0.07)] p-3">
              <p className="text-xs font-bold text-[oklch(0.99_0_0)]">
                {f.nome} · <span className="text-[var(--gold)]">{"★".repeat(f.estrelas)}</span>
              </p>
              <p className="text-[11px] text-[oklch(0.84_0.02_265)]">{f.mensagem}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

}
