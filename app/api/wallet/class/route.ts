import { baseUrl, httpClient } from '@/lib/google-wallet';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, classTemplateInfo, imageModulesData, textModulesData, linksModuleData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing class id' }, { status: 400 });
    }

    const newClass = {
      id,
      classTemplateInfo,
      imageModulesData,
      textModulesData,
      linksModuleData
    };

    const response = await httpClient.request({
      url: `${baseUrl}/genericClass`,
      method: 'POST',
      data: newClass
    });

    return NextResponse.json({ data: response.data }, { status: 201 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data || 'Unknown error';
    return NextResponse.json({ error: message }, { status });
  }
}
