import { describe, expect, it } from "vitest"
import {
  buildPass,
  buildSaveClaims,
  normalizePassInput,
  PassValidationError,
} from "@/lib/wallet/pass-builder"
import { PASS_TYPES, type PassInput } from "@/lib/wallet/types"

const ISSUER = "3388000000012345678"

const base: PassInput = {
  type: "generic",
  classSuffix: "carteirinha",
  issuerName: "Empresa Exemplo",
  title: "Carteirinha",
  header: "Maria Silva",
  subheader: "Plano Ouro",
  backgroundColor: "#1A73E8",
  logoUrl: "https://exemplo.com/logo.png",
  heroImageUrl: "",
  barcodeType: "QR_CODE",
  barcodeValue: "",
  amount: "",
  fields: [
    { label: "Validade", value: "31/12/2027" },
    { label: "", value: "ignorado" },
  ],
}

describe("normalizePassInput", () => {
  it("normaliza e descarta campos extras incompletos", () => {
    const pass = normalizePassInput(base)
    expect(pass.backgroundColor).toBe("#1a73e8")
    expect(pass.fields).toEqual([{ label: "Validade", value: "31/12/2027" }])
  })

  it.each([
    ["tipo desconhecido", { type: "boarding" }],
    ["ID de classe com espaço", { classSuffix: "minha classe" }],
    ["cor fora do formato", { backgroundColor: "azul" }],
    ["logo sem https", { logoUrl: "http://exemplo.com/logo.png" }],
    ["logo com esquema perigoso", { logoUrl: "javascript:alert(1)" }],
    ["título vazio", { title: "  " }],
    ["valor não numérico", { amount: "muito" }],
  ])("rejeita %s", (_name, override) => {
    expect(() => normalizePassInput({ ...base, ...override })).toThrow(PassValidationError)
  })

  it("rejeita campos extras demais", () => {
    const fields = Array.from({ length: 9 }, (_, i) => ({ label: `c${i}`, value: "v" }))
    expect(() => normalizePassInput({ ...base, fields })).toThrow(PassValidationError)
  })
})

describe("buildPass", () => {
  it("prefixa classe e objeto com o issuer ID", () => {
    const built = buildPass(ISSUER, normalizePassInput(base), "obj-1")
    expect(built.classId).toBe(`${ISSUER}.carteirinha`)
    expect(built.objectId).toBe(`${ISSUER}.obj-1`)
    expect(built.objectResource.classId).toBe(built.classId)
  })

  it("rejeita issuer ID que não é numérico", () => {
    expect(() => buildPass("abc", normalizePassInput(base), "obj-1")).toThrow(PassValidationError)
  })

  it("monta o passe genérico com título, cabeçalho e código", () => {
    const built = buildPass(ISSUER, normalizePassInput(base), "obj-1")
    expect(built.api.classCollection).toBe("genericClass")
    expect(built.classResource).toEqual({ id: built.classId })
    expect(built.objectResource).toMatchObject({
      cardTitle: { defaultValue: { language: "pt-BR", value: "Carteirinha" } },
      header: { defaultValue: { value: "Maria Silva" } },
      subheader: { defaultValue: { value: "Plano Ouro" } },
      hexBackgroundColor: "#1a73e8",
      barcode: { type: "QR_CODE", value: `${ISSUER}.obj-1` },
      textModulesData: [{ id: "campo_1", header: "Validade", body: "31/12/2027" }],
    })
    expect(built.objectResource.heroImage).toBeUndefined()
  })

  it("omite o código quando o tipo é NONE e usa o valor informado quando há", () => {
    const none = buildPass(ISSUER, normalizePassInput({ ...base, barcodeType: "NONE" }), "o")
    expect(none.objectResource.barcode).toBeUndefined()
    const custom = buildPass(ISSUER, normalizePassInput({ ...base, barcodeValue: "MAT-42" }), "o")
    expect(custom.objectResource.barcode).toMatchObject({ value: "MAT-42" })
  })

  it("monta ingresso, fidelidade, oferta e vale-presente com os campos de cada tipo", () => {
    const build = (override: Partial<PassInput>) =>
      buildPass(ISSUER, normalizePassInput({ ...base, ...override }), "o")

    const ticket = build({ type: "eventTicket" })
    expect(ticket.classResource).toMatchObject({
      issuerName: "Empresa Exemplo",
      reviewStatus: "UNDER_REVIEW",
      eventName: { defaultValue: { value: "Carteirinha" } },
    })
    expect(ticket.objectResource.ticketHolderName).toBe("Maria Silva")

    const loyalty = build({ type: "loyalty", amount: "150" })
    expect(loyalty.classResource).toMatchObject({ programName: "Carteirinha", reviewStatus: "UNDER_REVIEW" })
    expect(loyalty.objectResource).toMatchObject({
      accountName: "Maria Silva",
      loyaltyPoints: { balance: { int: 150 } },
    })

    const offer = build({ type: "offer" })
    expect(offer.classResource).toMatchObject({ title: "Carteirinha", provider: "Empresa Exemplo" })

    const gift = build({ type: "giftCard", amount: "49,90" })
    expect(gift.objectResource).toMatchObject({
      cardNumber: "Maria Silva",
      balance: { micros: "49900000", currencyCode: "BRL" },
    })
  })

  it("todo tipo tem classe, objeto ativo e chave de JWT próprios", () => {
    for (const type of PASS_TYPES) {
      const built = buildPass(ISSUER, normalizePassInput({ ...base, type }), "o")
      expect(built.objectResource.state).toBe("ACTIVE")
      const claims = buildSaveClaims("conta@projeto.iam.gserviceaccount.com", built)
      expect(claims).toMatchObject({ aud: "google", typ: "savetowallet" })
      expect(claims.payload[built.api.jwtObjectsKey]).toEqual([built.objectResource])
    }
  })
})
