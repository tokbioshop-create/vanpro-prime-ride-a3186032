import { supabase } from "@/integrations/supabase/client";
import type { PainelConfig } from "@/data/painel";

export type EmpresaPublica = {
  user_id: string;
  email: string;
  nome: string;
  sigla: string;
  cidade: string;
  descricao: string;
  banner: string | null;
  rotas: string[];
  horarios: { saida: string; chegada: string }[];
  frota: { modelo: string; lugares: number; recursos: string }[];
  servicos: string[];
  telefone: string;
  whatsapp: string;
  contato_email: string;
};

const PUBLIC_BASE_URL = (import.meta.env.VITE_PUBLIC_APP_URL || "https://vanpro.com.br").replace(/\/$/, "");

export function empresaPublicaUrl(email: string) {
  return `${PUBLIC_BASE_URL}/empresa/${email.trim().toLowerCase()}`;
}

export async function publicarEmpresa(config: PainelConfig) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) throw new Error("Não foi possível identificar o e-mail da empresa.");

  const email = user.email.trim().toLowerCase();
  const { error } = await supabase.from("empresas_publicas").upsert(
    {
      user_id: user.id,
      email,
      nome: config.empresa.nome.trim(),
      sigla: config.empresa.sigla.trim(),
      cidade: config.empresa.cidade.trim(),
      descricao: config.empresa.descricao.trim(),
      banner: config.empresa.banner || null,
      rotas: config.agendamento.rotas,
      horarios: config.agendamento.horarios,
      frota: config.agendamento.veiculos.map((modelo) => ({ modelo, lugares: 0, recursos: "" })),
      servicos: config.agendamento.tiposVeiculo.map((tipo) =>
        tipo === "van" ? "Van executiva" : tipo === "micro" ? "Micro-ônibus" : "Ônibus",
      ),
      telefone: config.contatos.telefone.trim(),
      whatsapp: config.contatos.whatsapp.trim(),
      contato_email: config.contatos.email.trim() || email,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
  return { email, url: empresaPublicaUrl(email) };
}

export { PUBLIC_BASE_URL };
