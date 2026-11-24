/**
 * Monta os recursos da Google Wallet API (classe e objeto) a partir dos dados do formulário.
 * Funções puras: sem rede, sem segredo. Rodam igual no servidor e nos testes.
 */
import {
  BARCODE_TYPES,
  MAX_FIELDS,
  PASS_TYPES,
  type BarcodeType,
  type PassField,
  type PassInput,
  type PassType,
} from "./types"

export class PassValidationError extends Error {}

export const LANGUAGE = "pt-BR"

type TypeApi = { classCollection: string; objectCollection: string; jwtClassesKey: string; jwtObjectsKey: string }

export const TYPE_API: Record<PassType, TypeApi> = {
  generic: {
    classCollection: "genericClass",
    objectCollection: "genericObject",
    jwtClassesKey: "genericClasses",
    jwtObjectsKey: "genericObjects",
  },
  eventTicket: {
    classCollection: "eventTicketClass",
    objectCollection: "eventTicketObject",
    jwtClassesKey: "eventTicketClasses",
    jwtObjectsKey: "eventTicketObjects",
  },
  loyalty: {
    classCollection: "loyaltyClass",
    objectCollection: "loyaltyObject",
    jwtClassesKey: "loyaltyClasses",
    jwtObjectsKey: "loyaltyObjects",
  },
  offer: {
    classCollection: "offerClass",
    objectCollection: "offerObject",
    jwtClassesKey: "offerClasses",
    jwtObjectsKey: "offerObjects",
  },
  giftCard: {
    classCollection: "giftCardClass",
    objectCollection: "giftCardObject",
    jwtClassesKey: "giftCardClasses",
    jwtObjectsKey: "giftCardObjects",
  },
}

const ISSUER_ID_PATTERN = /^\d{6,25}$/
const ID_SUFFIX_PATTERN = /^[A-Za-z0-9._-]{1,64}$/
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

export function assertIssuerId(issuerId: string): string {
  const value = issuerId.trim()
  if (!ISSUER_ID_PATTERN.test(value)) {
    throw new PassValidationError("O issuer ID deve conter apenas números (ex.: 3388000000012345678).")
  }
  return value
}

function text(value: unknown, name: string, max: number, required = false): string {
  if (typeof value !== "string") {
    if (required) throw new PassValidationError(`Preencha o campo "${name}".`)
    return ""
  }
  const trimmed = value.trim()
  if (required && !trimmed) throw new PassValidationError(`Preencha o campo "${name}".`)
  if (trimmed.length > max) throw new PassValidationError(`"${name}" aceita no máximo ${max} caracteres.`)
  return trimmed
}

function httpsUrl(value: unknown, name: string, required: boolean): string {
  const raw = text(value, name, 2000, required)
  if (!raw) return ""
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new PassValidationError(`"${name}" não é uma URL válida.`)
  }
  if (url.protocol !== "https:") {
    throw new PassValidationError(`"${name}" precisa ser uma URL pública com https://.`)
  }
  return url.toString()
}

/** Valida e normaliza o que veio do formulário. Lança PassValidationError com mensagem para a pessoa. */
export function normalizePassInput(raw: unknown): PassInput {
  if (!raw || typeof raw !== "object") throw new PassValidationError("Dados do passe inválidos.")
  const input = raw as Record<string, unknown>

  const type = input.type as PassType
  if (!PASS_TYPES.includes(type)) throw new PassValidationError("Tipo de passe inválido.")

  const barcodeType = (input.barcodeType ?? "QR_CODE") as BarcodeType
  if (!BARCODE_TYPES.includes(barcodeType)) throw new PassValidationError("Tipo de código inválido.")

  const classSuffix = text(input.classSuffix, "ID da classe", 64, true)
  if (!ID_SUFFIX_PATTERN.test(classSuffix)) {
    throw new PassValidationError('O ID da classe aceita apenas letras, números, ".", "_" e "-", sem espaços.')
  }

  const backgroundColor = text(input.backgroundColor, "Cor de fundo", 7, true)
  if (!HEX_COLOR_PATTERN.test(backgroundColor)) {
    throw new PassValidationError("A cor de fundo deve estar no formato #rrggbb.")
  }

  const amount = text(input.amount, "Valor", 12)
  if (amount && !/^\d+([.,]\d{1,2})?$/.test(amount)) {
    throw new PassValidationError("Pontos ou saldo devem ser um número (ex.: 150 ou 49,90).")
  }

  const rawFields = Array.isArray(input.fields) ? input.fields : []
  if (rawFields.length > MAX_FIELDS) {
    throw new PassValidationError(`O passe aceita no máximo ${MAX_FIELDS} campos extras.`)
  }
  const fields: PassField[] = rawFields
    .map((field) => {
      const item = (field ?? {}) as Record<string, unknown>
      return { label: text(item.label, "Nome do campo", 40), value: text(item.value, "Valor do campo", 200) }
    })
    .filter((field) => field.label && field.value)

  return {
    type,
    classSuffix,
    issuerName: text(input.issuerName, "Nome do emissor", 60, true),
    title: text(input.title, "Título", 80, true),
    header: text(input.header, "Texto principal", 80, true),
    subheader: text(input.subheader, "Subtítulo", 80),
    backgroundColor: backgroundColor.toLowerCase(),
    logoUrl: httpsUrl(input.logoUrl, "URL do logo", true),
    heroImageUrl: httpsUrl(input.heroImageUrl, "URL da imagem de destaque", false),
    barcodeType,
    barcodeValue: text(input.barcodeValue, "Valor do código", 500),
    amount,
    fields,
  }
}

