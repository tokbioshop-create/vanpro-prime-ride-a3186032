import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppScreen } from "@/components/AppScreen";
import { AreaField, PainelCard, SaveButton, TextField } from "@/components/PainelForm";
import { usePainel } from "@/data/painel";

export const Route = createFileRoute("/painel/empresa")({
  head: () => ({
    meta: [
      { title: "Dados da empresa — Painel VanPro" },
      {
        name: "description",
        content: "Configure nome, sigla, cidade, CNPJ e descrição que seus clientes veem no VanPro.",
      },
      { property: "og:title", content: "Dados da empresa — Painel VanPro" },
      { property: "og:description", content: "Identidade da sua transportadora no aplicativo." },
    ],
  }),
  component: PainelEmpresa,
});

function PainelEmpresa() {
  const { config, salvar } = usePainel();
  const [form, setForm] = useState(config.empresa);
  const [salvo, setSalvo] = useState(false);
  useEffect(() => setForm(config.empresa), [config.empresa]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm({ ...form, [k]: v });
    setSalvo(false);
  };

  return (
    <AppScreen title="Dados da empresa" subtitle="Visível para os clientes" back="/painel">
      <PainelCard>
        <TextField label="Nome da empresa" value={form.nome} onChange={set("nome")} />
        <TextField label="Sigla do logotipo" value={form.sigla} onChange={set("sigla")} />
        <TextField label="Cidade / estado" value={form.cidade} onChange={set("cidade")} />
        <TextField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} />
        <AreaField label="Descrição" value={form.descricao} onChange={set("descricao")} />
      </PainelCard>

      <SaveButton
        salvo={salvo}
        onClick={() => {
          salvar({ ...config, empresa: form });
          setSalvo(true);
        }}
      />
    </AppScreen>
  );
}
