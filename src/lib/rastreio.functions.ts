import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const criarSchema = z.object({
  titulo: z.string().trim().min(1).max(120),
  origem: z.string().trim().max(120).default(""),
  destino: z.string().trim().max(120).default(""),
  motorista: z.string().trim().max(120).default(""),
  empresa: z.string().trim().max(120).default(""),
});

const idSchema = z.object({ id: z.string().uuid() });

const compartilharSchema = z.object({
  id: z.string().uuid(),
  compartilhando: z.boolean(),
});

const posicaoSchema = z.object({
  token: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  precisao: z.number().nonnegative().max(100000).nullable().optional(),
  velocidade: z.number().min(-1).max(400).nullable().optional(),
  rumo: z.number().min(-1).max(360).nullable().optional(),
  registrada_em: z.string().datetime().optional(),
});

export type ViagemRastreada = {
  id: string;
  titulo: string;
  origem: string;
  destino: string;
  motorista: string;
  empresa: string;
  compartilhando: boolean;
  encerrada: boolean;
  criada_em: string;
  token?: string;
};

/** Painel do empresário: lista todas as viagens (inclusive as não compartilhadas) + token do motorista. */
export const listarViagensPainel = createServerFn({ method: "GET" }).handler(
  async (): Promise<ViagemRastreada[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("viagens_rastreadas")
      .select("*, viagem_motorista(token)")
      .order("criada_em", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map((v) => {
      const rel = (v as { viagem_motorista?: { token: string } | { token: string }[] })
        .viagem_motorista;
      const token = Array.isArray(rel) ? rel[0]?.token : rel?.token;
      return { ...(v as unknown as ViagemRastreada), token };
    });
  },
);

export const criarViagemRastreada = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => criarSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: viagem, error } = await supabaseAdmin
      .from("viagens_rastreadas")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const { error: erroToken } = await supabaseAdmin
      .from("viagem_motorista")
      .insert({ viagem_id: viagem.id });
    if (erroToken) throw new Error(erroToken.message);
    return { id: viagem.id as string };
  });

export const definirCompartilhamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => compartilharSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("viagens_rastreadas")
      .update({ compartilhando: data.compartilhando, atualizada_em: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const encerrarViagemRastreada = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("viagens_rastreadas")
      .update({ encerrada: true, compartilhando: false, atualizada_em: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Tela do motorista: valida o código secreto e devolve o estado atual da viagem. */
export const viagemDoMotorista = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: vinculo, error } = await supabaseAdmin
      .from("viagem_motorista")
      .select("viagem_id, viagens_rastreadas(*)")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vinculo) return { ok: false as const, erro: "Código do motorista inválido." };
    const rel = (vinculo as { viagens_rastreadas: ViagemRastreada | ViagemRastreada[] })
      .viagens_rastreadas;
    const viagem = Array.isArray(rel) ? rel[0] : rel;
    if (!viagem) return { ok: false as const, erro: "Viagem não encontrada." };
    return { ok: true as const, viagem };
  });

/** Recebe a posição GPS real do aparelho do motorista. */
export const enviarPosicao = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => posicaoSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: vinculo, error } = await supabaseAdmin
      .from("viagem_motorista")
      .select("viagem_id, viagens_rastreadas(compartilhando, encerrada)")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vinculo) return { ok: false as const, erro: "Código do motorista inválido." };

    const rel = (
      vinculo as { viagens_rastreadas: { compartilhando: boolean; encerrada: boolean } | null }
    ).viagens_rastreadas;
    const estado = Array.isArray(rel) ? rel[0] : rel;
    if (!estado || estado.encerrada) return { ok: false as const, erro: "Viagem encerrada." };
    if (!estado.compartilhando)
      return { ok: false as const, erro: "Compartilhamento desativado pelo empresário." };

    const { error: erroInsert } = await supabaseAdmin.from("posicoes_viagem").insert({
      viagem_id: (vinculo as { viagem_id: string }).viagem_id,
      latitude: data.latitude,
      longitude: data.longitude,
      precisao: data.precisao ?? null,
      velocidade: data.velocidade ?? null,
      rumo: data.rumo ?? null,
      ...(data.registrada_em ? { registrada_em: data.registrada_em } : {}),
    });
    if (erroInsert) throw new Error(erroInsert.message);
    return { ok: true as const };
  });
