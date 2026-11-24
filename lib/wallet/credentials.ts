/**
 * Resolução das credenciais do Google Wallet. Só roda no servidor.
 *
 * - Modo "demo": lê issuer ID e conta de serviço das variáveis de ambiente.
 * - Modo "own": usa o que a pessoa enviou nesta requisição. Nada é gravado em disco, banco,
 *   cookie, cache ou log: os valores vivem só na memória durante a chamada.
 */
import "server-only"
import { assertIssuerId, PassValidationError } from "./pass-builder"
import type { OwnCredentialsInput } from "./types"

export type WalletCredentials = {
  issuerId: string
  clientEmail: string
  privateKey: string
}

export class CredentialsError extends Error {}

const MAX_JSON_LENGTH = 10_000

function assertKeyPair(clientEmail: unknown, privateKey: unknown): { clientEmail: string; privateKey: string } {
  if (typeof clientEmail !== "string" || !/^[^@\s]+@[^@\s]+\.gserviceaccount\.com$/.test(clientEmail.trim())) {
    throw new CredentialsError(
      'O campo "client_email" não parece ser de uma conta de serviço (termina em .gserviceaccount.com).'
    )
  }
  if (typeof privateKey !== "string" || !privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new CredentialsError('O campo "private_key" está ausente ou não é uma chave privada PEM.')
  }
  return { clientEmail: clientEmail.trim(), privateKey }
}

/** Lê o JSON da chave da conta de serviço. A mensagem de erro nunca inclui o conteúdo recebido. */
export function parseServiceAccountJson(json: string): { clientEmail: string; privateKey: string } {
  if (typeof json !== "string" || !json.trim()) {
    throw new CredentialsError("Cole o conteúdo do arquivo JSON da conta de serviço.")
  }
  if (json.length > MAX_JSON_LENGTH) {
    throw new CredentialsError("O JSON da conta de serviço é maior do que o esperado.")
  }
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new CredentialsError("O conteúdo colado não é um JSON válido. Cole o arquivo inteiro, sem alterar.")
  }
  if (!parsed || typeof parsed !== "object" || parsed.type !== "service_account") {
    throw new CredentialsError('O JSON precisa ser a chave de uma conta de serviço ("type": "service_account").')
  }
  return assertKeyPair(parsed.client_email, parsed.private_key)
}

export function resolveOwnCredentials(input: OwnCredentialsInput | undefined): WalletCredentials {
  if (!input) throw new CredentialsError("Informe o issuer ID e a conta de serviço.")
  let issuerId: string
  try {
    issuerId = assertIssuerId(String(input.issuerId ?? ""))
  } catch (error) {
    throw new CredentialsError(error instanceof PassValidationError ? error.message : "Issuer ID inválido.")
  }
  return { issuerId, ...parseServiceAccountJson(input.serviceAccountJson) }
}

type Env = Record<string, string | undefined>

/**
 * Credenciais de demonstração, vindas do ambiente do servidor. Aceita dois formatos:
 * GOOGLE_WALLET_SERVICE_ACCOUNT_JSON (o arquivo inteiro em uma linha) ou o par
 * GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL + GOOGLE_WALLET_PRIVATE_KEY.
 * Retorna null quando o modo demo não está configurado.
 */
export function readDemoCredentials(env: Env = process.env): WalletCredentials | null {
  const issuerId = env.GOOGLE_WALLET_ISSUER_ID?.trim()
  if (!issuerId) return null

  try {
    const json = env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON?.trim()
    const pair = json
      ? parseServiceAccountJson(json)
      : assertKeyPair(
          env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
          // Em arquivos .env a chave costuma vir em uma linha, com "\n" literal.
          env.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, "\n")
        )
    return { issuerId: assertIssuerId(issuerId), ...pair }
  } catch {
    return null
  }
}

export function isDemoAvailable(env: Env = process.env): boolean {
  return readDemoCredentials(env) !== null
}
