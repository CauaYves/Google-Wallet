import { describe, expect, it } from "vitest"
import {
  CredentialsError,
  isDemoAvailable,
  parseServiceAccountJson,
  readDemoCredentials,
  resolveOwnCredentials,
} from "@/lib/wallet/credentials"

// Chave falsa: só o formato importa nestes testes.
const FAKE_KEY = "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----\n"
const EMAIL = "emissor@projeto-teste.iam.gserviceaccount.com"
const ISSUER = "3388000000012345678"
const json = (override: Record<string, unknown> = {}) =>
  JSON.stringify({ type: "service_account", client_email: EMAIL, private_key: FAKE_KEY, ...override })

describe("parseServiceAccountJson", () => {
  it("extrai e-mail e chave", () => {
    expect(parseServiceAccountJson(json())).toEqual({ clientEmail: EMAIL, privateKey: FAKE_KEY })
  })

  it.each([
    ["vazio", ""],
    ["não é JSON", "isto não é json"],
    ["tipo errado", json({ type: "authorized_user" })],
    ["e-mail de pessoa", json({ client_email: "alguem@gmail.com" })],
    ["sem chave", json({ private_key: undefined })],
    ["grande demais", json({ extra: "x".repeat(20_000) })],
  ])("rejeita %s", (_name, value) => {
    expect(() => parseServiceAccountJson(value)).toThrow(CredentialsError)
  })

  it("não repete a chave na mensagem de erro", () => {
    let message = ""
    try {
      parseServiceAccountJson(json({ type: "outro" }))
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).not.toBe("")
    expect(message).not.toContain("AAAA")
  })
})

describe("resolveOwnCredentials", () => {
  it("exige issuer ID numérico", () => {
    expect(() => resolveOwnCredentials({ issuerId: "abc", serviceAccountJson: json() })).toThrow(CredentialsError)
    expect(() => resolveOwnCredentials(undefined)).toThrow(CredentialsError)
  })

  it("devolve as credenciais informadas", () => {
    expect(resolveOwnCredentials({ issuerId: ` ${ISSUER} `, serviceAccountJson: json() })).toEqual({
      issuerId: ISSUER,
      clientEmail: EMAIL,
      privateKey: FAKE_KEY,
    })
  })
})

describe("readDemoCredentials", () => {
  it("fica indisponível sem variáveis de ambiente", () => {
    expect(readDemoCredentials({})).toBeNull()
    expect(isDemoAvailable({ GOOGLE_WALLET_ISSUER_ID: ISSUER })).toBe(false)
  })

  it("lê e-mail e chave, convertendo \\n literal", () => {
    const demo = readDemoCredentials({
      GOOGLE_WALLET_ISSUER_ID: ISSUER,
      GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL: EMAIL,
      GOOGLE_WALLET_PRIVATE_KEY: FAKE_KEY.replace(/\n/g, "\\n"),
    })
    expect(demo).toEqual({ issuerId: ISSUER, clientEmail: EMAIL, privateKey: FAKE_KEY })
  })

  it("lê o JSON inteiro da conta de serviço", () => {
    const demo = readDemoCredentials({
      GOOGLE_WALLET_ISSUER_ID: ISSUER,
      GOOGLE_WALLET_SERVICE_ACCOUNT_JSON: json(),
    })
    expect(demo?.clientEmail).toBe(EMAIL)
  })
})
