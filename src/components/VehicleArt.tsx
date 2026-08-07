export type VeiculoArtTipo = "van" | "micro" | "onibus";

const bodies: Record<
  VeiculoArtTipo,
  { width: number; windows: number; wheels: [number, number]; nose: number }
> = {
  van: { width: 120, windows: 3, wheels: [34, 100], nose: 26 },
  micro: { width: 150, windows: 5, wheels: [38, 128], nose: 18 },
  onibus: { width: 180, windows: 7, wheels: [42, 156], nose: 10 },
};

/** Ilustração lateral do veículo, sem fundo. */
export function VehicleArt({
  tipo,
  className = "",
}: {
  tipo: VeiculoArtTipo;
  className?: string;
}) {
  const b = bodies[tipo];
  const H = 64;
  const bodyTop = 8;
  const bodyBottom = 46;
  const winW = (b.width - b.nose - 22) / b.windows;

  return (
    <svg
      viewBox={`0 0 ${b.width + 8} ${H}`}
      className={className}
      fill="none"
      role="img"
      aria-label={
        tipo === "van" ? "Van executiva" : tipo === "micro" ? "Micro-ônibus executivo" : "Ônibus executivo"
      }
    >
      {/* carroceria */}
      <path
        d={`M6 ${bodyBottom} V${bodyTop + 8} a8 8 0 0 1 8 -8 H${b.width - b.nose} l${b.nose} ${
          tipo === "van" ? 14 : 10
        } a6 6 0 0 1 2 4 V${bodyBottom} a4 4 0 0 1 -4 4 H10 a4 4 0 0 1 -4 -4 Z`}
        fill="var(--primary)"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* faixa dourada */}
      <rect x="6" y={bodyBottom - 9} width={b.width - 2} height="4" rx="2" fill="var(--gold)" />
      {/* janelas */}
      {Array.from({ length: b.windows }).map((_, i) => (
        <rect
          key={i}
          x={14 + i * winW}
          y={bodyTop + 5}
          width={winW - 5}
          height="15"
          rx="3"
          fill="oklch(1 0 0 / 0.9)"
        />
      ))}
      {/* para-brisa */}
      <path
        d={`M${b.width - b.nose + 1} ${bodyTop + 5} h${b.nose - 4} l3 ${tipo === "van" ? 12 : 9} h-${
          b.nose - 1
        } Z`}
        fill="oklch(1 0 0 / 0.9)"
      />
      {/* rodas */}
      {b.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={bodyBottom + 5} r="8" fill="var(--navy)" />
          <circle cx={cx} cy={bodyBottom + 5} r="3.2" fill="oklch(1 0 0 / 0.9)" />
        </g>
      ))}
      {/* solo */}
      <rect x="4" y={bodyBottom + 13} width={b.width} height="2.5" rx="1.25" fill="var(--gold)" opacity="0.35" />
    </svg>
  );
}
