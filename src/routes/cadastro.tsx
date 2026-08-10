import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { VanProLogo } from "@/components/VanProLogo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — VanPro" },
      { name: "description", content: "Crie sua conta VanPro de forma rápida e segura." },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [termos, setTermos] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo) return toast.error("Informe seu nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) return toast.error("Informe um e-mail válido.");
    if (senha.length < 8) return toast.error("A senha deve ter pelo menos 8 caracteres.");
    if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return toast.error("Use letras e números na senha.");
    if (senha !== confirmacao) return toast.error("As senhas não coincidem.");
    if (!termos) return toast.error("Aceite os termos para continuar.");

    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email: emailLimpo,
      password: senha,
      options: { data: { nome: nomeLimpo } },
    });
    setCarregando(false);

    if (error) {
      toast.error(error.message.includes("already registered") ? "Este e-mail já possui cadastro." : "Não foi possível criar a conta.");
      return;
    }

    if (data.session) {
      toast.success("Conta criada com sucesso!");
      navigate({ to: "/home" });
    } else {
      toast.success("Conta criada. Confirme seu e-mail para entrar.");
      navigate({ to: "/login" });
    }
  }

  return (
    <div className="bg-deep min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10">
        <div className="flex flex-col items-center">
          <VanProLogo size={52} variant="outline" />
          <h1 className="mt-3 text-3xl leading-none font-extrabold tracking-tight"><span className="text-gold">Van</span><span className="text-[oklch(0.99_0_0)]">Pro</span></h1>
          <p className="mt-2 text-xs tracking-[0.14em] text-[oklch(0.8_0.02_265)]">CRIAR CONTA</p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">Nome</span><input autoComplete="name" className="w-full rounded-2xl bg-card px-4 py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} /></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">E-mail</span><input type="email" autoComplete="email" className="w-full rounded-2xl bg-card px-4 py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35" placeholder="seuemail@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">Senha</span><div className="flex items-center rounded-2xl bg-card shadow-[var(--shadow-soft)]"><input type={mostrarSenha ? "text" : "password"} autoComplete="new-password" className="w-full bg-transparent px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Mínimo de 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} maxLength={72} /><button type="button" aria-label="Mostrar senha" onClick={() => setMostrarSenha((v) => !v)} className="px-4 text-muted-foreground">{mostrarSenha ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold tracking-wide text-[oklch(0.8_0.02_265)] uppercase">Confirmar senha</span><input type="password" autoComplete="new-password" className="w-full rounded-2xl bg-card px-4 py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35" placeholder="Repita sua senha" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} maxLength={72} /></label>

          <label className="flex items-start gap-3 pt-1"><input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} className="mt-0.5 size-4.5 accent-[oklch(0.84_0.15_87)]" /><span className="text-[11px] leading-snug text-[oklch(0.85_0.02_265)]">Aceito os termos de uso e a política de privacidade do VanPro.</span></label>

          <button type="button" disabled={carregando} onClick={enviar} className="press bg-gold text-navy mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-extrabold shadow-[var(--shadow-gold)] disabled:opacity-60">{carregando ? "Criando conta..." : "Criar minha conta"} {!carregando && <ArrowRight className="size-5" />}</button>
          <Link to="/login" className="press flex h-12 w-full items-center justify-center rounded-full border border-[oklch(1_0_0/0.25)] text-sm font-bold text-[oklch(0.99_0_0)]">Já tenho conta</Link>
        </div>
      </div>
    </div>
  );
}
