import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { PainelCard, SaveButton, TextField } from "@/components/PainelForm";
import { usePainel } from "@/data/painel";

export const Route = createFileRoute("/painel/financeiro")({
  head: () => ({
    meta: [
      { title: "Recebimentos — Painel VanPro" },
      {
        name: "description",
        content: "Cadastre os dados bancários e a subconta da sua empresa para receber dos clientes.",
      },
      { property: "og:title", content: "Recebimentos — Painel VanPro" },
      { property: "og:description", content: "Subconta e repasse automático das reservas pagas." },
    ],
  }),
  component: PainelFinanceiro,
});

function PainelFinanceiro() {
  const { config, salvar } = usePainel();
  const [form, setForm] = useState(config.financeiro);
  const [salvo, setSalvo] = useState(false);
  useEffect(() => setForm(config.financeiro), [config.financeiro]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm({ ...form, [k]: v });
    setSalvo(false);
  };

  return (
    <AppScreen title="Recebimentos" subtitle="Dados bancários e subconta" back="/painel">
      <div className="card-elevated mb-4 flex items-start gap-3 p-4">
        <ShieldCheck className="size-5 shrink-0 text-success" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Os pagamentos dos clientes (PIX, cartão e boleto) caem na subconta da sua empresa e são
          repassados automaticamente para a conta informada abaixo.
        </p>
      </div>

      <PainelCard>
        <TextField label="Titular da conta" value={form.titular} onChange={set("titular")} />
        <TextField label="CPF / CNPJ do titular" value={form.documento} onChange={set("documento")} />
        <TextField label="Banco" value={form.banco} onChange={set("banco")} />
        <TextField label="Agência" value={form.agencia} onChange={set("agencia")} />
        <TextField label="Conta" value={form.conta} onChange={set("conta")} />
        <TextField label="Tipo de conta" value={form.tipoConta} onChange={set("tipoConta")} />
        <TextField label="Chave PIX" value={form.chavePix} onChange={set("chavePix")} />
        <TextField label="Subconta VanPro" value={form.subconta} onChange={set("subconta")} />
      </PainelCard>

      <SaveButton
        salvo={salvo}
        onClick={() => {
          salvar({ ...config, financeiro: form });
          setSalvo(true);
        }}
      />
    </AppScreen>
  );
}
