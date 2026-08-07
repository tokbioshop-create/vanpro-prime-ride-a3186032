import { useCallback, useEffect, useState } from "react";

export type Feedback = {
  nome: string;
  mensagem: string;
  estrelas: number;
  data: string;
  tipo: "empresa" | "app";
};

const KEY = "vanpro-feedbacks";

export function useFeedbacks(tipo: Feedback["tipo"]) {
  const [lista, setLista] = useState<Feedback[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setLista((JSON.parse(raw) as Feedback[]).filter((f) => f.tipo === tipo));
    } catch {
      /* ignora */
    }
  }, [tipo]);

  const enviar = useCallback(
    (f: Omit<Feedback, "data" | "tipo">) => {
      const novo: Feedback = { ...f, tipo, data: new Date().toISOString() };
      try {
        const raw = window.localStorage.getItem(KEY);
        const todos = raw ? (JSON.parse(raw) as Feedback[]) : [];
        window.localStorage.setItem(KEY, JSON.stringify([novo, ...todos]));
      } catch {
        /* ignora */
      }
      setLista((prev) => [novo, ...prev]);
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
