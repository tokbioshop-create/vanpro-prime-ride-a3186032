import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImageUp, QrCode, ScanLine, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppScreen } from "@/components/AppScreen";

export const Route = createFileRoute("/qrcode")({
  head: () => ({
    meta: [
      { title: "Ler QR Code — VanPro" },
      { name: "description", content: "Leia o QR Code de uma empresa VanPro e abra automaticamente sua página pública." },
    ],
  }),
  component: Scanner,
});

type DetectorResult = { rawValue?: string };
type Detector = { detect: (source: HTMLVideoElement | HTMLImageElement) => Promise<DetectorResult[]> };
type DetectorConstructor = new (options?: { formats: string[] }) => Detector;

function getDetectorConstructor() {
  return (globalThis as typeof globalThis & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
}

function publicPathFromQr(rawValue: string) {
  const value = rawValue.trim();
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/empresa\/(.+)$/i);
    return match ? decodeURIComponent(match[1]!) : null;
  } catch {
    return value.includes("@") ? value : null;
  }
}

function Scanner() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [lendo, setLendo] = useState(false);
  const [mensagem, setMensagem] = useState("Aponte a câmera para o QR Code da empresa");
  const [suportaCamera, setSuportaCamera] = useState(true);

  function pararCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLendo(false);
  }

  function abrirResultado(rawValue: string) {
    const id = publicPathFromQr(rawValue);
    if (!id) {
      setMensagem("Este QR Code não é um QR Code público do VanPro.");
      return;
    }
    pararCamera();
    navigate({ to: "/empresa/$id", params: { id } });
  }

  async function iniciarCamera() {
    const Detector = getDetectorConstructor();
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setSuportaCamera(false);
      setMensagem("Seu navegador não oferece leitor de QR pela câmera. Use a opção de imagem abaixo.");
      return;
    }

    try {
      setLendo(true);
      setMensagem("Procurando QR Code…");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const detector = new Detector({ formats: ["qr_code"] });
      const detectar = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          frameRef.current = requestAnimationFrame(() => void detectar());
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const raw = codes.find((code) => code.rawValue)?.rawValue;
          if (raw) {
            abrirResultado(raw);
            return;
          }
        } catch {
          // continua tentando até a câmera encontrar o código
        }
        frameRef.current = requestAnimationFrame(() => void detectar());
      };
      frameRef.current = requestAnimationFrame(() => void detectar());
    } catch {
      pararCamera();
      toast.error("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
      setMensagem("Permita o acesso à câmera para ler o QR Code.");
    }
  }

  async function lerImagem(file: File) {
    const Detector = getDetectorConstructor();
    if (!Detector) {
      toast.error("Seu navegador não possui um leitor de QR compatível.");
      return;
    }
    try {
      const src = URL.createObjectURL(file);
      const image = new Image();
      image.src = src;
      await image.decode();
      const detector = new Detector({ formats: ["qr_code"] });
      const codes = await detector.detect(image);
      URL.revokeObjectURL(src);
      const raw = codes.find((code) => code.rawValue)?.rawValue;
      if (raw) abrirResultado(raw);
      else toast.error("Não encontrei um QR Code nessa imagem.");
    } catch {
      toast.error("Não foi possível ler essa imagem.");
    }
  }

  useEffect(() => () => pararCamera(), []);

  return (
    <AppScreen title="Encontrar por QR Code" subtitle="Abra diretamente a página pública da empresa">
      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[19rem] overflow-hidden rounded-3xl bg-[oklch(0.12_0.03_265)] shadow-[var(--shadow-card)]">
        <video ref={videoRef} muted playsInline className={`absolute inset-0 size-full object-cover ${lendo ? "block" : "hidden"}`} />
        <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-border/60" />
        {["top-5 left-5 border-t-3 border-l-3 rounded-tl-xl", "top-5 right-5 border-t-3 border-r-3 rounded-tr-xl", "bottom-5 left-5 border-b-3 border-l-3 rounded-bl-xl", "bottom-5 right-5 border-b-3 border-r-3 rounded-br-xl"].map((c) => (
          <span key={c} className={`absolute size-12 border-primary ${c}`} />
        ))}
        {!lendo && <QrCode className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/25" />}
        {lendo && <span className="absolute inset-x-8 top-8 h-0.5 animate-[rise-in_1.4s_ease-in-out_infinite_alternate] bg-primary shadow-[0_0_20px_var(--primary)]" />}
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">{mensagem}</p>

      <button type="button" onClick={() => (lendo ? pararCamera() : void iniciarCamera())} className="press mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-base font-bold text-primary-foreground shadow-[var(--shadow-brand)]">
        <ScanLine className="size-5" />
        {lendo ? "Parar leitura" : "Escanear QR Code"}
      </button>

      <label className={`press mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border text-sm font-bold ${suportaCamera ? "" : "border-primary/30"}`}>
        <ImageUp className="size-4.5" /> Ler QR de uma imagem
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void lerImagem(file); e.currentTarget.value = ""; }} />
      </label>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Zap className="size-3.5 text-primary" /> Ao identificar o código, a página pública da empresa abre automaticamente.
      </p>
    </AppScreen>
  );
}
