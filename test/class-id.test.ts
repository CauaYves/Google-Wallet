import { describe, expect, it } from "vitest"
import { defaultClassSuffix, parseClassTypeConflict, suggestClassSuffix } from "@/lib/wallet/class-id"
import { PASS_TYPES } from "@/lib/wallet/types"

const ID_SUFFIX_PATTERN = /^[A-Za-z0-9._-]{1,64}$/

describe("defaultClassSuffix", () => {
  it("dá um ID diferente e válido para cada tipo", () => {
    const suffixes = PASS_TYPES.map(defaultClassSuffix)
    expect(new Set(suffixes).size).toBe(PASS_TYPES.length)
    for (const suffix of suffixes) expect(suffix).toMatch(ID_SUFFIX_PATTERN)
  })
})

describe("suggestClassSuffix", () => {
  it("acrescenta o tipo a um ID sem tipo", () => {
    expect(suggestClassSuffix("titles_passes", "eventTicket")).toBe("titles_passes_ingresso")
  })

  it("troca o final de outro tipo", () => {
    expect(suggestClassSuffix("clube_generico", "loyalty")).toBe("clube_fidelidade")
    expect(suggestClassSuffix("passe_vale_presente", "offer")).toBe("passe_oferta")
    expect(suggestClassSuffix(defaultClassSuffix("generic"), "eventTicket")).toBe(defaultClassSuffix("eventTicket"))
  })

  it("mantém o ID que já termina com o tipo", () => {
    expect(suggestClassSuffix("clube_ingresso", "eventTicket")).toBe("clube_ingresso")
  })

  it("volta ao padrão quando o ID está vazio ou é só o tipo", () => {
    expect(suggestClassSuffix("", "offer")).toBe("passe_oferta")
    expect(suggestClassSuffix("generico", "offer")).toBe("passe_oferta")
  })

  it("respeita o limite de 64 caracteres", () => {
    const suggestion = suggestClassSuffix("a".repeat(64), "giftCard")
    expect(suggestion).toHaveLength(64)
    expect(suggestion.endsWith("_vale_presente")).toBe(true)
  })
})

describe("parseClassTypeConflict", () => {
  it("reconhece a mensagem do Google e o tipo que já existe", () => {
    const conflict = parseClassTypeConflict(
      "3388000000012345678.titles_passes class type is not eventTicketClass. Was: genericClass"
    )
    expect(conflict).toEqual({ existingType: "generic", existingLabel: "Genérico" })
  })

  it("mostra o nome do Google quando o tipo não é deste projeto", () => {
    expect(parseClassTypeConflict("x.y class type is not genericClass. Was: flightClass")).toEqual({
      existingType: undefined,
      existingLabel: "flight",
    })
  })

  it("ignora outras mensagens", () => {
    expect(parseClassTypeConflict("Invalid resource: image URL is not reachable")).toBeNull()
    expect(parseClassTypeConflict(undefined)).toBeNull()
  })
})
