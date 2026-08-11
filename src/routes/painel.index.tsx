import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarPlus,
  QrCode,
  Ticket,
  Banknote,
  UserRound,
  Headset,
  Navigation,
  ChevronRight,
} from "lucide-react";
import { AppScreen } from "@/components/AppScreen";
import { usePainel } from "@/data/painel";

export const Route = createFileRoute("/painel/")({
  head: () => ({
    meta: [
      { title: "Painel da empresa — VanPro" },
      { name: "description", content: "Painel de controle do empresário VanPro: dados da empresa, agendamentos, QR Code, reservas, recebimentos e perfil." },
      { property: "og:title", content: "Painel da empresa — VanPro" },
      { property: "og:description", content: "Configure tudo o que seus clientes veem no aplicativo VanPro." },
    ],
  }),
  component: Painel,
});

const secoes = [
  { to: "/painel/empresa", icon: Building2, label: "Dados da empresa", hint: "Nome, cidade, CNPJ e descrição" },
  { to: "/painel/agendamento", icon: CalendarPlus, label: "Agendar viagem", hint: "Rotas, horários, veículos e preço" },
  { to: "/painel/qrcode", icon: QrCode, label: "QR Code da empresa", hint: "Código de acesso do cliente" },
  { to: "/painel/rastreamento", icon: Navigation, label: "Rastreamento GPS", hint: "Autorizar acompanhamento em tempo real" },
  { to: "/painel/reservas", icon: Ticket, label: "Reservas recebidas", hint: "Registro dos clientes" },
  { to: "/painel/avaliacoes", icon: UserRound, label: "Perfil do empresário", hint: "Dados de cadastro, somente para você" },
  { to: "/painel/financeiro", icon: Banknote, label: "Recebimentos", hint: "Dados bancários e subconta" },
  { to: "/painel/contatos", icon: Headset, label: "Ajuda e contatos", hint: "WhatsApp, e-mail e redes" },
] as const;

function Painel() {
  const { config } = usePainel();

  return (
    <AppScreen title="Painel da empresa" subtitle={config.empresa.nome}>
      <div className="card-elevated flex items-center gap-4 p-4">
        <span className="bg-brand flex size-14 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">{config.empresa.sigla}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{config.empresa.nome}</p>
          <p className="text-[11px] text-muted-foreground">{config.empresa.cidade}</p>
        </div>
      </div>

      <p className="mt-6 mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">Configurações do cliente</p>
      <div className="space-y-3">
        {secoes.map(({ to, icon: Icon, label, hint }) => (
          <Link key={to} to={to} className="press bg-brand flex items-center gap-3.5 rounded-2xl p-4 text-primary-foreground shadow-[var(--shadow-brand-soft)]">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(1_0_0/0.18)]"><Icon className="size-5" strokeWidth={2.2} /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{label}</span><span className="block text-[11px] text-[oklch(1_0_0/0.75)]">{hint}</span></span>
            <ChevronRight className="size-5 text-[oklch(1_0_0/0.8)]" />
          </Link>
        ))}
      </div>
    </AppScreen>
  );
}
