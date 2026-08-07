import { useCallback, useEffect, useState } from "react";

export type ItemCarrinho = {
  id: string;
  veiculo: string;
  assento: string;
  horario: string;
  valor: number;
};

const KEY = "vanpro-carrinho";
const EVENTO = "vanpro-carrinho-alterado";

function ler(): ItemCarrinho[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ItemCarrinho[]) : [];
  } catch {
    return [];
  }
}

function gravar(itens: ItemCarrinho[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(itens));
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
}

export function useCarrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    const sync = () => setItens(ler());
    sync();
    window.addEventListener(EVENTO, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const adicionar = useCallback((item: ItemCarrinho) => {
    const atuais = ler();
    if (atuais.some((i) => i.id === item.id)) return;
    gravar([...atuais, item]);
  }, []);

  const remover = useCallback((id: string) => {
    gravar(ler().filter((i) => i.id !== id));
  }, []);

  const limpar = useCallback(() => gravar([]), []);

  return { itens, total: itens.reduce((s, i) => s + i.valor, 0), adicionar, remover, limpar };
}
