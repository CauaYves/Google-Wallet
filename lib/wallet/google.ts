/**
 * Chamadas à Google Wallet API e assinatura do link "Adicionar ao Google Wallet".
 * Só roda no servidor: é o único lugar que toca na chave privada.
 */
import "server-only"
import { JWT } from "google-auth-library"
import jwt from "jsonwebtoken"
import type { WalletCredentials } from "./credentials"
import { buildSaveClaims, type BuiltPass } from "./pass-builder"

const API_BASE = "https://walletobjects.googleapis.com/walletobjects/v1"
const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer"
const SAVE_URL_BASE = "https://pay.google.com/gp/v/save/"

export class WalletApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly hint?: string
  ) {
    super(message)
  }
}

type GaxiosLikeError = {
  response?: { status?: number; data?: { error?: { message?: string } | string; error_description?: string } }
  message?: string
}

function toWalletApiError(error: unknown): WalletApiError {
  const err = error as GaxiosLikeError
  const status = err.response?.status ?? 0
  const data = err.response?.data
  const apiError = data?.error
  const googleMessage =
    (typeof apiError === "object" ? apiError?.message : undefined) ??
    data?.error_description ??
    (typeof apiError === "string" ? apiError : undefined)

  // Erro do endpoint de token (OAuth), ex.: "invalid_grant": a conta de serviço não autenticou.
  if (typeof apiError === "string") {
    return new WalletApiError(
      "Não foi possível autenticar com a conta de serviço.",
      status,
      "Verifique se a chave pertence a uma conta de serviço ativa e se o relógio do servidor está correto."
    )
  }
  if (status === 401 || status === 403) {
    return new WalletApiError(
      "O Google recusou a credencial.",
      status,
      "Confira se a Google Wallet API está habilitada no projeto e se o e-mail da conta de serviço foi adicionado em Usuários no Google Pay & Wallet Console com acesso de desenvolvedor ou administrador."
    )
  }
  if (status === 404) {
    return new WalletApiError(
      "O Google não encontrou o emissor.",
      status,
      "Confira se o issuer ID está correto e pertence à mesma conta em que a conta de serviço foi autorizada."
    )
  }
  if (status === 400) {
    return new WalletApiError(
      `O Google rejeitou os dados do passe${googleMessage ? `: ${googleMessage}` : "."}`,
      status,
      "Verifique se as URLs de imagem são públicas e se os campos obrigatórios foram preenchidos."
    )
  }
  if (!status) {
    // Falha antes de chegar à API: quase sempre chave privada inválida ou sem rede.
    return new WalletApiError(
      "Não foi possível autenticar com a conta de serviço.",
      0,
      "Verifique se a chave privada está completa e se a conta de serviço não foi excluída ou desativada."
    )
  }
  return new WalletApiError("A Google Wallet API retornou um erro inesperado.", status, googleMessage)
}

export type ClassStatus = "created" | "updated" | "reused"

/**
 * Garante que a classe existe. Se já existir e `updateExisting` for true, aplica os dados
 * atuais com PATCH; caso contrário, reaproveita a classe como está.
 */
export async function ensureClass(
  credentials: WalletCredentials,
  built: BuiltPass,
  updateExisting: boolean
): Promise<ClassStatus> {
  const client = new JWT({ email: credentials.clientEmail, key: credentials.privateKey, scopes: [SCOPE] })
  const collectionUrl = `${API_BASE}/${built.api.classCollection}`

  try {
    await client.request({ url: collectionUrl, method: "POST", data: built.classResource })
    return "created"
  } catch (error) {
    if ((error as GaxiosLikeError).response?.status !== 409) throw toWalletApiError(error)
  }

  if (!updateExisting) return "reused"

  try {
    await client.request({
      url: `${collectionUrl}/${encodeURIComponent(built.classId)}`,
      method: "PATCH",
      data: built.classResource,
    })
    return "updated"
  } catch (error) {
    throw toWalletApiError(error)
  }
}

/** Assina o JWT com a chave da conta de serviço e devolve o link de salvamento. */
export function createSaveUrl(credentials: WalletCredentials, built: BuiltPass, origins: string[] = []): string {
  const claims = buildSaveClaims(credentials.clientEmail, built, origins)
  let token: string
  try {
    token = jwt.sign(claims, credentials.privateKey, { algorithm: "RS256" })
  } catch {
    throw new WalletApiError(
      "Não foi possível assinar o passe com a chave privada informada.",
      0,
      "Confira se o JSON da conta de serviço foi colado inteiro e sem alterações."
    )
  }
  return `${SAVE_URL_BASE}${token}`
}
