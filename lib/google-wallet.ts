import credentials from "@/credentials.json";
import { GoogleAuth } from 'google-auth-library';

export const issuerId = process.env.ISSUER_ID;
export const classId = `${issuerId}.codelab_class_id`;
export const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1';

export const httpClient = new GoogleAuth({
  credentials,
  scopes: 'https://www.googleapis.com/auth/wallet_object.issuer',
});

