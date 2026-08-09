import { useCallback, useEffect, useState } from "react";

export type Feedback = {
  nome: string;
  mensagem: string;
  estrelas: number;
  data: string;
  tipo: "empresa" | "app";
};

const KEY = "vanpro-feedbacks";
const EVT = "vanpro-feedbacks-alterados";

function ler(tipo: Feedback["tipo"]): Feedback[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Feedback[]).filter((f) => f.tipo === tipo);
  } catch {
    return [];
  }
}

export function useFeedbacks(tipo: Feedback["tipo"]) {
  const [lista, setLista] = useState<Feedback[]>([]);

  useEffect(() => {
    setLista(ler(tipo));
    const sync = () => setLista(ler(tipo));
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [tipo]);

  const enviar = useCallback(
    (f: Omit<Feedback, "data" | "tipo">) => {
      const novo: Feedback = { ...f, tipo, data: new Date().toISOString() };
      try {
        const raw = window.localStorage.getItem(KEY);
        const todos = raw ? (JSON.parse(raw) as Feedback[]) : [];
        window.localStorage.setItem(KEY, JSON.stringify([novo, ...todos].slice(0, 100)));
      } catch {
        /* ignora */
      }
      setLista((prev) => [novo, ...prev]);
      window.dispatchEvent(new Event(EVT));
    },
    [tipo],
  );

  return { lista, enviar };
}

export type Cadastro = {
  nome: string;
  cpf: string;
  whatsapp: string;
  email: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  estado: string;
};

const KEY_USER = "vanpro-cadastro";

export function salvarCadastro(c: Cadastro) {
  try {
    window.localStorage.setItem(KEY_USER, JSON.stringify(c));
  } catch {
    /* ignora */
  }
}

export function salvarLogin(email: string) {
  try {
    window.localStorage.setItem("vanpro-login", email);
  } catch {
    /* ignora */
  }
}
