import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { VanProLogo } from "@/components/VanProLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — VanPro" }, { name: "description", content: "Acesse sua conta VanPro com segurança." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  async function entrar() {
    const emailLimpo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) return toast.error("Informe um e-mail válido.");
    if (!senha) return toast.error("Informe sua senha.");

    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: emailLimpo, password: senha });
    setCarregando(false);

    if (error) {
      toast.error("E-mail ou senha incorretos.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/home" });
  }

  return (
    <div className="bg-deep min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-10">
        <div className="flex flex-col items-center"><VanProLogo size={56} variant="outline" /><h1 className="mt-3 text-4xl leading-none font-extrabold tracking-tight"><span className="text-gold">Van</span><span className="text-[oklch(0.99_0_0)]">Pro</span></h1><p className="mt-2 text-xs tracking-[0.14em] text-[oklch(0.8_0.02_265)]">ACESSE SUA CONTA</p></div>
        <div className="mt-10 space-y-4">
          <label className="block"><span className="mb-2 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">E-mail</span><div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-soft)]"><Mail className="size-4.5 text-primary" /><input type="email" inputMode="email" autoComplete="email" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="seuemail@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></div></label>
          <label className="block"><span className="mb-2 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">Senha</span><div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-soft)]"><Lock className="size-4.5 text-primary" /><input type="password" autoComplete="current-password" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} maxLength={72} /></div></label>
          <button type="button" disabled={carregando} onClick={entrar} className="press bg-gold text-navy flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-extrabold shadow-[var(--shadow-gold)] disabled:opacity-60">{carregando ? "Entrando..." : "Entrar"} {!carregando && <ArrowRight className="size-5" />}</button>
        </div>
        <div className="mt-8 text-center"><p className="text-xs text-[oklch(0.8_0.02_265)]">Ainda não tem conta?</p><Link to="/cadastro" className="press mt-2 inline-flex h-12 w-full items-center justify-center rounded-full border border-[oklch(1_0_0/0.25)] text-sm font-bold text-[oklch(0.99_0_0)]">Criar conta</Link></div>
      </div>
    </div>
  );
}
