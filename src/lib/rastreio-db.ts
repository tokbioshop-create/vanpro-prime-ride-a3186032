import type { SupabaseClient } from "@supabase/supabase-js";

export type ViagemRow = {
  id: string;
  titulo: string;
  origem: string;
  destino: string;
  motorista: string;
  empresa: string;
  compartilhando: boolean;
  encerrada: boolean;
  criada_em: string;
  atualizada_em: string;
};

export type PosicaoRow = {
  id: number;
  viagem_id: string;
  latitude: number;
  longitude: number;
  precisao: number | null;
  velocidade: number | null;
  rumo: number | null;
  registrada_em: string;
};

export type MotoristaRow = {
  viagem_id: string;
  token: string;
  criado_em: string;
};

/** Schema do rastreamento, escrito à mão enquanto os tipos gerados não incluem as tabelas novas. */
export type RastreioDb = {
  public: {
    Tables: {
      viagens_rastreadas: {
        Row: ViagemRow;
        Insert: Partial<ViagemRow> & { titulo: string };
        Update: Partial<ViagemRow>;
        Relationships: [];
      };
      posicoes_viagem: {
        Row: PosicaoRow;
        Insert: Omit<PosicaoRow, "id" | "registrada_em"> & { registrada_em?: string };
        Update: Partial<PosicaoRow>;
        Relationships: [];
      };
      viagem_motorista: {
        Row: MotoristaRow;
        Insert: { viagem_id: string; token?: string };
        Update: Partial<MotoristaRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type RastreioClient = SupabaseClient<RastreioDb, "public">;

export function comoRastreio(client: unknown): RastreioClient {
  return client as RastreioClient;
}
