import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { StarPicker } from "@/components/StarPicker";
import { useFeedbacks } from "@/data/feedback";

export function AppFeedbackSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enviar } = useFeedbacks("app");
  const [estrelas, setEstrelas] = useState(0);
  const [mensagem, setMensagem] = useState("");

  if (!open) return null;

  function confirmar() {
    if (estrelas === 0) {
      toast.error("Escolha de 1 a 5 estrelas.");
      return;
    }
    enviar({ nome: "Você", mensagem: mensagem.trim(), estrelas });
    setEstrelas(0);
    setMensagem("");
    onClose();
    toast.success("Obrigado pelo seu feedback! 💜", {
      description: "Sua avaliação nos ajuda a melhorar o VanPro.",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[oklch(0_0_0/0.55)] px-4 pb-24">
      <div className="card-elevated w-full max-w-md space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold">Avalie o aplicativo</h2>
            <p className="text-[11px] text-muted-foreground">
              O que você achou da sua experiência no VanPro?
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="press">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex justify-center">
          <StarPicker value={estrelas} onChange={setEstrelas} />
        </div>

        <textarea
          rows={3}
          className="w-full resize-none rounded-xl bg-secondary px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/35"
          placeholder="Deixe uma mensagem (opcional)"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          maxLength={500}
        />

        <button
          type="button"
          onClick={confirmar}
          className="press bg-brand flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
        >
          Confirmar avaliação
        </button>
      </div>
    </div>
  );
}
