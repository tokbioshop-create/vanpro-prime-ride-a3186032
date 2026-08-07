import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Bus, Route as RouteIcon, Clock, Phone, Mail, Star, MessageCircle } from "lucide-react";
import { AppScreen, inputClass } from "@/components/AppScreen";
import { useAvaliacoes } from "@/data/painel";
import { empresaById, whatsappLink, type Empresa } from "@/data/vanpro";


export const Route = createFileRoute("/empresa/$id")({
  loader: ({ params }) => {
    const empresa = empresaById(params.id);
    if (!empresa) throw notFound();
    return { empresa };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Empresa indisponível — VanPro" }, { name: "robots", content: "noindex" }],
      };
    const { empresa } = loaderData;
    return {
      meta: [
        { title: `${empresa.nome} — VanPro` },
        {
          name: "description",
          content: `Frota, rotas, horários e contatos de ${empresa.nome} em ${empresa.cidade}.`,
        },
        { property: "og:title", content: `${empresa.nome} — VanPro` },
        {
          property: "og:description",
          content: `Serviços de transporte executivo de ${empresa.nome}.`,
        },
      ],
    };
  },
  component: EmpresaDetalhe,
});

function EmpresaDetalhe() {
  const { empresa } = Route.useLoaderData() as { empresa: Empresa };

  return (
    <AppScreen title={empresa.nome} subtitle={empresa.cidade} back="/empresas">
      <div className="card-elevated flex items-center gap-4 p-4">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-primary-foreground">
          {empresa.sigla}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold">{empresa.nome}</h2>
          <p className="text-[11px] text-muted-foreground">{empresa.cidade}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <Star className="size-3.5 fill-primary" /> {empresa.nota} · Empresa verificada
          </p>
        </div>
      </div>

      <Section icon={Bus} title="Frota">
        <div className="space-y-2.5">
          {empresa.frota.map((f) => (
            <div key={f.modelo} className="rounded-xl bg-surface-2 p-3.5">
              <p className="text-sm font-semibold">{f.modelo}</p>
              <p className="text-[11px] text-muted-foreground">
                {f.lugares} lugares · {f.recursos}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={RouteIcon} title="Rotas">
        <ul className="space-y-2">
          {empresa.rotas.map((r) => (
            <li key={r} className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-primary" /> {r}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={Clock} title="Horários">
        <div className="flex flex-wrap gap-2">
          {empresa.horarios.map((h) => (
            <span
              key={h}
              className="rounded-lg bg-surface-2 shadow-[var(--shadow-soft)] px-3 py-2 text-xs font-semibold"
            >
              {h}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={Phone} title="Contatos">
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-primary" /> {empresa.telefone}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-primary" /> {empresa.email}
          </p>
        </div>
      </Section>

      <Section icon={Star} title="Serviços disponíveis">
        <div className="flex flex-wrap gap-2">
          {empresa.servicos.map((s) => (
            <span
              key={s}
              className="rounded-full border border-primary/30 bg-[oklch(0.82_0.13_85/0.1)] px-3 py-1.5 text-[11px] font-semibold text-primary"
            >
              {s}
            </span>
          ))}
        </div>
      </Section>

      <Avaliar empresaId={empresa.id} />

      <div className="mt-5 flex gap-2.5">
        <a
          href={whatsappLink(empresa.whatsapp, `Olá ${empresa.nome}, gostaria de informações sobre uma viagem.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="press flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-[oklch(0.72_0.16_158)] text-sm font-bold text-[oklch(0.18_0.035_265)]"
        >
          <MessageCircle className="size-4.5" /> WhatsApp
        </a>
        <Link
          to="/agendar"
          className="press flex h-13 flex-1 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-primary-foreground"
        >
          Agendar viagem
        </Link>
      </div>

    </AppScreen>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bus;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-4 text-primary" /> {title}
      </h3>
      <div className="card-elevated p-4">{children}</div>
    </section>
  );
}

function Avaliar({ empresaId }: { empresaId: string }) {
  const { lista, adicionar } = useAvaliacoes();
  const [aberto, setAberto] = useState(false);
  const [estrelas, setEstrelas] = useState(5);
  const [texto, setTexto] = useState("");
  const enviadas = lista.filter((a) => a.empresaId === empresaId);

  return (
    <section className="mt-5">
      <h3 className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Star className="size-4 text-primary" /> Avaliações
      </h3>
      <div className="card-elevated p-4">
        <p className="text-[11px] text-muted-foreground">
          {enviadas.length > 0
            ? `${enviadas.length} avaliação(ões) enviadas por você`
            : "Sua opinião ajuda outros passageiros."}
        </p>

        {!aberto ? (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="press bg-brand mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand-soft)]"
          >
            <Star className="size-4.5" /> Avaliar com estrelas
          </button>
        ) : (
          <div className="animate-rise mt-3">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setEstrelas(n)} aria-label={`${n} estrelas`}>
                  <Star
                    className={`size-8 ${n <= estrelas ? "fill-[var(--gold)] text-[var(--gold)]" : "text-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Conte como foi sua viagem (opcional)"
              className={inputClass + " mt-3 resize-none"}
            />
            <button
              type="button"
              onClick={() => {
                adicionar({
                  empresaId,
                  estrelas,
                  texto,
                  data: new Date().toLocaleDateString("pt-BR"),
                });
                setTexto("");
                setAberto(false);
              }}
              className="press bg-brand mt-3 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand)]"
            >
              Enviar avaliação
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
