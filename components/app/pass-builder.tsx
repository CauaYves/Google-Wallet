"use client"

import { LockKeyIcon, PlusIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react"
import Image from "next/image"
import * as React from "react"
import { createPassAction } from "@/app/actions"
import { PassPreview } from "@/components/app/pass-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/mosaico/alert"
import { Button } from "@/components/mosaico/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/mosaico/card"
import { CopyField } from "@/components/mosaico/copy-field"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/mosaico/field"
import { Input } from "@/components/mosaico/input"
import { NativeSelect, NativeSelectOption } from "@/components/mosaico/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/mosaico/radio-group"
import { Textarea } from "@/components/mosaico/textarea"
import type { AppConfig } from "@/lib/config"
import {
  BARCODE_LABELS,
  BARCODE_TYPES,
  MAX_FIELDS,
  PASS_TYPE_INFO,
  PASS_TYPES,
  type BarcodeType,
  type CreatePassResult,
  type CredentialMode,
  type PassInput,
  type PassType,
} from "@/lib/wallet/types"

type PassBuilderProps = {
  defaults: AppConfig["defaults"]
  /** O servidor tem credenciais de demonstração configuradas? (Só o sim/não chega ao navegador.) */
  demoAvailable: boolean
}

const MAX_KEY_FILE_BYTES = 10_000

export function PassBuilder({ defaults, demoAvailable }: PassBuilderProps) {
  const [mode, setMode] = React.useState<CredentialMode>(demoAvailable ? "demo" : "own")
  // As credenciais próprias ficam só neste estado: somem ao recarregar ou fechar a aba.
  const [issuerId, setIssuerId] = React.useState("")
  const [serviceAccountJson, setServiceAccountJson] = React.useState("")
  const [fileError, setFileError] = React.useState("")

  const [pass, setPass] = React.useState<PassInput>({
    type: "generic",
    classSuffix: "meu_primeiro_passe",
    issuerName: defaults.issuerName,
    title: "",
    header: "",
    subheader: "",
    backgroundColor: defaults.backgroundColor,
    logoUrl: defaults.logoUrl,
    heroImageUrl: defaults.heroImageUrl,
    barcodeType: "QR_CODE",
    barcodeValue: "",
    amount: "",
    fields: [{ label: "Validade", value: "" }],
  })

  const [result, setResult] = React.useState<CreatePassResult | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const info = PASS_TYPE_INFO[pass.type]
  const update = <K extends keyof PassInput>(key: K, value: PassInput[K]) =>
    setPass((current) => ({ ...current, [key]: value }))

  const updateField = (index: number, key: "label" | "value", value: string) =>
    setPass((current) => ({
      ...current,
      fields: current.fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)),
    }))

  const loadKeyFile = async (file: File | undefined) => {
    setFileError("")
    if (!file) return
    if (file.size > MAX_KEY_FILE_BYTES) {
      setFileError("Arquivo grande demais para ser a chave de uma conta de serviço.")
      return
    }
    // Lido no navegador: o arquivo não é enviado a lugar nenhum neste momento.
    setServiceAccountJson(await file.text())
  }

  const clearCredentials = () => {
    setIssuerId("")
    setServiceAccountJson("")
    setFileError("")
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResult(null)
    startTransition(async () => {
      try {
        setResult(
          await createPassAction({
            mode,
            credentials: mode === "own" ? { issuerId, serviceAccountJson } : undefined,
            pass,
          })
        )
      } catch {
        setResult({ ok: false, error: "Não foi possível falar com o servidor. Tente novamente." })
      }
    })
  }

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Credenciais</CardTitle>
            <CardDescription>Escolha em nome de qual emissor o passe será criado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as CredentialMode)}>
              <FieldLabel>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Usar credenciais de demonstração</FieldTitle>
                    <FieldDescription>
                      {demoAvailable
                        ? "O passe é emitido pelo emissor de demonstração deste servidor. Bom para ver o fluxo sem configurar nada. A chave fica no servidor e nunca chega ao seu navegador."
                        : "Indisponível: este servidor não tem credenciais de demonstração configuradas."}
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="demo" disabled={!demoAvailable} />
                </Field>
              </FieldLabel>
              <FieldLabel>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Usar minhas credenciais</FieldTitle>
                    <FieldDescription>
                      Você informa o seu issuer ID e a chave da sua conta de serviço. O passe sai em nome da sua
                      empresa.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="own" />
                </Field>
              </FieldLabel>
            </RadioGroup>

            {mode === "demo" && demoAvailable && (
              <Alert>
                <WarningCircleIcon />
                <AlertTitle>Emissor em modo de teste</AlertTitle>
                <AlertDescription>
                  Passes de demonstração só podem ser salvos por contas Google cadastradas como teste pelo dono
                  do emissor. Se o Google Wallet recusar o seu, use as suas credenciais.
                </AlertDescription>
              </Alert>
            )}

            {mode === "own" && (
              <FieldGroup>
                <Alert>
                  <LockKeyIcon />
                  <AlertTitle>Como tratamos a sua chave</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      <li>Ela é enviada ao servidor só quando você clica em Gerar passe, pela conexão do site.</li>
                      <li>
                        O servidor usa a chave na memória para falar com o Google e assinar o link, e descarta ao
                        terminar. Não gravamos em banco, arquivo, cookie ou log.
                      </li>
                      <li>No navegador ela fica só nesta aba: some ao recarregar ou fechar.</li>
                      <li>
                        Mesmo assim, prefira uma chave criada só para testar e exclua a chave no Google Cloud
                        quando terminar.
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Field>
                  <FieldLabel>Issuer ID</FieldLabel>
                  <Input
                    value={issuerId}
                    onChange={(event) => setIssuerId(event.target.value)}
                    inputMode="numeric"
                    pattern="\d{6,25}"
                    placeholder="3388000000012345678"
                    autoComplete="off"
                    required
                  />
                  <FieldDescription>O número no topo da página Google Wallet API do console.</FieldDescription>
                </Field>

                <Field invalid={Boolean(fileError)}>
                  <FieldLabel>Chave da conta de serviço (JSON)</FieldLabel>
                  <Input
                    type="file"
                    accept="application/json,.json"
                    aria-label="Selecionar o arquivo JSON da conta de serviço"
                    onChange={(event) => loadKeyFile(event.target.files?.[0])}
                  />
                  <Textarea
                    value={serviceAccountJson}
                    onChange={(event) => setServiceAccountJson(event.target.value)}
                    placeholder='{ "type": "service_account", "client_email": "...", "private_key": "..." }'
                    rows={5}
                    spellCheck={false}
                    autoComplete="off"
                    className="font-mono text-xs"
                    required
                  />
                  <FieldDescription>
                    {fileError || "Selecione o arquivo baixado do Google Cloud ou cole o conteúdo dele."}
                  </FieldDescription>
                </Field>

                <div>
                  <Button type="button" variant="outline" size="sm" onClick={clearCredentials}>
                    Limpar credenciais
                  </Button>
                </div>
              </FieldGroup>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Monte o passe</CardTitle>
            <CardDescription>Tudo aqui é da sua marca: emissor, cores, logo e campos.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Tipo de passe</FieldLabel>
                <NativeSelect value={pass.type} onChange={(event) => update("type", event.target.value as PassType)}>
                  {PASS_TYPES.map((type) => (
                    <NativeSelectOption key={type} value={type}>
                      {PASS_TYPE_INFO[type].label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldDescription>
                  {info.description} {info.examples}
                </FieldDescription>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Nome do emissor</FieldLabel>
                  <Input
                    value={pass.issuerName}
                    onChange={(event) => update("issuerName", event.target.value)}
                    maxLength={60}
                    required
                  />
                </Field>
                {mode === "own" && (
                  <Field>
                    <FieldLabel>ID da classe</FieldLabel>
                    <Input
                      value={pass.classSuffix}
                      onChange={(event) => update("classSuffix", event.target.value)}
                      pattern="[A-Za-z0-9._\-]{1,64}"
                      maxLength={64}
                      required
                    />
                    <FieldDescription>
                      Sem espaços. Usar um ID que já existe atualiza a classe com os dados abaixo.
                    </FieldDescription>
                  </Field>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>{info.titleLabel}</FieldLabel>
                  <Input
                    value={pass.title}
                    onChange={(event) => update("title", event.target.value)}
                    placeholder={info.titlePlaceholder}
                    maxLength={80}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel>{info.headerLabel}</FieldLabel>
                  <Input
                    value={pass.header}
                    onChange={(event) => update("header", event.target.value)}
                    placeholder={info.headerPlaceholder}
                    maxLength={80}
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Subtítulo (opcional)</FieldLabel>
                  <Input
                    value={pass.subheader}
                    onChange={(event) => update("subheader", event.target.value)}
                    maxLength={80}
                  />
                </Field>
                {info.amountLabel && (
                  <Field>
                    <FieldLabel>{info.amountLabel} (opcional)</FieldLabel>
                    <Input
                      value={pass.amount}
                      onChange={(event) => update("amount", event.target.value)}
                      inputMode="decimal"
                      pattern="\d+([.,]\d{1,2})?"
                    />
                  </Field>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <Field>
                  <FieldLabel>Cor de fundo</FieldLabel>
                  <Input
                    type="color"
                    value={pass.backgroundColor}
                    onChange={(event) => update("backgroundColor", event.target.value)}
                    className="p-1"
                  />
                </Field>
                <Field>
                  <FieldLabel>URL do logo</FieldLabel>
                  <Input
                    type="url"
                    value={pass.logoUrl}
                    onChange={(event) => update("logoUrl", event.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    required
                  />
                  <FieldDescription>Imagem pública em https, de preferência quadrada.</FieldDescription>
                </Field>
              </div>

              <Field>
                <FieldLabel>URL da imagem de destaque (opcional)</FieldLabel>
                <Input
                  type="url"
                  value={pass.heroImageUrl}
                  onChange={(event) => update("heroImageUrl", event.target.value)}
                  placeholder="https://exemplo.com/banner.png"
                />
                <FieldDescription>Faixa larga exibida no passe. Proporção recomendada: 3 por 1.</FieldDescription>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Código do passe</FieldLabel>
                  <NativeSelect
                    value={pass.barcodeType}
                    onChange={(event) => update("barcodeType", event.target.value as BarcodeType)}
                  >
                    {BARCODE_TYPES.map((type) => (
                      <NativeSelectOption key={type} value={type}>
                        {BARCODE_LABELS[type]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                {pass.barcodeType !== "NONE" && (
                  <Field>
                    <FieldLabel>Valor do código (opcional)</FieldLabel>
                    <Input
                      value={pass.barcodeValue}
                      onChange={(event) => update("barcodeValue", event.target.value)}
                      placeholder="Matrícula, número do ingresso, cupom"
                      maxLength={500}
                    />
                    <FieldDescription>Em branco, usamos o ID do passe.</FieldDescription>
                  </Field>
                )}
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-2 text-sm font-medium">Campos extras</legend>
                {pass.fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2">
                    <Input
                      value={field.label}
                      onChange={(event) => updateField(index, "label", event.target.value)}
                      placeholder="Nome (ex.: Validade)"
                      aria-label={`Nome do campo ${index + 1}`}
                      maxLength={40}
                    />
                    <Input
                      value={field.value}
                      onChange={(event) => updateField(index, "value", event.target.value)}
                      placeholder="Valor (ex.: 31/12/2027)"
                      aria-label={`Valor do campo ${index + 1}`}
                      maxLength={200}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover campo ${index + 1}`}
                      onClick={() => update("fields", pass.fields.filter((_, i) => i !== index))}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                ))}
                {pass.fields.length < MAX_FIELDS && (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => update("fields", [...pass.fields, { label: "", value: "" }])}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Adicionar campo
                    </Button>
                  </div>
                )}
              </fieldset>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>3. Gere o link</CardTitle>
            <CardDescription>A prévia é aproximada: o layout final é do Google Wallet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <PassPreview pass={pass} />

            <Button type="submit" size="lg" className="w-full" disabled={isPending}>
              {isPending ? "Gerando passe..." : "Gerar passe"}
            </Button>

            <div aria-live="polite" className="flex w-full flex-col gap-4 empty:hidden">
              {result && !result.ok && (
                <Alert variant="destructive">
                  <WarningCircleIcon />
                  <AlertTitle>{result.error}</AlertTitle>
                  {result.hint && <AlertDescription>{result.hint}</AlertDescription>}
                </Alert>
              )}

              {result?.ok && (
                <>
                  <a
                    href={result.saveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Image src="/wallet-button.png" width={200} height={64} alt="Adicionar ao Google Wallet" />
                  </a>
                  <Field>
                    <FieldLabel>Link do passe</FieldLabel>
                    <CopyField value={result.saveUrl} label="link do passe" />
                    <FieldDescription>
                      Use este link no seu site, app ou e-mail. Classe{" "}
                      {result.classStatus === "created"
                        ? "criada"
                        : result.classStatus === "updated"
                          ? "atualizada"
                          : "reaproveitada"}
                      : <code className="font-mono text-xs break-all">{result.classId}</code>
                    </FieldDescription>
                  </Field>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>
    </form>
  )
}
