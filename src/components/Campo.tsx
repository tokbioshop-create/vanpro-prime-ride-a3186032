import type { CSSProperties, ReactNode } from "react";

/**
 * Caixa de texto posicionada sobre o protótipo.
 * Cobre o texto fixo da imagem e mostra a informação real preenchida no app.
 */
export function Campo({
  left,
  top,
  width,
  height,
  bg,
  align = "left",
  children,
  style,
  className = "",
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  bg: string;
  align?: "left" | "right" | "center";
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      aria-hidden={false}
      className={`pointer-events-none absolute flex flex-col justify-center overflow-hidden leading-tight ${className}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        background: bg,
        alignItems: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
