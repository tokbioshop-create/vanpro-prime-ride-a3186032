import { createFileRoute } from "@tanstack/react-router";
import { UserRound, IdCard, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { AppScreen } from "@/components/AppScreen";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/painel/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Perfil do empresário — Painel VanPro" },
      { name: "description", content: "Dados privados do cadastro empresarial VanPro." },
    ],
  }),
  component: PerfilEmpresario,
});

type CadastroEmpresario = {
  nome_completo?: string;
  documento?: string;
  contato?: string;
  endereco?: string;
  termos_aceitos?: boolean;
};

function PerfilEmpresario() {
  const [email, setEmail] = useState("");
  const [dados, setDados] = useState<CadastroEmpresario>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!ativo) return;
      if (error || !data.user) {
        toast.error("Não foi possível carregar seu perfil.");
      } else {
        setEmail(data.user.email ?? "");
        setDados((data.user.user_metadata ?? {}) as CadastroEmpresario);
      }
      setCarregando(false);
    });
    return () => { ativo = false; };
  }, []);

  return (
    <AppScreen title="Perfil do empresário" subtitle="Dados privados do cadastro" back="/painel">
      {carregando ? (
        <div className="card-elevated p-5 text-sm text-muted-foreground">Carregando seus dados...</div>
      ) : (
        <>
          <div className="card-elevated flex items-center gap-4 p-5">
            <span className="flex size-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-primary-foreground">
              {(dados.nome_completo ?? "E").split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">{dados.nome_completo || "Empresário"}</p>
              <p className="text-[11px] text-muted-foreground">Cadastro empresarial VanPro</p>
            </div>
          </div>

          <div className="card-elevated mt-4 divide-y divide-border">
            <Row icon={UserRound} label="Nome completo" value={dados.nome_completo || "Não informado"} />
            <Row icon={IdCard} label="CPF ou CNPJ" value={dados.documento || "Não informado"} />
            <Row icon={Mail} label="E-mail" value={email || "Não informado"} />
            <Row icon={Phone} label="Contato" value={dados.contato || "Não informado"} />
            <Row icon={MapPin} label="Endereço" value={dados.endereco || "Não informado"} />
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-bold">Área privada</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">Estas informações pertencem ao seu cadastro e ficam disponíveis somente após sua autenticação no painel. Elas não são publicadas para clientes.</p>
              <p className="mt-2 text-[11px] font-semibold text-primary">Termos aceitos: {dados.termos_aceitos ? "Sim" : "Não registrado"}</p>
            </div>
          </div>
        </>
      )}
    </AppScreen>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="flex items-start gap-3 p-4"><Icon className="mt-0.5 size-4.5 shrink-0 text-primary" /><span className="flex-1 text-xs text-muted-foreground">{label}</span><span className="max-w-[62%] text-right text-sm font-semibold break-words">{value}</span></div>;
}
