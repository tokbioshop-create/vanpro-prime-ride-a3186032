import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppScreen } from "@/components/AppScreen";
import { PainelCard, SaveButton, TextField } from "@/components/PainelForm";
import { usePainel } from "@/data/painel";

export const Route = createFileRoute("/painel/contatos")({
  head: () => ({
    meta: [
      { title: "Ajuda e contatos — Painel VanPro" },
      {
        name: "description",
        content: "Configure WhatsApp, telefone, e-mail e redes sociais exibidos na central de ajuda.",
      },
      { property: "og:title", content: "Ajuda e contatos — Painel VanPro" },
      { property: "og:description", content: "Canais de atendimento da sua empresa no VanPro." },
    ],
  }),
  component: PainelContatos,
});

function PainelContatos() {
  const { config, salvar } = usePainel();
  const [form, setForm] = useState(config.contatos);
  const [salvo, setSalvo] = useState(false);
  useEffect(() => setForm(config.contatos), [config.contatos]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm({ ...form, [k]: v });
    setSalvo(false);
  };

  return (
    <AppScreen title="Ajuda e contatos" subtitle="Exibido na central de ajuda" back="/painel">
      <PainelCard>
        <TextField
          label="WhatsApp (com DDI)"
          value={form.whatsapp}
          onChange={set("whatsapp")}
          placeholder="5571988887777"
        />
        <TextField label="Telefone" value={form.telefone} onChange={set("telefone")} />
        <TextField label="E-mail" value={form.email} onChange={set("email")} />
        <TextField label="Instagram" value={form.instagram} onChange={set("instagram")} />
        <TextField label="Facebook" value={form.facebook} onChange={set("facebook")} />
        <TextField label="TikTok" value={form.tiktok} onChange={set("tiktok")} />
      </PainelCard>

      <SaveButton
        salvo={salvo}
        onClick={() => {
          salvar({ ...config, contatos: form });
          setSalvo(true);
        }}
      />
    </AppScreen>
  );
}
