import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, CalendarDays, Navigation, MessageSquareHeart, ShoppingCart } from "lucide-react";
import { AppFeedbackSheet } from "@/components/AppFeedbackSheet";
import { useCarrinho } from "@/data/carrinho";

function Tab({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: typeof HomeIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        "press flex w-16 flex-col items-center gap-1 py-1 " +
        (active ? "text-primary" : "text-muted-foreground")
      }
    >
      <Icon className="size-5" strokeWidth={active ? 2.6 : 2} />
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const is = (p: string) => path === p || path.startsWith(p + "/");
  const [feedbackAberto, setFeedbackAberto] = useState(false);
  const { itens } = useCarrinho();

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-card/95 shadow-[0_-10px_30px_-18px_oklch(0.24_0.13_268/0.6)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-end justify-around px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <Tab to="/home" icon={HomeIcon} label="Início" active={is("/home")} />
          <Tab to="/viagens" icon={CalendarDays} label="Reservas" active={is("/viagens")} />
          <Link
            to="/carrinho"
            className="press bg-brand -mt-6 relative flex size-14 flex-col items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-brand)]"
            aria-label={`Carrinho de agendamentos (${itens.length})`}
          >
            <ShoppingCart className="size-6" strokeWidth={2.4} />
            {itens.length > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-5.5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-extrabold text-primary-foreground ring-2 ring-card">
                {itens.length}
              </span>
            )}
          </Link>
          <Tab to="/empresas" icon={Building2} label="Empresas" active={is("/empresas")} />
          <button
            type="button"
            onClick={() => setFeedbackAberto(true)}
            className="press flex w-16 flex-col items-center gap-1 py-1 text-muted-foreground"
          >
            <MessageSquareHeart className="size-5" />
            <span className="text-[10px] font-bold">Feedback</span>
          </button>
        </div>
      </nav>

      <AppFeedbackSheet open={feedbackAberto} onClose={() => setFeedbackAberto(false)} />
    </>
  );
}
