import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
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

        <div className="space-y-2">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Banner do aplicativo
          </p>
          <p className="text-[11px] text-muted-foreground">
            Aparece na tela inicial, abaixo do card de avaliação. Ideal 1200×500px.
          </p>

          {form.banner ? (
            <img
              src={form.banner}
              alt="Pré-visualização do banner da empresa"
              className="aspect-[12/5] w-full rounded-2xl object-cover"
            />
          ) : null}

          <div className="flex gap-2">
            <label className="press card-elevated flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl text-xs font-bold">
              <Upload className="size-4" />
              {form.banner ? "Trocar imagem" : "Enviar imagem"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2_500_000) {
                    toast.error("Imagem muito grande. Envie até 2,5 MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setForm((f) => ({ ...f, banner: String(reader.result) }));
                    setSalvo(false);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {form.banner ? (
              <button
                type="button"
                className="press card-elevated flex h-11 items-center gap-2 rounded-2xl px-4 text-xs font-bold text-destructive"
                onClick={() => {
                  setForm((f) => ({ ...f, banner: "" }));
                  setSalvo(false);
                }}
              >
                <Trash2 className="size-4" /> Remover
              </button>
            ) : null}
          </div>
        </div>
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
