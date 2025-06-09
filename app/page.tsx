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



export default function Home() {
  const [state, formAction, isLoading] = useActionState(createPassAction, {
    saveUrl: "",
    error: "",
    rawData: {
      classId: "",
      date: "",
      email: "",
      title: "",
      validity: "",
      subheader: "",
      heroImage: "https://upload.wikimedia.org/wikipedia/pt/a/ae/Kratos_GoW_Ragnarok.jpg",
      logoImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3ZMDBVY4lhBsxeYkjZeH_GkHJnVfuNcbODg&s",
      bgColor:"#4285f4"
    }
  })

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Gerar Cartão Personalizado</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.rawData.email}/>
          </div>

          <div className="space-y-1">
            <Label htmlFor="classId">ID da Classe (Sem espaços em branco)</Label>
            <Input id="classId" name="classId" type="text" inputMode="text" required defaultValue={state.rawData.classId} pattern="\S+"/>
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Título do Cartão</Label>
            <Input id="title" name="title" type="text" inputMode="text" required defaultValue={state.rawData.title}/>
          </div>

          <div className="space-y-1">
            <Label htmlFor="subheader">Subtítulo</Label>
            <Input id="subheader" name="subheader" type="text" inputMode="text" defaultValue={state.rawData.subheader}/>
          </div>

          <div className="space-y-1">
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="date" required defaultValue={state.rawData.date}/>
          </div>

          <div className="space-y-1">
            <Label htmlFor="validity">Validade</Label>
            <Input id="validity" name="validity" type="date" required defaultValue={state.rawData.validity}/>
          </div>

    <div className="space-y-1">
            <Label htmlFor="heroImage">URL da Imagem Principal (.jpg)</Label>
            <Input
              id="heroImage"
              name="heroImage"
              type="url"
              inputMode="url"
              placeholder="https://exemplo.com/imagem.jpg"
              required
              defaultValue={state.rawData.heroImage}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="logoImage">URL da Logo (.jpg)</Label>
            <Input
              id="logoImage"
              name="logoImage"
              type="url"
              inputMode="url"
              placeholder="https://exemplo.com/logo.jpg"
              required
              defaultValue={state.rawData.logoImage}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bgColor">Cor de Fundo (hex)</Label>
            <Input id="bgColor" name="bgColor" type="color" pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" placeholder="#4285f4" />
          </div>

          <Button disabled={isLoading} type="submit">{isLoading ? "Criando cartão..." : "Criar Cartão"}</Button>

          {state.error && <p className="text-red-500 font-medium">Erro: {JSON.stringify(state.error)}</p>}

          {state.saveUrl && (
            <div className="pt-4 flex justify-center">
              <a href={state.saveUrl} target="_blank" rel="noopener noreferrer">
                <Image width={200} height={64} src="/wallet-button.png" alt="Salvar no Google Wallet" />
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
