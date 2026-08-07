import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cobrancaSchema = z.object({
  valor: z.number().positive().max(100000),
  metodo: z.enum(["pix", "cartao", "boleto"]),
  descricao: z.string().trim().min(1).max(200),
  cliente: z
    .object({
      nome: z.string().trim().max(120).optional(),
      email: z.string().trim().email().max(255).optional(),
    })
    .optional(),
  // dados de recebimento da empresa (configurados no painel)
  recebedor: z
    .object({
      chavePix: z.string().trim().max(140).optional(),
      subconta: z.string().trim().max(80).optional(),
    })
    .optional(),
});

export type CobrancaInput = z.infer<typeof cobrancaSchema>;

export type CobrancaResultado = {
  ok: boolean;
  id?: string;
  status?: string;
  pixCopiaECola?: string;
  qrCodeUrl?: string;
  linkPagamento?: string;
  erro?: string;
};

export const criarCobranca = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => cobrancaSchema.parse(input))
  .handler(async ({ data }): Promise<CobrancaResultado> => {
    const apiKey = process.env["UNICOPAG_API_KEY"];
    if (!apiKey) {
      return { ok: false, erro: "Chave da Unicopag não configurada." };
    }
    const base = process.env["UNICOPAG_API_URL"] ?? "https://api.unicopag.com/v1";

    const resp = await fetch(`${base}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: Math.round(data.valor * 100),
        currency: "BRL",
        payment_method: data.metodo,
        description: data.descricao,
        customer: data.cliente,
        split: data.recebedor,
      }),
    });

    const texto = await resp.text();
    if (!resp.ok) {
      console.error(`Unicopag falhou [${resp.status}]: ${texto}`);
      return { ok: false, erro: `Unicopag [${resp.status}]: ${texto.slice(0, 300)}` };
    }

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(texto) as Record<string, unknown>;
    } catch {
      return { ok: false, erro: "Resposta inválida da Unicopag." };
    }

    return {
      ok: true,
      id: String(body["id"] ?? ""),
      status: String(body["status"] ?? "pending"),
      pixCopiaECola: (body["pix_copy_paste"] as string) ?? (body["qr_code"] as string) ?? undefined,
      qrCodeUrl: (body["qr_code_image"] as string) ?? undefined,
      linkPagamento: (body["payment_url"] as string) ?? undefined,
    };
  });
