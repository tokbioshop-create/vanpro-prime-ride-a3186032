import { Link } from "@tanstack/react-router";
import { ChevronRight, X } from "lucide-react";
import icoAgendar from "@/assets/icons/agendar.png.asset.json";
import icoQrcode from "@/assets/icons/qrcode.png.asset.json";
import icoReservas from "@/assets/icons/reservas.png.asset.json";
import icoEmpresas from "@/assets/icons/empresas.png.asset.json";
import icoHistorico from "@/assets/icons/historico.png.asset.json";
import icoViagens from "@/assets/icons/viagens.png.asset.json";
import icoPerfil from "@/assets/icons/perfil.png.asset.json";
import icoAjuda from "@/assets/icons/ajuda.png.asset.json";

export const modulos = [
  { to: "/agendar", label: "Agendar viagem", hint: "Nova reserva", icon: icoAgendar.url },
  { to: "/qrcode", label: "QR Code", hint: "Acessar empresa", icon: icoQrcode.url },
  { to: "/reservas", label: "Minhas reservas", hint: "Comprovantes", icon: icoReservas.url },
  { to: "/empresas", label: "Empresas", hint: "Avaliar e ver notas", icon: icoEmpresas.url },
  { to: "/historico", label: "Histórico", hint: "Viagens realizadas", icon: icoHistorico.url },
  { to: "/viagens", label: "Viagens agendadas", hint: "Próximas", icon: icoViagens.url },
  { to: "/perfil", label: "Meu perfil", hint: "Meus dados", icon: icoPerfil.url },
  { to: "/ajuda", label: "Ajuda", hint: "Suporte 24h", icon: icoAjuda.url },
] as const;

export function MenuDrawer({
  open,
  onClose,
  empresa,
}: {
  open: boolean;
  onClose: () => void;
  empresa: { nome: string; sigla: string; cidade: string };
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className="absolute inset-0 bg-[oklch(0_0_0/0.6)]"
      />
      <aside className="bg-navy relative flex h-full w-[84%] max-w-xs flex-col overflow-y-auto pt-[max(1rem,env(safe-area-inset-top))] pb-6">
        <div className="flex items-start justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="bg-gold text-navy flex size-12 items-center justify-center rounded-2xl text-base font-extrabold">
              {empresa.sigla}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[oklch(0.99_0_0)]">{empresa.nome}</p>
              <p className="text-[11px] text-[oklch(0.85_0.02_265)]">{empresa.cidade}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar menu" className="press">
            <X className="size-5 text-[oklch(0.9_0.02_265)]" />
          </button>
        </div>

        <nav className="mt-6 space-y-2 px-4">
          {modulos.map(({ to, label, hint, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="press flex items-center gap-3 rounded-2xl bg-[oklch(1_0_0/0.07)] p-3 ring-1 ring-[oklch(1_0_0/0.1)]"
            >
              <span className="bg-brand flex size-10 shrink-0 items-center justify-center rounded-xl p-1.5">
                <img src={icon} alt="" width={128} height={128} loading="lazy" className="size-full object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[oklch(0.99_0_0)]">{label}</span>
                <span className="block text-[11px] text-[oklch(0.82_0.02_265)]">{hint}</span>
              </span>
              <ChevronRight className="size-4 text-[oklch(0.84_0.15_87)]" />
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
