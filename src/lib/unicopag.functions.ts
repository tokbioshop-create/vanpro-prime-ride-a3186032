import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const cartaoSchema = z.object({
  numero: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 13 && v.length <= 19, "Número do cartão inválido"),
  titular: z.string().trim().min(3).max(120),
  validade: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/?\d{2}$/, "Validade deve ser MM/AA"),
  cvv: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, "CVV inválido"),
  parcelas: z.number().int().min(1).max(12).default(1),
});

const cobrancaSchema = z.object({
  valor: z.number().positive().max(100000),
  metodo: z.enum(["pix", "credito", "debito", "cartao"]),
  descricao: z.string().trim().min(1).max(200),
  cliente: z
    .object({
      nome: z.string().trim().max(120).optional(),
      email: z.string().trim().email().max(255).optional(),
    })
    .optional(),
  cartao: cartaoSchema.optional(),
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

    const cartao = data.cartao;
    const [mes, ano] = cartao ? cartao.validade.replace("/", "").match(/.{1,2}/g)! : [];

    const resp = await fetch(`${base}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: Math.round(data.valor * 100),
        currency: "BRL",
        payment_method: data.metodo === "pix" ? "pix" : data.metodo === "debito" ? "debit_card" : "credit_card",
        description: data.descricao,
        customer: data.cliente,
        installments: cartao?.parcelas ?? 1,
        ...(cartao
          ? {
              card: {
                number: cartao.numero,
                holder_name: cartao.titular,
                exp_month: mes,
                exp_year: `20${ano}`,
                cvv: cartao.cvv,
              },
            }
          : {}),
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
