import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight } from "lucide-react";
import banner from "@/assets/banner.jpg";
import { BottomNav } from "@/components/BottomNav";
import { FeedbackEmpresa } from "@/components/FeedbackEmpresa";
import icoAgendar from "@/assets/icons/agendar.png.asset.json";
import icoQrcode from "@/assets/icons/qrcode.png.asset.json";
import icoReservas from "@/assets/icons/reservas.png.asset.json";
import icoEmpresas from "@/assets/icons/empresas.png.asset.json";
import icoHistorico from "@/assets/icons/historico.png.asset.json";
import icoViagens from "@/assets/icons/viagens.png.asset.json";
import icoPerfil from "@/assets/icons/perfil.png.asset.json";
import icoAjuda from "@/assets/icons/ajuda.png.asset.json";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Início — VanPro" },
      {
        name: "description",
        content:
          "Agende viagens, acompanhe reservas, pague e fale com o motorista direto no VanPro.",
      },
      { property: "og:title", content: "Início — VanPro" },
      {
        property: "og:description",
        content: "Todos os atalhos do seu transporte executivo em um só lugar.",
      },
    ],
  }),
  component: Home,
});

const modulos = [
  { to: "/agendar", label: "Agendar viagem", hint: "Nova reserva", icon: icoAgendar.url },
  { to: "/qrcode", label: "QR Code", hint: "Acessar empresa", icon: icoQrcode.url },
  { to: "/reservas", label: "Minhas reservas", hint: "Comprovantes", icon: icoReservas.url },
  { to: "/empresas", label: "Empresas", hint: "Avaliar e ver notas", icon: icoEmpresas.url },
  { to: "/historico", label: "Histórico", hint: "Viagens realizadas", icon: icoHistorico.url },
  { to: "/viagens", label: "Viagens agendadas", hint: "Próximas", icon: icoViagens.url },
  { to: "/perfil", label: "Meu perfil", hint: "Meus dados", icon: icoPerfil.url },
  { to: "/ajuda", label: "Ajuda", hint: "Suporte 24h", icon: icoAjuda.url },
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-brand relative overflow-hidden rounded-b-3xl px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full opacity-40 blur-2xl"
          style={{ background: "radial-gradient(circle, oklch(1 0 0 / 0.35), transparent 70%)" }}
        />
        <div className="relative mx-auto flex max-w-md items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-primary-foreground">Olá, Lucas!</h1>
            <p className="mt-1 text-sm text-[oklch(1_0_0/0.75)]">O que vamos fazer hoje?</p>
          </div>
          <Link
            to="/ajuda"
            aria-label="Notificações"
            className="press relative flex size-11 items-center justify-center rounded-full bg-[oklch(1_0_0/0.16)] text-primary-foreground"
          >
            <Bell className="size-5" />
            <span className="bg-gold absolute top-2.5 right-2.5 size-2.5 rounded-full ring-2 ring-[oklch(0.44_0.24_268)]" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-md px-1.5">
        <section className="card-elevated relative mt-1.5 overflow-hidden">
          <img
            src={banner}
            alt="Van executiva em rodovia ao entardecer"
            width={1200}
            height={704}
            className="h-36 w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,oklch(0.2_0.11_268/0.95),oklch(0.2_0.11_268/0.35))]" />
          <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center p-5">
            <p className="text-sm font-extrabold text-[oklch(0.99_0_0)]">Reserve com antecedência</p>
            <p className="mt-1 text-[11px] leading-snug text-[oklch(0.85_0.02_265)]">
              Garanta seu veículo e aproveite os melhores horários.
            </p>
            <Link
              to="/agendar"
              className="press bg-gold text-navy mt-3 inline-flex h-9 w-fit items-center rounded-full px-4 text-xs font-extrabold"
            >
              Agendar agora
            </Link>
          </div>
        </section>

        <div className="mt-4 space-y-3 px-2.5">
          {modulos.map(({ to, label, hint, icon }) => (
            <Link
              key={to}
              to={to}
              className="press card-elevated flex items-center gap-3.5 p-4 text-card-foreground"
            >
              <span className="bg-brand flex size-12 shrink-0 items-center justify-center rounded-2xl p-2 shadow-[var(--shadow-brand-soft)]">
                <img
                  src={icon}
                  alt=""
                  width={128}
                  height={128}
                  loading="lazy"
                  className="size-full object-contain"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{label}</span>
                <span className="block text-[11px] text-muted-foreground">{hint}</span>
              </span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <div className="px-2.5">
          <FeedbackEmpresa />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
