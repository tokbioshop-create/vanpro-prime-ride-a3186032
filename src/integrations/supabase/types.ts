export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.15" }
  public: {
    Tables: {
      empresas_publicas: {
        Row: {
          user_id: string; email: string; nome: string; sigla: string; cidade: string; descricao: string; banner: string | null
          rotas: Json; horarios: Json; frota: Json; servicos: Json; telefone: string; whatsapp: string; contato_email: string; atualizado_em: string
        }
        Insert: {
          user_id: string; email: string; nome: string; sigla?: string; cidade?: string; descricao?: string; banner?: string | null
          rotas?: Json; horarios?: Json; frota?: Json; servicos?: Json; telefone?: string; whatsapp?: string; contato_email?: string; atualizado_em?: string
        }
        Update: {
          user_id?: string; email?: string; nome?: string; sigla?: string; cidade?: string; descricao?: string; banner?: string | null
          rotas?: Json; horarios?: Json; frota?: Json; servicos?: Json; telefone?: string; whatsapp?: string; contato_email?: string; atualizado_em?: string
        }
        Relationships: []
      }
      posicoes_viagem: {
        Row: { id: number; latitude: number; longitude: number; precisao: number | null; registrada_em: string; rumo: number | null; velocidade: number | null; viagem_id: string }
        Insert: { id?: never; latitude: number; longitude: number; precisao?: number | null; registrada_em?: string; rumo?: number | null; velocidade?: number | null; viagem_id: string }
        Update: { id?: never; latitude?: number; longitude?: number; precisao?: number | null; registrada_em?: string; rumo?: number | null; velocidade?: number | null; viagem_id?: string }
        Relationships: [{ foreignKeyName: "posicoes_viagem_viagem_id_fkey"; columns: ["viagem_id"]; isOneToOne: false; referencedRelation: "viagens_rastreadas"; referencedColumns: ["id"] }]
      }
      viagem_motorista: {
        Row: { criado_em: string; token: string; viagem_id: string }
        Insert: { criado_em?: string; token?: string; viagem_id: string }
        Update: { criado_em?: string; token?: string; viagem_id?: string }
        Relationships: [{ foreignKeyName: "viagem_motorista_viagem_id_fkey"; columns: ["viagem_id"]; isOneToOne: true; referencedRelation: "viagens_rastreadas"; referencedColumns: ["id"] }]
      }
      viagens_rastreadas: {
        Row: { atualizada_em: string; compartilhando: boolean; criada_em: string; destino: string; destino_lat: number | null; destino_lng: number | null; empresa: string; encerrada: boolean; id: string; motorista: string; origem: string; origem_lat: number | null; origem_lng: number | null; titulo: string }
        Insert: { atualizada_em?: string; compartilhando?: boolean; criada_em?: string; destino?: string; destino_lat?: number | null; destino_lng?: number | null; empresa?: string; encerrada?: boolean; id?: string; motorista?: string; origem?: string; origem_lat?: number | null; origem_lng?: number | null; titulo: string }
        Update: { atualizada_em?: string; compartilhando?: boolean; criada_em?: string; destino?: string; destino_lat?: number | null; destino_lng?: number | null; empresa?: string; encerrada?: boolean; id?: string; motorista?: string; origem?: string; origem_lat?: number | null; origem_lng?: number | null; titulo?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals }, TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R } ? R : never : never

export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals }, TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } ? I : never : never

export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals }, TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } ? U : never : never

export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals }, EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never

export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals }, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never

export const Constants = { public: { Enums: {} } } as const
