"use client"

// Cliente porque Accordion e Badge do Mosaico usam APIs de cliente sem declarar "use client".
import {
  ArrowsClockwiseIcon,
  CreditCardIcon,
  GiftIcon,
  IdentificationCardIcon,
  QrCodeIcon,
  StarIcon,
  TagIcon,
  TicketIcon,
} from "@phosphor-icons/react"
import type * as React from "react"
import { GoToTabButton } from "@/components/app/studio-tabs"
import { Badge } from "@/components/mosaico/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/mosaico/card"
import { PASS_TYPE_INFO, PASS_TYPES, type PassType } from "@/lib/wallet/types"

const TYPE_ICONS: Record<PassType, React.ReactNode> = {
  generic: <IdentificationCardIcon />,
  eventTicket: <TicketIcon />,
  loyalty: <StarIcon />,
  offer: <TagIcon />,
  giftCard: <GiftIcon />,
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

export function LearnSection() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">O que é o Google Wallet</h2>
        <p className="max-w-[70ch] text-muted-foreground">
          É a carteira digital do Android. Além de cartões de pagamento, ela guarda <strong>passes</strong>:
          ingressos, carteirinhas, cartões de fidelidade, cupons e vales-presente. Com a Google Wallet API, a sua
          empresa emite esses passes e entrega por um botão ou link, no site, no app ou por e-mail. Quem recebe
          não precisa instalar nada.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-semibold">Tipos de passe</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PASS_TYPES.map((type) => {
            const info = PASS_TYPE_INFO[type]
            return (
              <Card key={type} size="sm">
                <CardHeader>
                  <span className="text-muted-foreground [&_svg]:size-6">{TYPE_ICONS[type]}</span>
                  <CardTitle>{info.label}</CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{info.examples}</CardContent>
              </Card>
            )
          })}
          <Card size="sm">
            <CardHeader>
              <span className="text-muted-foreground [&_svg]:size-6">
                <CreditCardIcon />
              </span>
              <CardTitle>Outros tipos</CardTitle>
              <CardDescription>A API também tem cartão de embarque e bilhete de transporte.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Eles seguem a mesma lógica de classe e objeto, mas não estão neste projeto.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <span className="text-muted-foreground [&_svg]:size-6">
              <QrCodeIcon />
            </span>
            <CardTitle>QR Code e código de barras</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Todo passe pode levar um código: QR Code, Aztec, PDF417 ou Code 128. O valor é seu (matrícula, número
            do ingresso, cupom). Na portaria ou no caixa, o seu sistema lê o código e valida.
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <span className="text-muted-foreground [&_svg]:size-6">
              <ArrowsClockwiseIcon />
            </span>
            <CardTitle>Atualização do passe</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            O passe não é uma imagem parada. Pela API, você altera o objeto (saldo de pontos, assento, validade)
            ou a classe (logo, nome), e o passe muda no celular de quem já salvou. Também dá para enviar um aviso
            ou marcar o passe como expirado.
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-lg font-semibold">Como a integração funciona</h3>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2 rounded-surface bg-muted p-5">
              <Badge variant="outline" className="self-start bg-background">
                {index + 1}
              </Badge>
              <span className="font-medium">{step.title}</span>
              <span className="text-sm text-muted-foreground">{step.text}</span>
            </li>
          ))}
        </ol>
        <p className="max-w-[70ch] text-sm text-muted-foreground">
          Casos de uso comuns: carteirinha de sócio ou de estudante, ingresso de evento, cartão de pontos, cupom
          de desconto, vale-presente, comprovante de reserva e crachá de visitante.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <GoToTabButton tab="credenciais">Preparar as credenciais</GoToTabButton>
        <GoToTabButton tab="criar" variant="outline">
          Ir direto para o passe
        </GoToTabButton>
      </div>
    </div>
  )
}
