/**
 * Configuração de marca. Nada de empresa específica fica no código: nome do app, emissor,
 * cores e imagens iniciais vêm de variáveis de ambiente (veja .env.example) e podem ser
 * alterados no formulário a cada passe.
 */
import type { PassInput } from "./wallet/types"

type Env = Record<string, string | undefined>

export type AppConfig = {
  appName: string
  defaults: Pick<PassInput, "issuerName" | "backgroundColor" | "logoUrl" | "heroImageUrl">
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

// Imagens públicas usadas nos exemplos oficiais da Google Wallet API. Troque pelas da sua marca.
const SAMPLE_LOGO = "https://farm4.staticflickr.com/3738/12440799783_3dc3c20606_b.jpg"
const SAMPLE_HERO = "https://farm4.staticflickr.com/3723/11177041115_6e6a3b6f49_o.jpg"

export function readAppConfig(env: Env = process.env): AppConfig {
  const color = env.WALLET_DEFAULT_BACKGROUND_COLOR?.trim() ?? ""
  return {
    appName: env.APP_NAME?.trim() || "Google Wallet Studio",
    defaults: {
      issuerName: env.WALLET_DEFAULT_ISSUER_NAME?.trim() || "Minha Empresa",
      backgroundColor: HEX_COLOR.test(color) ? color.toLowerCase() : "#1a73e8",
      logoUrl: env.WALLET_DEFAULT_LOGO_URL?.trim() || SAMPLE_LOGO,
      heroImageUrl: env.WALLET_DEFAULT_HERO_IMAGE_URL?.trim() ?? SAMPLE_HERO,
    },
  }
}
