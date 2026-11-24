/**
 * ID da classe por tipo de passe.
 *
 * No Google Wallet, o ID de uma classe é único no emissor inteiro, e não por tipo: se
 * `meu_passe` já existe como passe genérico, não dá para criar um ingresso com o mesmo ID.
 * Por isso o ID sugerido pelo app sempre termina com o tipo do passe.
 *
 * Funções puras: rodam no navegador, no servidor e nos testes.
 */
import { PASS_TYPE_INFO, PASS_TYPES, type PassType } from "./types"

const MAX_SUFFIX_LENGTH = 64

/** Final do ID de classe para cada tipo, como em `passe_ingresso`. */
export const CLASS_ID_SLUGS: Record<PassType, string> = {
  generic: "generico",
  eventTicket: "ingresso",
  loyalty: "fidelidade",
  offer: "oferta",
  giftCard: "vale_presente",
}

/** ID de classe que o formulário sugere para um tipo de passe. */
export function defaultClassSuffix(type: PassType): string {
  return `passe_${CLASS_ID_SLUGS[type]}`
}

/**
 * Adapta um ID de classe a um tipo: troca o final de outro tipo pelo deste, ou acrescenta o
 * final quando não há nenhum. `carteirinha` com ingresso vira `carteirinha_ingresso`, e
 * `clube_generico` com fidelidade vira `clube_fidelidade`.
 */
export function suggestClassSuffix(suffix: string, type: PassType): string {
  const slug = CLASS_ID_SLUGS[type]
  let base = suffix.trim()
  for (const other of Object.values(CLASS_ID_SLUGS)) {
    if (base === other) {
      base = ""
      break
    }
    if (base.endsWith(`_${other}`)) {
      base = base.slice(0, -other.length - 1)
      break
    }
  }
  if (!base) return defaultClassSuffix(type)
  return `${base.slice(0, MAX_SUFFIX_LENGTH - slug.length - 1)}_${slug}`
}

export type ClassTypeConflict = {
  /** Tipo que a classe já tem no emissor, quando é um dos tipos deste projeto. */
  existingType?: PassType
  /** Nome do tipo existente para mostrar à pessoa (ex.: "Genérico"). */
  existingLabel: string
}

/**
 * Reconhece a resposta do Google para um ID de classe que já existe com outro tipo, como
 * "3388000000012345678.meu_passe class type is not eventTicketClass. Was: genericClass".
 * Devolve null para qualquer outra mensagem.
 */
export function parseClassTypeConflict(message: string | undefined): ClassTypeConflict | null {
  const match = /class type is not \w+\.\s*Was:\s*(\w+)/i.exec(message ?? "")
  if (!match) return null
  const existingName = match[1].replace(/Class$/i, "")
  const existingType = PASS_TYPES.find((type) => type.toLowerCase() === existingName.toLowerCase())
  return {
    existingType,
    existingLabel: existingType ? PASS_TYPE_INFO[existingType].label : existingName,
  }
}
