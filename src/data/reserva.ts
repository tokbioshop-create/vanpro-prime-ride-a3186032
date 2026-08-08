import { useEffect, useState } from "react";
import { useCarrinho } from "@/data/carrinho";
import { usePainel } from "@/data/painel";
import type { Cadastro } from "@/data/feedback";

const KEY_USER = "vanpro-cadastro";
const KEY_OBS = "vanpro-observacao";

export function lerCadastro(): Cadastro | null {
  try {
    const raw = window.localStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as Cadastro) : null;
  } catch {
    return null;
  }
}

export function salvarObservacao(texto: string) {
  try {
    window.localStorage.setItem(KEY_OBS, texto);
  } catch {
    /* ignora */
  }
}

function lerObservacao() {
  try {
    return window.localStorage.getItem(KEY_OBS) ?? "";
  } catch {
    return "";
  }
}

/** Dados reais da reserva, montados a partir do que foi preenchido no app. */
export function useReserva() {
  const { itens, total } = useCarrinho();
  const { config } = usePainel();
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);
  const [observacao, setObservacao] = useState("");
  const [hoje, setHoje] = useState("");

  useEffect(() => {
    setCadastro(lerCadastro());
    setObservacao(lerObservacao());
    setHoje(
      new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(new Date()),
    );
  }, []);

  const rota = config.agendamento.rotas[0] ?? "";
  const [origemBruta, destinoBruto] = rota.split(/→|->/).map((s) => s.trim());

  const primeiro = itens[0];
  const precoBase = Number(config.agendamento.precoBase.replace(/\./g, "").replace(",", ".")) || 0;

  return {
    itens,
    origem: origemBruta || config.empresa.cidade.split("·")[0]?.trim() || "Origem",
    destino: destinoBruto || "Destino",
    horario: primeiro?.horario ?? config.agendamento.horarios[0]?.saida ?? "--:--",
    assentos: itens.length ? itens.map((i) => i.assento).join(", ") : "—",
    passageiros: Math.max(itens.length, 1),
    veiculo: primeiro?.veiculo ?? config.agendamento.veiculos[0] ?? "Van executiva",
    nome: cadastro?.nome?.trim() || "Passageiro não identificado",
    observacao: observacao || "Sem observações",
    data: hoje ? `Hoje, ${hoje}` : "Hoje",
    subtotal: total || precoBase,
    taxa: 0,
    total: total || precoBase,
  };
}
