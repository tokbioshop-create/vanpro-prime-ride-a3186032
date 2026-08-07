import { createFileRoute, Link } from "@tanstack/react-router";
import {
  UserRound,
  Mail,
  Phone,
  IdCard,
  Star,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { AppScreen } from "@/components/AppScreen";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — VanPro" },
      {
        name: "description",
        content: "Gerencie seus dados pessoais, documentos e preferências de viagem no VanPro.",
      },
      { property: "og:title", content: "Meu perfil — VanPro" },
      { property: "og:description", content: "Seus dados de passageiro VanPro em um só lugar." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  return (
    <AppScreen title="Meu perfil" subtitle="Passageiro VanPro desde 2024">
      <div className="card-elevated flex items-center gap-4 p-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-primary-foreground">
          LA
        </span>
        <div className="flex-1">
          <p className="text-base font-bold">Lucas Andrade</p>
          <p className="text-[11px] text-muted-foreground">lucas.andrade@email.com</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <Star className="size-3.5 fill-primary" /> Cliente Premium
          </p>
        </div>
      </div>

      <div className="card-elevated mt-4 divide-y divide-border">
        <Row icon={UserRound} label="Nome completo" value="Lucas Andrade" />
        <Row icon={IdCard} label="CPF" value="•••.456.789-••" />
        <Row icon={Mail} label="E-mail" value="lucas.andrade@email.com" />
        <Row icon={Phone} label="Telefone" value="(71) 99999-1234" />
      </div>

      <div className="card-elevated mt-4 divide-y divide-border">
        <LinkRow icon={LayoutDashboard} label="Painel da empresa" to="/painel" />
      </div>


      <button className="press mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-[oklch(0.62_0.21_25/0.08)] text-sm font-semibold text-destructive">
        <LogOut className="size-4.5" /> Sair da conta
      </button>
    </AppScreen>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="size-4.5 text-primary" />
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function LinkRow({ icon: Icon, label, to }: { icon: typeof Mail; label: string; to: string }) {
  return (
    <Link to={to} className="press flex items-center gap-3 p-4">
      <Icon className="size-4.5 text-primary" />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight className="size-4.5 text-muted-foreground" />
    </Link>
  );
}
