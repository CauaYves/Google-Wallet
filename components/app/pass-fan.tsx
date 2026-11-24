import type * as React from "react"
import { PASS_TYPE_INFO, type PassType } from "@/lib/wallet/types"

type FanPass = {
  type: PassType
  issuer: string
  title: string
  detail: string
  /** Posição no leque: deslocamento em % do próprio passe e rotação em graus. */
  x: number
  y: number
  r: number
}

// Do fundo para a frente. Os textos são exemplos, sem marca nenhuma.
const PASSES: FanPass[] = [
  { type: "giftCard", issuer: "Livraria da Praça", title: "Vale-presente", detail: "Saldo R$ 150,00", x: -62, y: 6, r: -16 },
  { type: "offer", issuer: "Café do Centro", title: "2 por 1 no espresso", detail: "Até 30/06", x: -32, y: -3, r: -8 },
  { type: "loyalty", issuer: "Clube de Vantagens", title: "1.240 pontos", detail: "Nível ouro", x: 0, y: -6, r: 0 },
  { type: "eventTicket", issuer: "Festival de Inverno", title: "Pista, lote 2", detail: "Portão B", x: 32, y: -3, r: 8 },
  { type: "generic", issuer: "Academia Central", title: "Marina Duarte", detail: "Sócia desde 2021", x: 62, y: 6, r: 16 },
]

/** Desenho simples de um código, só para a ilustração. */
function CodeGlyph() {
  return (
    <svg viewBox="0 0 28 28" className="size-full" aria-hidden="true" fill="currentColor">
      <path d="M2 2h9v9H2zM4.5 4.5v4h4v-4zM17 2h9v9h-9zm2.5 2.5v4h4v-4zM2 17h9v9H2zm2.5 2.5v4h4v-4zM13 2h2v5h-2zM13 9h2v2h-2zM2 13h5v2H2zM9 13h6v2H9zM17 13h2v2h-2zM21 13h5v2h-5zM13 17h2v4h-2zM17 17h4v4h-4zM23 17h3v2h-3zM13 23h4v3h-4zM19 23h2v3h-2zM23 21h3v5h-3z" />
    </svg>
  )
}

/**
 * Leque com um passe de cada tipo, para o topo da página. É ilustração: fica fora da leitura
 * de tela, que já recebe a mesma informação no texto e na lista de tipos.
 */
export function PassFan({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <div className="pass-fan relative mx-auto aspect-[5/8] w-[38%] max-w-44">
        {PASSES.map((pass, index) => (
          <div
            key={pass.type}
            className="absolute inset-0 flex flex-col rounded-[1.1rem] p-[9%] shadow-lg ring-1 shadow-black/20 ring-white/15 ring-inset"
            style={
              {
                backgroundColor: `var(--pass-${pass.type})`,
                color: "var(--pass-ink)",
                "--fan-x": `${pass.x}%`,
                "--fan-y": `${pass.y}%`,
                "--fan-r": `${pass.r}deg`,
                "--fan-i": index,
              } as React.CSSProperties
            }
          >
            <span className="truncate text-[0.6rem] font-medium opacity-85">{pass.issuer}</span>
            <span className="mt-[18%] text-[0.6rem] opacity-75">{PASS_TYPE_INFO[pass.type].label}</span>
            <span className="font-heading text-sm leading-tight font-semibold text-balance">{pass.title}</span>
            <span className="mt-1 text-[0.6rem] opacity-75">{pass.detail}</span>
            <span className="mt-auto w-[46%] self-center rounded-md bg-white p-[5%] text-neutral-900">
              <CodeGlyph />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
