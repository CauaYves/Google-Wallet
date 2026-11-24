import {
  GiftIcon,
  IdentificationCardIcon,
  StarIcon,
  TagIcon,
  TicketIcon,
} from "@phosphor-icons/react/dist/ssr"
import type * as React from "react"
import { GoToTabButton } from "@/components/app/studio-tabs"
import { PASS_TYPE_INFO, PASS_TYPES, type PassType } from "@/lib/wallet/types"

const TYPE_ICONS: Record<PassType, React.ReactNode> = {
  generic: <IdentificationCardIcon weight="fill" />,
  eventTicket: <TicketIcon weight="fill" />,
  loyalty: <StarIcon weight="fill" />,
  offer: <TagIcon weight="fill" />,
  giftCard: <GiftIcon weight="fill" />,
}

const FLOW = [
  {
    title: "Classe",
    text: "O molde do passe: nome do emissor, logo e o que é igual para todo mundo. Você cria uma vez e reaproveita.",
  },
  {
    title: "Objeto",
    text: "O passe de uma pessoa: nome, número, pontos, código. Cada pessoa recebe um objeto ligado à classe.",
  },
  {
    title: "Link assinado",
    text: "O servidor assina um JWT com a chave da conta de serviço. Esse JWT vira o link do botão Adicionar ao Google Wallet.",
  },
  {
    title: "Carteira",
    text: "A pessoa toca no botão, confirma e o passe fica salvo no celular, disponível mesmo sem internet.",
  },
]

const sectionTitle = "font-heading text-2xl font-semibold tracking-tight sm:text-3xl"

export function LearnSection() {
  return (
    <div className="flex flex-col gap-14 text-base">
      <section className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-3">
          <h2 className={sectionTitle}>Cinco tipos de passe</h2>
          <p className="max-w-[52ch] text-muted-foreground">
            Cada tipo tem um layout próprio no Google Wallet e campos pensados para o uso. Escolha o que mais
            se parece com o que você quer entregar. Na dúvida, comece pelo genérico.
          </p>
          <p className="max-w-[52ch] text-sm text-muted-foreground">
            A API também tem cartão de embarque e bilhete de transporte. Eles seguem a mesma lógica, mas não
            estão neste projeto.
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-border border-y">
          {PASS_TYPES.map((type) => {
            const info = PASS_TYPE_INFO[type]
            return (
              <li key={type} className="flex items-start gap-4 py-4">
                <span
                  className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm [&_svg]:size-5"
                  style={{ backgroundColor: `var(--pass-${type})`, color: "var(--pass-ink)" }}
                >
                  {TYPE_ICONS[type]}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h3 className="font-heading text-lg leading-snug font-semibold">{info.label}</h3>
                  <p>{info.description}</p>
                  <p className="text-sm text-muted-foreground">{info.examples}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className={sectionTitle}>Do seu servidor ao celular, em quatro passos</h2>
          <p className="max-w-[62ch] text-muted-foreground">
            Toda integração com a Google Wallet API segue a mesma ordem, seja qual for o tipo de passe.
          </p>
        </div>
        <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-highlight font-heading text-base font-semibold text-highlight-foreground tabular-nums">
                  {index + 1}
                </span>
                {/* O traço liga um passo ao seguinte. */}
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-x-12 gap-y-8 rounded-surface bg-muted p-6 sm:p-10 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">QR Code e código de barras</h2>
          <p className="text-muted-foreground">
            Todo passe pode levar um código: QR Code, Aztec, PDF417 ou Code 128. O valor é seu (matrícula,
            número do ingresso, cupom). Na portaria ou no caixa, o seu sistema lê o código e valida.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">O passe muda depois de salvo</h2>
          <p className="text-muted-foreground">
            Ele não é uma imagem parada. Pela API, você altera o objeto (saldo de pontos, assento, validade)
            ou a classe (logo, nome), e o passe muda no celular de quem já salvou. Também dá para enviar um
            aviso ou marcar o passe como expirado.
          </p>
        </div>
        <p className="text-sm text-muted-foreground md:col-span-2">
          Onde isso costuma ser usado: carteirinha de sócio ou de estudante, ingresso de evento, cartão de
          pontos, cupom de desconto, vale-presente, comprovante de reserva e crachá de visitante.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <GoToTabButton tab="credenciais">Preparar as credenciais</GoToTabButton>
        <GoToTabButton tab="criar" variant="outline" arrow={false}>
          Ir direto para o passe
        </GoToTabButton>
      </div>
    </div>
  )
}