const localized = (value: string) => ({ defaultValue: { language: LANGUAGE, value } })

const image = (uri: string, description: string) => ({
  sourceUri: { uri },
  contentDescription: localized(description),
})

const parseAmount = (amount: string) => Number(amount.replace(",", "."))

export type BuiltPass = {
  api: TypeApi
  classId: string
  objectId: string
  classResource: Record<string, unknown>
  objectResource: Record<string, unknown>
}

/**
 * Converte o formulário em classe (o "molde", compartilhado) e objeto (o passe de uma pessoa).
 * `objectSuffix` precisa ser único por passe emitido.
 */
export function buildPass(issuerId: string, pass: PassInput, objectSuffix: string): BuiltPass {
  const issuer = assertIssuerId(issuerId)
  if (!ID_SUFFIX_PATTERN.test(objectSuffix)) throw new PassValidationError("ID do objeto inválido.")

  const api = TYPE_API[pass.type]
  const classId = `${issuer}.${pass.classSuffix}`
  const objectId = `${issuer}.${objectSuffix}`
  const logo = image(pass.logoUrl, `Logo de ${pass.issuerName}`)

  const textModules = pass.fields.map((field, index) => ({
    id: `campo_${index + 1}`,
    header: field.label,
    body: field.value,
  }))

  // Comum a todos os objetos.
  const objectBase: Record<string, unknown> = {
    id: objectId,
    classId,
    state: "ACTIVE",
    hexBackgroundColor: pass.backgroundColor,
  }
  if (pass.heroImageUrl) objectBase.heroImage = image(pass.heroImageUrl, pass.title)
  if (pass.barcodeType !== "NONE") {
    const value = pass.barcodeValue || objectId
    objectBase.barcode = { type: pass.barcodeType, value, alternateText: value.slice(0, 40) }
  }

  // Nos tipos com layout próprio, subtítulo vira o primeiro campo de texto.
  const withSubheader = (label: string) =>
    pass.subheader ? [{ id: "subtitulo", header: label, body: pass.subheader }, ...textModules] : textModules

  // Classes que passam por revisão do Google exigem estes dois campos.
  const reviewedClass = { id: classId, issuerName: pass.issuerName, reviewStatus: "UNDER_REVIEW" }

  let classResource: Record<string, unknown>
  let objectResource: Record<string, unknown>

  switch (pass.type) {
    case "generic": {
      classResource = { id: classId }
      objectResource = {
        ...objectBase,
        cardTitle: localized(pass.title),
        header: localized(pass.header),
        logo,
        textModulesData: textModules,
      }
      if (pass.subheader) objectResource.subheader = localized(pass.subheader)
      break
    }
    case "eventTicket": {
      classResource = { ...reviewedClass, eventName: localized(pass.title), logo }
      objectResource = {
        ...objectBase,
        ticketHolderName: pass.header,
        textModulesData: withSubheader("Detalhes"),
      }
      break
    }
    case "loyalty": {
      classResource = { ...reviewedClass, programName: pass.title, programLogo: logo }
      objectResource = {
        ...objectBase,
        accountName: pass.header,
        accountId: pass.barcodeValue || objectSuffix,
        textModulesData: withSubheader("Categoria"),
      }
      if (pass.amount) {
        objectResource.loyaltyPoints = { label: "Pontos", balance: { int: Math.round(parseAmount(pass.amount)) } }
      }
      break
    }
    case "offer": {
      classResource = {
        ...reviewedClass,
        title: pass.title,
        provider: pass.issuerName,
        redemptionChannel: "BOTH",
        titleImage: logo,
      }
      objectResource = {
        ...objectBase,
        textModulesData: [{ id: "detalhe", header: "Oferta", body: pass.header }, ...withSubheader("Condições")],
      }
      break
    }
    case "giftCard": {
      classResource = { ...reviewedClass, merchantName: pass.title, programLogo: logo }
      objectResource = {
        ...objectBase,
        cardNumber: pass.header,
        textModulesData: withSubheader("Observação"),
      }
      if (pass.amount) {
        objectResource.balance = {
          micros: String(Math.round(parseAmount(pass.amount) * 1_000_000)),
          currencyCode: "BRL",
        }
      }
      break
    }
  }

  return { api, classId, objectId, classResource, objectResource }
}

/** Claims do JWT "Save to Google Wallet". A assinatura acontece no servidor, em outro módulo. */
export function buildSaveClaims(serviceAccountEmail: string, built: BuiltPass, origins: string[] = []) {
  return {
    iss: serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    origins,
    payload: { [built.api.jwtObjectsKey]: [built.objectResource] },
  }
}
