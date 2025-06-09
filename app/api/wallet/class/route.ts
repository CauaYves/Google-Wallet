// /api/wallet/class/route.ts
import { baseUrl, httpClient } from '@/lib/google-wallet'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { id, classTemplateInfo, imageModulesData, textModulesData } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'Missing class id' }, { status: 400 })
  }

  const newClass: Record<string, any> = { id }
  if (classTemplateInfo) newClass.classTemplateInfo = classTemplateInfo
  if (imageModulesData)   newClass.imageModulesData   = imageModulesData
  if (textModulesData)    newClass.textModulesData    = textModulesData

  try {
    const res = await httpClient.request({
      url:    `${baseUrl}/genericClass`,
      method: 'POST',
      data:   newClass
    })
    return NextResponse.json(res.data, { status: 201 })
  } catch (err: any) {
	console.log(err)
    if (err.response?.status === 409) {
      // classe já existe
      return NextResponse.json({ message: 'Class already exists' }, { status: 200 })
    }
    return NextResponse.json(
      { error: err.response?.data || 'Unknown error' },
      { status: err.response?.status || 500 }
    )
  }
}
