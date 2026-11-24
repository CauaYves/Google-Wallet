"use server"

import { createHash, randomUUID } from "node:crypto"
import { headers } from "next/headers"
import { createRateLimiter } from "@/lib/rate-limit"
import {
  CredentialsError,
  readDemoCredentials,
  resolveOwnCredentials,
  type WalletCredentials,
} from "@/lib/wallet/credentials"
import { suggestClassSuffix } from "@/lib/wallet/class-id"
import { createSaveUrl, ensureClass, WalletApiError } from "@/lib/wallet/google"
import { buildPass, normalizePassInput, PassValidationError } from "@/lib/wallet/pass-builder"
import type { CreatePassRequest, CreatePassResult, PassInput } from "@/lib/wallet/types"

const demoLimitPerHour = Number(process.env.WALLET_DEMO_MAX_PER_HOUR) || 20
const allowDemoRequest = createRateLimiter(demoLimitPerHour, 60 * 60 * 1000)

/**
 * No modo demo o emissor é compartilhado por todos os visitantes. O ID da classe sai do
 * conteúdo dela: quem envia os mesmos dados reaproveita a classe, e ninguém sobrescreve a
 * classe de outra pessoa.
 */
function demoClassSuffix(pass: PassInput): string {
  const shared = [pass.type, pass.issuerName, pass.title, pass.logoUrl].join("\n")
  return `demo_${pass.type}_${createHash("sha256").update(shared).digest("hex").slice(0, 16)}`
}

/**
 * Cria (ou reaproveita) a classe e devolve o link "Adicionar ao Google Wallet".
 *
 * Segurança: as credenciais do modo "own" chegam por esta chamada, são usadas em memória e
 * descartadas ao final. Não são gravadas nem registradas em log, e nunca voltam na resposta.
 */
export async function createPassAction(request: CreatePassRequest): Promise<CreatePassResult> {
  // Guardado fora do try para sugerir outro ID quando o Google recusa o da pessoa.
  let ownPass: PassInput | undefined
  try {
    const mode = request?.mode
    if (mode !== "demo" && mode !== "own") {
      return { ok: false, error: "Escolha como quer usar as credenciais." }
    }

    let pass = normalizePassInput(request.pass)
    let credentials: WalletCredentials

    if (mode === "demo") {
      const demo = readDemoCredentials()
      if (!demo) {
        return {
          ok: false,
          error: "As credenciais de demonstração não estão configuradas neste servidor.",
          hint: 'Use "Minhas credenciais" ou defina as variáveis do .env.example.',
        }
      }
      const forwardedFor = (await headers()).get("x-forwarded-for")
      const visitor = forwardedFor?.split(",")[0]?.trim() || "local"
      if (!allowDemoRequest(visitor)) {
        return {
          ok: false,
          error: "Limite de passes de demonstração atingido.",
          hint: "Tente de novo mais tarde ou use as suas próprias credenciais.",
        }
      }
      credentials = demo
      pass = { ...pass, classSuffix: demoClassSuffix(pass) }
    } else {
      credentials = resolveOwnCredentials(request.credentials)
      ownPass = pass
    }

    const built = buildPass(credentials.issuerId, pass, randomUUID())
    const classStatus = await ensureClass(credentials, built, mode === "own")
    const saveUrl = createSaveUrl(credentials, built)

    return { ok: true, saveUrl, classId: built.classId, objectId: built.objectId, classStatus }
  } catch (error) {
    if (error instanceof PassValidationError || error instanceof CredentialsError) {
      return { ok: false, error: error.message }
    }
    if (error instanceof WalletApiError) {
      if (error.classTypeConflict && ownPass) {
        const suggestion = suggestClassSuffix(ownPass.classSuffix, ownPass.type)
        return {
          ok: false,
          error: error.message,
          hint: error.hint,
          // Sem sugestão quando ela seria o próprio ID recusado.
          suggestedClassSuffix: suggestion === ownPass.classSuffix ? undefined : suggestion,
        }
      }
      return { ok: false, error: error.message, hint: error.hint }
    }
    // Nunca registre `request` aqui: no modo "own" ele contém a chave privada de quem enviou.
    console.error("Erro inesperado ao criar passe:", error instanceof Error ? error.name : "desconhecido")
    return { ok: false, error: "Erro inesperado no servidor. Tente novamente." }
  }
}
