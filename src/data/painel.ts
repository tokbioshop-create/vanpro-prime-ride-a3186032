import { useCallback, useEffect, useState } from "react";

export type VeiculoTipo = "van" | "micro" | "onibus";

export const veiculoLabels: Record<VeiculoTipo, string> = {
  van: "Van",
  micro: "Micro-ônibus",
  onibus: "Ônibus",
};

export type Horario = { saida: string; chegada: string };

export type PainelConfig = {
  empresa: {
    nome: string;
    sigla: string;
    cidade: string;
    cnpj: string;
    descricao: string;
  };
  agendamento: {
    rotas: string[];
    horarios: Horario[];
    tiposVeiculo: VeiculoTipo[];
    veiculos: string[];
    precoBase: string;
    antecedencia: string;
    politica: string;
  };

  financeiro: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: string;
    titular: string;
    documento: string;
    chavePix: string;
    subconta: string;
    unicopagClienteId: string;
  };
  contatos: {
    whatsapp: string;
    telefone: string;
    email: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

export const painelPadrao: PainelConfig = {
  empresa: {
    nome: "Executiva Atlântica",
    sigla: "EA",
    cidade: "Salvador · BA",
    cnpj: "12.345.678/0001-90",
    descricao: "Transporte executivo em vans, micro-ônibus e ônibus para empresas e turismo.",
  },
  agendamento: {
    rotas: ["Salvador → Praia do Forte", "Salvador → Feira de Santana"],
    horarios: [
      { saida: "05:30", chegada: "07:20" },
      { saida: "07:00", chegada: "08:50" },
      { saida: "13:00", chegada: "14:50" },
      { saida: "17:45", chegada: "19:35" },
    ],
    tiposVeiculo: ["van", "micro"],
    veiculos: ["Van executiva · 15 lugares", "Micro-ônibus · 28 lugares"],
    precoBase: "89,00",
    antecedencia: "2 horas",
    politica: "Cancelamento gratuito com mais de 24h de antecedência.",
  },

  financeiro: {
    banco: "Banco do Brasil",
    agencia: "1234-5",
    conta: "98765-4",
    tipoConta: "Corrente",
    titular: "Executiva Atlântica LTDA",
    documento: "12.345.678/0001-90",
    chavePix: "reservas@atlantica.com.br",
    subconta: "VP-SUB-1042",
    unicopagClienteId: "",
  },
  contatos: {
    whatsapp: "5571988887777",
    telefone: "(71) 3555-1200",
    email: "reservas@atlantica.com.br",
    instagram: "@executivaatlantica",
    facebook: "/executivaatlantica",
    tiktok: "@executivaatlantica",
  },
};

const KEY = "vanpro-painel";

export function usePainel() {
  const [config, setConfig] = useState<PainelConfig>(painelPadrao);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PainelConfig>;
      const ag = { ...painelPadrao.agendamento, ...(parsed.agendamento ?? {}) };
      ag.horarios = (ag.horarios as unknown as (Horario | string)[]).map((h) =>
        typeof h === "string" ? { saida: h, chegada: "" } : h,
      );
      if (!Array.isArray(ag.tiposVeiculo) || ag.tiposVeiculo.length === 0) {
        ag.tiposVeiculo = painelPadrao.agendamento.tiposVeiculo;
      }
      setConfig({ ...painelPadrao, ...parsed, agendamento: ag });
    } catch {
      /* ignora */
    }
  }, []);


  const salvar = useCallback((next: PainelConfig) => {
    setConfig(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignora */
    }
  }, []);

  return { config, salvar };
}

export type Avaliacao = { empresaId: string; estrelas: number; texto: string; data: string };

const KEY_AV = "vanpro-avaliacoes";

export function useAvaliacoes() {
  const [lista, setLista] = useState<Avaliacao[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY_AV);
      if (raw) setLista(JSON.parse(raw));
    } catch {
      /* ignora */
    }
  }, []);

  const adicionar = useCallback((a: Avaliacao) => {
    setLista((prev) => {
      const next = [a, ...prev];
      try {
        window.localStorage.setItem(KEY_AV, JSON.stringify(next));
      } catch {
        /* ignora */
      }
      return next;
    });
  }, []);

  return { lista, adicionar };
}
