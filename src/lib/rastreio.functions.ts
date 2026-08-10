import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { comoRastreio } from "./rastreio-db";

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

export const excluirViagemRastreada = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    // A tabela viagem_motorista tem ON DELETE CASCADE, mas posicoes_viagem também deve ser limpa se não tiver
    const { error: erroPosicoes } = await db
      .from("posicoes_viagem")
      .delete()
      .eq("viagem_id", data.id);
    if (erroPosicoes) throw new Error(erroPosicoes.message);

    const { error } = await db
      .from("viagens_rastreadas")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


const posicaoSchema = z.object({
  token: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  precisao: z.number().nonnegative().max(100000).nullable().optional(),
  velocidade: z.number().min(-1).max(400).nullable().optional(),
  rumo: z.number().min(-1).max(360).nullable().optional(),
  registrada_em: z.string().optional(),
});

export type ViagemPainel = {
  id: string;
  titulo: string;
  origem: string;
  destino: string;
  motorista: string;
  empresa: string;
  compartilhando: boolean;
  encerrada: boolean;
  criada_em: string;
  origem_lat: number | null;
  origem_lng: number | null;
  destino_lat: number | null;
  destino_lng: number | null;
  token: string | null;
};


async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return comoRastreio(supabaseAdmin);
}

/** Painel do empresário: lista todas as viagens (inclusive as não compartilhadas) + código do motorista. */
export const listarViagensPainel = createServerFn({ method: "GET" }).handler(
  async (): Promise<ViagemPainel[]> => {
    const db = await admin();
    const { data, error } = await db
      .from("viagens_rastreadas")
      .select("*")
      .order("criada_em", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const viagens = data ?? [];
    if (viagens.length === 0) return [];

    const { data: vinculos, error: erroVinculos } = await db
      .from("viagem_motorista")
      .select("viagem_id, token")
      .in(
        "viagem_id",
        viagens.map((v) => v.id),
      );
    if (erroVinculos) throw new Error(erroVinculos.message);
    const tokens = new Map((vinculos ?? []).map((v) => [v.viagem_id, v.token]));

    return viagens.map((v) => ({
      id: v.id,
      titulo: v.titulo,
      origem: v.origem,
      destino: v.destino,
      motorista: v.motorista,
      empresa: v.empresa,
      compartilhando: v.compartilhando,
      encerrada: v.encerrada,
      criada_em: v.criada_em,
      origem_lat: v.origem_lat,
      origem_lng: v.origem_lng,
      destino_lat: v.destino_lat,
      destino_lng: v.destino_lng,
      token: tokens.get(v.id) ?? null,
    }));
  },
);

export const criarViagemRastreada = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => criarSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { geocodificar } = await import("./geocode.server");
    const [origemCoord, destinoCoord] = await Promise.all([
      geocodificar(data.origem),
      geocodificar(data.destino),
    ]);
    const { data: viagem, error } = await db
      .from("viagens_rastreadas")
      .insert({
        ...data,
        origem_lat: origemCoord?.lat ?? null,
        origem_lng: origemCoord?.lng ?? null,
        destino_lat: destinoCoord?.lat ?? null,
        destino_lng: destinoCoord?.lng ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const { error: erroToken } = await db
      .from("viagem_motorista")
      .insert({ viagem_id: viagem.id });
    if (erroToken) throw new Error(erroToken.message);
    return { id: viagem.id, localizado: Boolean(origemCoord && destinoCoord) };
  });

/** Localiza um endereço no mapa (usado no painel para marcar origem/destino em tempo real). */
export const localizarEndereco = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ endereco: z.string().trim().max(160) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (!data.endereco) return { lat: null, lng: null };
    const { geocodificar } = await import("./geocode.server");
    const coord = await geocodificar(data.endereco);
    return { lat: coord?.lat ?? null, lng: coord?.lng ?? null };
  });


export const definirCompartilhamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => compartilharSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("viagens_rastreadas")
      .update({ compartilhando: data.compartilhando, atualizada_em: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const encerrarViagemRastreada = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
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
    const db = await admin();
    const { data: vinculo, error } = await db
      .from("viagem_motorista")
      .select("viagem_id")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vinculo) return { ok: false as const, erro: "Código do motorista inválido." };

    const { data: viagem, error: erroViagem } = await db
      .from("viagens_rastreadas")
      .select("*")
      .eq("id", vinculo.viagem_id)
      .maybeSingle();
    if (erroViagem) throw new Error(erroViagem.message);
    if (!viagem) return { ok: false as const, erro: "Viagem não encontrada." };
    return { ok: true as const, viagem };
  });

/** Recebe a posição GPS real do aparelho do motorista. */
export const enviarPosicao = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => posicaoSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: vinculo, error } = await db
      .from("viagem_motorista")
      .select("viagem_id")
      .eq("token", data.token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vinculo) return { ok: false as const, erro: "Código do motorista inválido." };

    const { data: viagem, error: erroViagem } = await db
      .from("viagens_rastreadas")
      .select("compartilhando, encerrada")
      .eq("id", vinculo.viagem_id)
      .maybeSingle();
    if (erroViagem) throw new Error(erroViagem.message);
    if (!viagem || viagem.encerrada) return { ok: false as const, erro: "Viagem encerrada." };
    if (!viagem.compartilhando)
      return { ok: false as const, erro: "Compartilhamento desativado pelo empresário." };

    const { error: erroInsert } = await db.from("posicoes_viagem").insert({
      viagem_id: vinculo.viagem_id,
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
