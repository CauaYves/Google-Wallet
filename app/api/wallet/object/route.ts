// /api/wallet/object/route.ts
import credentials from '@/credentials.json'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // recebe o objeto genérico completo do cliente
    const genericObject = await req.json()

    // adiciona o código de barras baseado no próprio ID
    const objectWithBarcode = {
      ...genericObject,
      barcode: {
        type: 'QR_CODE',
        value: genericObject.id
      }
    }

    // monta as claims para o Save to Wallet
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: [],
      typ: 'savetowallet',
      payload: {
        genericObjects: [objectWithBarcode]
      }
    }

    // gera o JWT
    const token = jwt.sign(claims, credentials.private_key, {
      algorithm: 'RS256'
    })

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`
    return NextResponse.json({ saveUrl }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
