// actions.ts
"use server"
import { randomUUID } from "crypto"

type RawData = {
  email: string
  classId: string
  title: string
  validity: string
  date: string
  subheader: string
  heroImage: string
  logoImage: string
  bgColor: string
}

const BASE_URL                = process.env.NEXT_PUBLIC_BASE_URL!
const GOOGLE_WALLET_ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID!

export async function createPassAction(prevState: any, formData: FormData) {
  const email     = formData.get("email")     as string
  const classId   = formData.get("classId")   as string
  const title     = formData.get("title")     as string
  const validity  = formData.get("validity")  as string
  const date      = formData.get("date")      as string
  const subheader = formData.get("subheader") as string
  const heroImage = formData.get("heroImage") as string
  const logoImage = formData.get("logoImage") as string
  const bgColor   = formData.get("bgColor")   as string

  const rawData: RawData = {
    email, classId, title, validity,
    date, subheader, heroImage, logoImage, bgColor
  }

  const classPayload = {
    id: `${GOOGLE_WALLET_ISSUER_ID}.${classId}`,
    classTemplateInfo: {
      hexBackgroundColor: bgColor,
      cardTitle:    { defaultValue: { language: "pt-BR", value: title } },
      subheader:    { defaultValue: { language: "pt-BR", value: subheader } },
      header:       { defaultValue: { language: "pt-BR", value: email } },
    },
    imageModulesData: [
      {
        id: "heroImage",
        mainImage: {
          sourceUri: { uri: heroImage },
          contentDescription: { defaultValue: { language: "pt-BR", value: "Imagem Principal" } }
        }
      },
      {
        id: "logoImage",
        mainImage: {                         
          sourceUri: { uri: logoImage },
          contentDescription: { defaultValue: { language: "pt-BR", value: "Logo" } }
        },
        logo: {                              
          sourceUri: { uri: logoImage }
        }
      }
    ],
    textModulesData: [
      { header: "Data",       body: date,     id: "date"     },
      { header: "Válido até", body: validity, id: "validity" }
    ]
  }


  try {
    // a) cria/clona a classe
    const classRes = await fetch(
      `${BASE_URL}/api/wallet/class`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(classPayload)
      }
    )
    if (!classRes.ok && classRes.status !== 409) {
      const err = await classRes.json()
      throw new Error(err.error || "Erro criando classe")
    }

    // b) cria o objeto
    const objectId = `${GOOGLE_WALLET_ISSUER_ID}.${randomUUID()}`
    const genericObject = {
      id:      objectId,
      classId: classPayload.id,
      hexBackgroundColor: bgColor,
      cardTitle:    classPayload.classTemplateInfo.cardTitle,
      subheader:    classPayload.classTemplateInfo.subheader,
      header:       classPayload.classTemplateInfo.header,
      heroImage:    { sourceUri: { uri: heroImage } },
      logo:         { sourceUri: { uri: logoImage } },
      textModulesData: classPayload.textModulesData
    }

    const objRes = await fetch(
      `${BASE_URL}/api/wallet/object`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(genericObject)
      }
    )
    const data = await objRes.json()

    if (objRes.ok) {
      return { rawData, saveUrl: data.saveUrl, error: "" }
    } else {
      return { rawData, saveUrl: "", error: data.error || "Erro desconhecido" }
    }

  } catch (err: any) {
    return { rawData, saveUrl: "", error: err.message || "Erro de rede ou servidor." }
  }
}
