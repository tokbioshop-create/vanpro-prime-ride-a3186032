import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";
import { VanProLogo } from "@/components/VanProLogo";
import { salvarLogin } from "@/data/feedback";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — VanPro" },
      {
        name: "description",
        content: "Acesse sua conta VanPro com seu e-mail e gerencie suas reservas de viagem.",
      },
      { property: "og:title", content: "Entrar — VanPro" },
      { property: "og:description", content: "Login rápido no VanPro com seu e-mail." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  function entrar() {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    salvarLogin(email.trim().toLowerCase());
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/home" });
  }

  return (
    <div className="bg-deep min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-10">
        <div className="flex flex-col items-center">
          <VanProLogo size={56} variant="outline" />
          <h1 className="mt-3 text-4xl leading-none font-extrabold tracking-tight">
            <span className="text-gold">Van</span>
            <span className="text-[oklch(0.99_0_0)]">Pro</span>
          </h1>
          <p className="mt-2 text-xs tracking-[0.14em] text-[oklch(0.8_0.02_265)]">
            ACESSE SUA CONTA
          </p>
        </div>

        <div className="mt-10 space-y-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">
              E-mail
            </span>
            <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-soft)]">
              <Mail className="size-4.5 text-primary" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="seuemail@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
              />
            </div>
          </label>

          <button
            type="button"
            onClick={entrar}
            className="press bg-gold text-navy flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-extrabold shadow-[var(--shadow-gold)]"
          >
            Entrar <ArrowRight className="size-5" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-[oklch(0.8_0.02_265)]">Ainda não tem conta?</p>
          <Link
            to="/cadastro"
            className="press mt-2 inline-flex h-12 w-full items-center justify-center rounded-full border border-[oklch(1_0_0/0.25)] text-sm font-bold text-[oklch(0.99_0_0)]"
          >
            Criar cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
