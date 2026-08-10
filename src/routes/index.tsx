import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Clock, Star } from "lucide-react";
import { VanProLogo } from "@/components/VanProLogo";
import van from "@/assets/van.png";
import minibus from "@/assets/minibus.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VanPro — Vans, Micro-ônibus e Ônibus Executivos" },
      {
        name: "description",
        content:
          "VanPro é o aplicativo para reservar viagens em vans e micro-ônibus executivos com segurança, rapidez e conforto.",
      },
      { property: "og:title", content: "VanPro — Transporte executivo na palma da mão" },
      {
        property: "og:description",
        content:
          "Agende viagens, escolha assentos, pague com PIX e fale com o motorista. Tudo em um app premium.",
      },
    ],
  }),
  component: Splash,
});

const selos = [
  { icon: ShieldCheck, title: "Segurança", hint: "Viagens verificadas" },
  { icon: Clock, title: "Pontualidade", hint: "Chegue no horário" },
  { icon: Star, title: "Conforto", hint: "Frota executiva" },
] as const;

function Splash() {
  return (
    <div className="bg-deep relative min-h-screen overflow-hidden">
      {/* Cortina de abertura */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="animate-curtain-left absolute inset-y-0 left-0 w-1/2 bg-[oklch(0.07_0.03_268)] shadow-2xl" />
        <div className="animate-curtain-right absolute inset-y-0 right-0 w-1/2 bg-[oklch(0.07_0.03_268)] shadow-2xl" />
      </div>

      <div
        className="pointer-events-none absolute -top-24 left-1/2 size-[460px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.5 0.26 268 / 0.55), transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-1/3 h-40 opacity-40 blur-2xl"
        style={{ background: "radial-gradient(60% 100% at 50% 100%, oklch(0.84 0.15 87 / 0.3), transparent 70%)" }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pt-[max(2.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="animate-rise flex flex-col items-center" style={{ animationDelay: "1.9s" }}>
          <div className="flex items-center gap-3">
            <VanProLogo size={52} variant="outline" />
            <h1 className="text-[2.8rem] leading-none font-extrabold tracking-tight">
              <span className="text-gold">Van</span>
              <span className="text-[oklch(0.99_0_0)]">Pro</span>
            </h1>
          </div>
          <p className="mt-1 text-[10px] font-medium tracking-[0.2em] text-[oklch(0.85_0.02_265)] uppercase">
            Transporte Executivo
          </p>
        </div>


        {/* Veículos entrando em cena — lado a lado, em profundidade */}
        <div className="relative my-6 flex w-full items-end justify-center">
          <img
            src={onibusImg.url}
            alt="Ônibus executivo VanPro"
            className="animate-drive-left relative z-10 -mr-10 w-[44%] origin-bottom scale-90 opacity-90 drop-shadow-[0_18px_26px_oklch(0_0_0/0.7)]"
            style={{ animationDelay: "1.15s" }}
          />
          <img
            src={minibus}
            alt="Micro-ônibus executivo VanPro"
            className="animate-rise relative z-20 -mr-10 w-[50%] origin-bottom scale-95 drop-shadow-[0_20px_30px_oklch(0_0_0/0.78)]"
            style={{ animationDelay: "1.45s" }}
          />
          <img
            src={van}
            alt="Van executiva VanPro"
            className="animate-drive-right relative z-30 w-[54%] origin-bottom drop-shadow-[0_24px_36px_oklch(0_0_0/0.85)]"
            style={{ animationDelay: "1.75s" }}
          />
          <div className="absolute -bottom-2 left-1/2 h-7 w-[92%] -translate-x-1/2 rounded-[100%] bg-[oklch(0_0_0/0.6)] blur-xl" />
        </div>



        <div className="animate-rise text-center" style={{ animationDelay: "2.2s" }}>
          <h2 className="text-[1.6rem] leading-tight font-extrabold text-[oklch(0.99_0_0)]">
            Sua viagem, <span className="text-gold">compromisso real.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[20rem] text-sm leading-relaxed text-[oklch(0.8_0.02_265)]">
            Vans, micro-ônibus e ônibus executivos com segurança e conforto total.

          </p>
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={
                  i === 2
                    ? "bg-gold h-1 w-7 rounded-full"
                    : "h-1 w-5 rounded-full bg-[oklch(1_0_0/0.22)]"
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="animate-rise" style={{ animationDelay: "2.5s" }}>
            <Link
              to="/login"
              className="press bg-gold text-navy relative flex h-15 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full text-base font-extrabold shadow-[var(--shadow-gold)]"
            >
              <span className="animate-sheen absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-[oklch(1_0_0/0.4)]" />
              Começar
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div
            className="animate-rise mt-6 grid grid-cols-3 divide-x divide-[oklch(1_0_0/0.12)]"
            style={{ animationDelay: "2.7s" }}
          >
            {selos.map(({ icon: Icon, title, hint }) => (
              <div key={title} className="flex items-center justify-center gap-2 px-1">
                <Icon className="text-gold size-5 shrink-0" strokeWidth={2.2} />
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold text-[oklch(0.98_0_0)]">
                    {title}
                  </span>
                  <span className="block text-[9.5px] leading-tight text-[oklch(0.72_0.02_265)]">{hint}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
