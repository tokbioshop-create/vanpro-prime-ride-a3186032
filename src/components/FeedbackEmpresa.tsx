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
    <section className="card-elevated mt-4 space-y-3 p-4">
      <div>
        <h2 className="text-sm font-extrabold">Feedback para o empresário</h2>
        <p className="text-[11px] text-muted-foreground">
          Conte como foi sua experiência com a empresa de transporte.
        </p>
      </div>

      <input
        className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/35"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={80}
      />
      <textarea
        rows={3}
        className="w-full resize-none rounded-xl bg-secondary px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/35"
        placeholder="Sua mensagem"
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        maxLength={500}
      />
      <StarPicker value={estrelas} onChange={setEstrelas} size="size-7" />

      <button
        type="button"
        onClick={submit}
        className="press bg-brand flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
      >
        <Send className="size-4" /> Enviar feedback
      </button>

      {lista.length > 0 && (
        <ul className="space-y-2 pt-1">
          {lista.slice(0, 3).map((f, i) => (
            <li key={i} className="rounded-xl bg-secondary p-3">
              <p className="text-xs font-bold">
                {f.nome} · {"★".repeat(f.estrelas)}
              </p>
              <p className="text-[11px] text-muted-foreground">{f.mensagem}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
