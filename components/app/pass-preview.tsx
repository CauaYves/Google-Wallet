"use client"

import { BarcodeIcon, QrCodeIcon } from "@phosphor-icons/react"
import * as React from "react"
import { QrCode } from "@/components/mosaico/qr-code"
import { PASS_TYPE_INFO, type PassInput } from "@/lib/wallet/types"

/** Escolhe texto claro ou escuro conforme a luminância da cor de fundo (WCAG). */
function readableTextColor(hex: string): string {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) return "#ffffff"
  const [r, g, b] = match.slice(1).map((channel) => {
    const value = parseInt(channel, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.4 ? "#0a0a0a" : "#ffffff"
}

const isHttps = (url: string) => url.startsWith("https://")

/** Imagem do passe. Se a URL não carregar, mostra o `fallback` em vez do ícone de imagem quebrada. */
function PassImage({ src, className, fallback = null }: { src: string; className: string; fallback?: React.ReactNode }) {
  const [failedSrc, setFailedSrc] = React.useState("")
  if (!isHttps(src) || failedSrc === src) return fallback
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL informada pela pessoa, de qualquer domínio
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setFailedSrc(src)}
      // A imagem pode falhar antes de a página hidratar, quando o onError ainda não existe.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailedSrc(src)
      }}
    />
  )
}

/**
 * Prévia aproximada do passe. As cores vêm do formulário (são dados do passe, não do tema),
 * por isso entram por `style`. O layout final é do Google Wallet e varia por tipo.
 */
export function PassPreview({ pass }: { pass: PassInput }) {
  const info = PASS_TYPE_INFO[pass.type]
  const color = readableTextColor(pass.backgroundColor)
  const fields = pass.fields.filter((field) => field.label && field.value)

  return (
    <div
      className="flex w-full max-w-xs flex-col overflow-hidden rounded-surface shadow-lg ring-1 shadow-black/15 ring-foreground/10"
      style={{ backgroundColor: pass.backgroundColor, color }}
      role="img"
      aria-label={`Prévia do passe ${pass.title || info.label}`}
    >
      <div className="flex items-center gap-3 px-5 pt-5">
        <PassImage
          src={pass.logoUrl}
          className="size-8 shrink-0 rounded-full bg-white object-cover"
          fallback={<span className="size-8 shrink-0 rounded-full bg-white/30" />}
        />
        <span className="truncate text-sm font-medium">{pass.issuerName || "Nome do emissor"}</span>
      </div>

      <div className="flex flex-col gap-1 px-5 py-4">
        <span className="text-xs opacity-80">{pass.title || info.titleLabel}</span>
        <span className="text-xl leading-tight font-semibold break-words">{pass.header || info.headerLabel}</span>
        {pass.subheader && <span className="text-sm opacity-80">{pass.subheader}</span>}
        {pass.amount && info.amountLabel && (
          <span className="mt-1 text-sm">
            {info.amountLabel}: <strong>{pass.amount}</strong>
          </span>
        )}
      </div>

      {fields.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 px-5 pb-4">
          {fields.map((field, index) => (
            <div key={index} className="flex min-w-0 flex-col">
              <dt className="truncate text-xs opacity-80">{field.label}</dt>
              <dd className="truncate text-sm font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {pass.barcodeType !== "NONE" && (
        <div className="flex justify-center px-5 pb-5">
          {/* O código fica escuro sobre branco nos dois temas, como no passe de verdade. */}
          <div className="flex flex-col items-center gap-1 rounded-item bg-white p-3 text-neutral-900">
            {pass.barcodeType === "QR_CODE" ? (
              <QrCode
                value={pass.barcodeValue || "ID do passe"}
                label="Exemplo de QR Code do passe"
                size={88}
                className="rounded-none p-0 ring-0"
              />
            ) : pass.barcodeType === "AZTEC" ? (
              <QrCodeIcon className="size-20" />
            ) : (
              <BarcodeIcon className="h-14 w-32" preserveAspectRatio="none" />
            )}
            <span className="max-w-40 truncate text-[0.7rem]">{pass.barcodeValue || "ID do passe"}</span>
          </div>
        </div>
      )}

      <PassImage src={pass.heroImageUrl} className="h-24 w-full object-cover" />
    </div>
  )
}
