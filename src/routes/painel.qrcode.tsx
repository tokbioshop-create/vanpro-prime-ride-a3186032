import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppScreen } from "@/components/AppScreen";
import { usePainel } from "@/data/painel";
import { publicarEmpresa } from "@/lib/empresa-publica";

export const Route = createFileRoute("/painel/qrcode")({
  head: () => ({ meta: [{ title: "QR Code da empresa — Painel VanPro" }, { name: "description", content: "QR Code público e exclusivo da sua empresa VanPro." }] }),
  component: PainelQr,
});

function PainelQr() {
  const { config } = usePainel();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [url, setUrl] = useState("");
  const [sincronizando, setSincronizando] = useState(true);

  useEffect(() => {
    let ativo = true;
    publicarEmpresa(config)
      .then(({ url: publicUrl }) => { if (ativo) setUrl(publicUrl); })
      .catch((error) => { if (ativo) toast.error(error instanceof Error ? error.message : "Não foi possível gerar o QR Code."); })
      .finally(() => { if (ativo) setSincronizando(false); });
    return () => { ativo = false; };
  }, [config]);

  function baixar() {
    if (!svgRef.current || !url) return;
    const svg = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `vanpro-qrcode-${config.empresa.sigla || "empresa"}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  }

  async function copiar() {
    if (!url) return;
    await navigator.clipboard?.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  async function compartilhar() {
    if (!url) return;
    try {
      if (navigator.share) await navigator.share({ title: config.empresa.nome, text: `Acesse ${config.empresa.nome} no VanPro`, url });
      else await copiar();
    } catch {
      // cancelamento do compartilhamento não é erro
    }
  }

  return (
    <AppScreen title="QR Code da empresa" subtitle="Página pública exclusiva da sua empresa" back="/painel">
      <div className="card-elevated flex flex-col items-center p-6">
        <div className="flex min-h-[252px] min-w-[252px] items-center justify-center rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-border">
          {url ? <QRCodeSVG ref={svgRef} value={url} size={220} level="H" bgColor="#ffffff" fgColor="#111827" includeMargin /> : <div className="px-8 text-center text-xs text-muted-foreground">{sincronizando ? "Gerando QR Code…" : "Não foi possível gerar o QR Code."}</div>}
        </div>

        <p className="mt-5 text-sm font-bold">{config.empresa.nome}</p>
        <p className="text-[11px] text-muted-foreground">Identificador público: e-mail da conta</p>

        {url ? <>
          <div className="mt-4 w-full rounded-xl bg-surface-2 p-3"><p className="break-all text-center text-xs font-semibold leading-relaxed text-foreground">{url}</p></div>
          <div className="mt-4 grid w-full grid-cols-3 gap-2">
            <button type="button" onClick={() => void copiar()} className="press card-elevated flex h-11 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold">{copiado ? <Check className="size-4" /> : <Copy className="size-4" />}{copiado ? "Copiado" : "Copiar"}</button>
            <button type="button" onClick={baixar} className="press card-elevated flex h-11 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold"><Download className="size-4" /> Baixar</button>
            <button type="button" onClick={() => void compartilhar()} className="press card-elevated flex h-11 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold"><Share2 className="size-4" /> Compartilhar</button>
          </div>
          <a href={url} target="_blank" rel="noreferrer" className="press bg-brand mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-primary-foreground shadow-[var(--shadow-brand)]"><ExternalLink className="size-4" /> Abrir página pública</a>
        </> : null}

        <p className="mt-3 text-center text-[10px] text-muted-foreground">{sincronizando ? "Identificando a conta e criando o endereço público…" : "QR Code atualizado automaticamente com os dados públicos da empresa."}</p>
      </div>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted-foreground">O QR Code abre somente a página pública da empresa. Ele não dá acesso ao painel administrativo.</p>
    </AppScreen>
  );
}
