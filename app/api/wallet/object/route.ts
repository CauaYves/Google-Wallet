import credentials from '@/credentials.json';
import { issuerId } from '@/lib/google-wallet';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, classId, cardInfo } = body;

    if (!email || !classId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const objectSuffix = email.replace(/[^\w.-]/g, '_');
    const objectId = `${issuerId}.${objectSuffix}_id`;

    const genericObject = {
      id: objectId,
      classId,
      ...cardInfo,
      barcode: {
        type: 'QR_CODE',
        value: objectId
      }
    };

    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: [],
      typ: 'savetowallet',
      payload: {
        genericObjects: [genericObject]
      }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return NextResponse.json({ saveUrl }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
