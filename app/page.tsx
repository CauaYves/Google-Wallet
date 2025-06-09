"use client"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@/components/ui"
import Image from "next/image"
import { useActionState } from "react"
import { createPassAction } from "./actions"

const initialState = {
  saveUrl: "",
  error: ""
}



export default function Home() {
  const [state, formAction] = useActionState(createPassAction, initialState)

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Gerar Cartão Personalizado</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="classId">ID da Classe</Label>
            <Input id="classId" name="classId" type="text" defaultValue="3388000000022937798.custom_class" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Título do Cartão</Label>
            <Input id="title" name="title" type="text" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="text" placeholder="09/06/2025" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="validity">Validade</Label>
            <Input id="validity" name="validity" type="text" placeholder="09/07/2025" required />
          </div>

          <Button type="submit">Criar Cartão</Button>

          {state.error && <p className="text-red-500 font-medium">Erro: {state.error}</p>}

          {state.saveUrl && (
            <div className="pt-4">
              <a href={state.saveUrl} target="_blank" rel="noopener noreferrer">
                <Image width={200} height={200} src="/wallet-button.png" alt="Salvar no Google Wallet" />
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
