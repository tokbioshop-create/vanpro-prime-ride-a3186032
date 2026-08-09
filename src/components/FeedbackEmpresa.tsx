import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { StarPicker } from "@/components/StarPicker";
import { useFeedbacks } from "@/data/feedback";

export function FeedbackEmpresa() {
  const { enviar } = useFeedbacks("empresa");
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
    <section className="mt-4 space-y-3 rounded-3xl bg-card p-4 shadow-[0_24px_50px_-18px_oklch(0.24_0.13_268/0.45)] ring-1 ring-border">
      <div>
        <h2 className="text-sm font-extrabold text-foreground">Feedback para o empresário</h2>
        <p className="text-[11px] text-muted-foreground">
          Conte como foi sua experiência com a empresa de transporte.
        </p>
      </div>

      <input
        className="w-full rounded-xl bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-primary/40"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={80}
      />
      <textarea
        rows={3}
        className="w-full resize-none rounded-xl bg-surface-2 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-primary/40"
        placeholder="Sua mensagem"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        maxLength={500}
      />
      <StarPicker value={estrelas} onChange={setEstrelas} size="size-7" />

      <button
        type="button"
        onClick={submit}
        className="press bg-brand text-primary-foreground flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-extrabold shadow-[var(--shadow-brand)]"
      >
        <Send className="size-4" /> Enviar feedback
      </button>

      <p className="pt-1 text-[11px] text-muted-foreground">
        Seu feedback aparece imediatamente no carrossel acima.
      </p>

    </section>
  );

}
