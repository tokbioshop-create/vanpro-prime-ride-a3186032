import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { AppScreen, Field, inputClass } from "@/components/AppScreen";
import { AreaField, PainelCard, SaveButton, TextField } from "@/components/PainelForm";
import { usePainel, veiculoLabels, type VeiculoTipo } from "@/data/painel";
import vanImg from "@/assets/veiculos/van.png.asset.json";
import microImg from "@/assets/veiculos/micro.png.asset.json";
import onibusImg from "@/assets/veiculos/onibus.png.asset.json";

export const Route = createFileRoute("/painel/agendamento")({
  head: () => ({
    meta: [
      { title: "Configurar agendamento — Painel VanPro" },
      {
        name: "description",
        content:
          "Defina rotas, veículos da sua frota, horários de saída e chegada e preços disponíveis ao cliente.",
      },
      { property: "og:title", content: "Configurar agendamento — Painel VanPro" },
      { property: "og:description", content: "Tudo o que o cliente escolhe ao agendar uma viagem." },
    ],
  }),
  component: PainelAgendamento,
});

const tiposFrota: { id: VeiculoTipo; img: string }[] = [
  { id: "van", img: vanImg.url },
  { id: "micro", img: microImg.url },
  { id: "onibus", img: onibusImg.url },
];

function PainelAgendamento() {
  const { config, salvar } = usePainel();
  const [form, setForm] = useState(config.agendamento);
  const [salvo, setSalvo] = useState(false);
  useEffect(() => setForm(config.agendamento), [config.agendamento]);

  const lista = (k: "rotas" | "veiculos") => (v: string) => {
    setForm({ ...form, [k]: v.split("\n") });
    setSalvo(false);
  };
  const texto = (k: "precoBase" | "antecedencia" | "politica") => (v: string) => {
    setForm({ ...form, [k]: v });
    setSalvo(false);
  };

  const alternarTipo = (id: VeiculoTipo) => {
    const tem = form.tiposVeiculo.includes(id);
    setForm({
      ...form,
      tiposVeiculo: tem
        ? form.tiposVeiculo.filter((t) => t !== id)
        : [...form.tiposVeiculo, id],
    });
    setSalvo(false);
  };

  const setHorario = (i: number, campo: "saida" | "chegada", v: string) => {
    const horarios = form.horarios.map((h, idx) => (idx === i ? { ...h, [campo]: v } : h));
    setForm({ ...form, horarios });
    setSalvo(false);
  };

  return (
    <AppScreen title="Agendar viagem" subtitle="Opções oferecidas ao cliente" back="/painel">
      <PainelCard>
        <Field label="Veículos que a empresa possui">
          <div className="grid grid-cols-3 gap-2">
            {tiposFrota.map(({ id, img }) => {
              const ativo = form.tiposVeiculo.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => alternarTipo(id)}
                  aria-pressed={ativo}
                  className={`press relative flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition ${
                    ativo
                      ? "bg-brand text-primary-foreground shadow-[var(--shadow-brand)]"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {ativo && (
                    <span className="bg-gold text-navy absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full">
                      <Check className="size-3.5" strokeWidth={3.5} />
                    </span>
                  )}
                  <img
                    src={img}
                    alt=""
                    className={`h-9 w-full object-contain ${ativo ? "" : "opacity-60"}`}
                  />
                  <span className="text-[10px] font-extrabold whitespace-nowrap">
                    {veiculoLabels[id]}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="mt-1.5 block text-[11px] text-muted-foreground">
            Só os veículos marcados aparecem para o cliente.
          </span>
        </Field>

        <AreaField
          label="Rotas disponíveis"
          value={form.rotas.join("\n")}
          onChange={lista("rotas")}
          hint="Uma rota por linha"
        />

        <Field label="Horários (saída e chegada)">
          <div className="space-y-2">
            {form.horarios.map((h, i) => (
              <div key={i} className="flex items-end gap-2">
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase">
                    Saída
                  </span>
                  <input
                    type="time"
                    className={inputClass + " py-3"}
                    value={h.saida}
                    onChange={(e) => setHorario(i, "saida", e.target.value)}
                  />
                </label>
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase">
                    Chegada
                  </span>
                  <input
                    type="time"
                    className={inputClass + " py-3"}
                    value={h.chegada}
                    onChange={(e) => setHorario(i, "chegada", e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  aria-label="Remover horário"
                  onClick={() => {
                    setForm({ ...form, horarios: form.horarios.filter((_, idx) => idx !== i) });
                    setSalvo(false);
                  }}
                  className="press mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted-foreground"
                >
                  <Trash2 className="size-4.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setForm({ ...form, horarios: [...form.horarios, { saida: "", chegada: "" }] });
              setSalvo(false);
            }}
            className="press mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-2 text-xs font-bold text-primary"
          >
            <Plus className="size-4" strokeWidth={3} /> Adicionar horário
          </button>
        </Field>

        <AreaField
          label="Descrição da frota"
          value={form.veiculos.join("\n")}
          onChange={lista("veiculos")}
          rows={3}
          hint="Ex.: Van executiva · 15 lugares — um por linha"
        />
        <TextField label="Preço base (R$)" value={form.precoBase} onChange={texto("precoBase")} />
        <TextField
          label="Antecedência mínima"
          value={form.antecedencia}
          onChange={texto("antecedencia")}
        />
        <AreaField
          label="Política de cancelamento"
          value={form.politica}
          onChange={texto("politica")}
          rows={3}
        />
      </PainelCard>

      <SaveButton
        salvo={salvo}
        onClick={() => {
          salvar({ ...config, agendamento: form });
          setSalvo(true);
        }}
      />
    </AppScreen>
  );
}

