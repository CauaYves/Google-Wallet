/**
 * Tipos e metadados compartilhados entre a interface e o servidor.
 * Este arquivo não pode importar nada que dependa de segredo ou de Node.
 */

export const PASS_TYPES = ["generic", "eventTicket", "loyalty", "offer", "giftCard"] as const
export type PassType = (typeof PASS_TYPES)[number]

export const BARCODE_TYPES = ["QR_CODE", "CODE_128", "PDF_417", "AZTEC", "NONE"] as const
export type BarcodeType = (typeof BARCODE_TYPES)[number]

export const BARCODE_LABELS: Record<BarcodeType, string> = {
  QR_CODE: "QR Code",
  CODE_128: "Código de barras (Code 128)",
  PDF_417: "PDF417",
  AZTEC: "Aztec",
  NONE: "Sem código",
}

export type PassTypeInfo = {
  label: string
  /** Para que serve, em uma frase. */
  description: string
  /** Exemplos de uso. */
  examples: string
  /** Rótulo do campo "título" (nome do cartão, do evento, do programa...). */
  titleLabel: string
  titlePlaceholder: string
  /** Rótulo do campo principal do passe (nome do titular, número do cartão...). */
  headerLabel: string
  headerPlaceholder: string
  /** Campo numérico opcional do tipo (pontos, saldo). */
  amountLabel?: string
}

export const PASS_TYPE_INFO: Record<PassType, PassTypeInfo> = {
  generic: {
    label: "Genérico",
    description: "Cartão livre, para o que não se encaixa nos outros tipos.",
    examples: "Carteirinha de sócio, crachá, comprovante, cartão de acesso.",
    titleLabel: "Título do cartão",
    titlePlaceholder: "Carteirinha de membro",
    headerLabel: "Texto principal",
    headerPlaceholder: "Maria Silva",
  },
  eventTicket: {
    label: "Ingresso",
    description: "Entrada para um evento, com titular e código de validação.",
    examples: "Show, jogo, palestra, festa, sessão de cinema.",
    titleLabel: "Nome do evento",
    titlePlaceholder: "Festival de Verão",
    headerLabel: "Nome do titular",
    headerPlaceholder: "Maria Silva",
  },
  loyalty: {
    label: "Fidelidade",
    description: "Cartão de programa de pontos ou de associação.",
    examples: "Programa de pontos, clube de vantagens, plano de sócio.",
    titleLabel: "Nome do programa",
    titlePlaceholder: "Clube de Vantagens",
    headerLabel: "Nome do participante",
    headerPlaceholder: "Maria Silva",
    amountLabel: "Pontos",
  },
  offer: {
    label: "Oferta",
    description: "Cupom ou promoção que a pessoa apresenta para resgatar.",
    examples: "Cupom de desconto, brinde, promoção por tempo limitado.",
    titleLabel: "Título da oferta",
    titlePlaceholder: "20% de desconto na primeira compra",
    headerLabel: "Detalhe da oferta",
    headerPlaceholder: "Válido em toda a loja",
  },
  giftCard: {
    label: "Vale-presente",
    description: "Cartão pré-pago com número e saldo.",
    examples: "Gift card de loja, crédito pré-pago, vale-compra.",
    titleLabel: "Nome da loja",
    titlePlaceholder: "Loja Exemplo",
    headerLabel: "Número do cartão",
    headerPlaceholder: "1234 5678 9012",
    amountLabel: "Saldo (R$)",
  },
}

export type PassField = { label: string; value: string }

/** Tudo o que define a aparência e o conteúdo de um passe. Nada aqui é fixo no código. */
export type PassInput = {
  type: PassType
  /** Sufixo do ID da classe (o prefixo é sempre o issuer ID). */
  classSuffix: string
  issuerName: string
  title: string
  header: string
  subheader: string
  backgroundColor: string
  logoUrl: string
  heroImageUrl: string
  barcodeType: BarcodeType
  /** Vazio = usa o ID do objeto. */
  barcodeValue: string
  /** Pontos (fidelidade) ou saldo em reais (vale-presente). */
  amount: string
  fields: PassField[]
}

export type CredentialMode = "demo" | "own"

export type OwnCredentialsInput = {
  issuerId: string
  /** Conteúdo do arquivo JSON da chave da conta de serviço. */
  serviceAccountJson: string
}

export type CreatePassRequest = {
  mode: CredentialMode
  credentials?: OwnCredentialsInput
  pass: PassInput
}

export type CreatePassResult =
  | { ok: true; saveUrl: string; classId: string; objectId: string; classStatus: "created" | "updated" | "reused" }
  | {
      ok: false
      error: string
      hint?: string
      /** ID de classe livre de conflito de tipo, para a pessoa aplicar com um clique. */
      suggestedClassSuffix?: string
    }

export const MAX_FIELDS = 8
