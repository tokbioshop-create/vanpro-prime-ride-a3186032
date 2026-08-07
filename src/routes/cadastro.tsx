import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { VanProLogo } from "@/components/VanProLogo";
import { salvarCadastro, salvarLogin, type Cadastro } from "@/data/feedback";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar cadastro — VanPro" },
      {
        name: "description",
        content:
          "Crie sua conta VanPro com nome, CPF, WhatsApp, e-mail e endereço para reservar viagens.",
      },
      { property: "og:title", content: "Criar cadastro — VanPro" },
      { property: "og:description", content: "Cadastre-se no VanPro em poucos passos." },
    ],
  }),
  component: CadastroPage,
});

const campos: { key: keyof Cadastro; label: string; placeholder: string; mode?: "tel" | "email" }[] =
  [
    { key: "nome", label: "Nome completo", placeholder: "Seu nome completo" },
    { key: "cpf", label: "CPF", placeholder: "000.000.000-00", mode: "tel" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "(00) 90000-0000", mode: "tel" },
    { key: "email", label: "E-mail", placeholder: "seuemail@email.com", mode: "email" },
    { key: "endereco", label: "Endereço", placeholder: "Rua / Avenida" },
    { key: "numero", label: "Número", placeholder: "123", mode: "tel" },
    { key: "bairro", label: "Bairro", placeholder: "Seu bairro" },
    { key: "cep", label: "CEP", placeholder: "00000-000", mode: "tel" },
    { key: "estado", label: "Estado", placeholder: "BA" },
  ];

const vazio: Cadastro = {
  nome: "",
  cpf: "",
  whatsapp: "",
  email: "",
  endereco: "",
  numero: "",
  bairro: "",
  cep: "",
  estado: "",
};

function CadastroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Cadastro>(vazio);
  const [termos, setTermos] = useState(false);

  function enviar() {
    const faltando = campos.find((c) => !form[c.key].trim());
    if (faltando) {
      toast.error(`Preencha o campo ${faltando.label}.`);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (!termos) {
      toast.error("É necessário confirmar os termos de uso.");
      return;
    }
    salvarCadastro(form);
    salvarLogin(form.email.trim().toLowerCase());
    toast.success("Cadastro concluído! Bem-vindo ao VanPro.");
    navigate({ to: "/home" });
  }

  return (
    <div className="bg-deep min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10">
        <div className="flex flex-col items-center">
          <VanProLogo size={52} variant="outline" />
          <h1 className="mt-3 text-3xl leading-none font-extrabold tracking-tight">
            <span className="text-gold">Van</span>
            <span className="text-[oklch(0.99_0_0)]">Pro</span>
          </h1>
          <p className="mt-2 text-xs tracking-[0.14em] text-[oklch(0.8_0.02_265)]">
            CRIAR CADASTRO
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {campos.map(({ key, label, placeholder, mode }) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">
                {label}
              </span>
              <input
                inputMode={mode === "tel" ? "numeric" : mode === "email" ? "email" : "text"}
                className="w-full rounded-2xl bg-card px-4 py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35"
                placeholder={placeholder}
                value={form[key]}
                maxLength={key === "estado" ? 2 : 120}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}

          <label className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              checked={termos}
              onChange={(e) => setTermos(e.target.checked)}
              className="mt-0.5 size-4.5 accent-[oklch(0.84_0.15_87)]"
            />
            <span className="text-[11px] leading-snug text-[oklch(0.85_0.02_265)]">
              Confirmo que li e aceito os termos de uso e a política de privacidade do VanPro.
            </span>
          </label>

          <button
            type="button"
            onClick={enviar}
            className="press bg-gold text-navy mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-extrabold shadow-[var(--shadow-gold)]"
          >
            Finalizar cadastro <ArrowRight className="size-5" />
          </button>

          <Link
            to="/login"
            className="press mt-1 flex h-12 w-full items-center justify-center rounded-full border border-[oklch(1_0_0/0.25)] text-sm font-bold text-[oklch(0.99_0_0)]"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
