import EfiPay from 'sdk-node-apis-efi';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Utilitário para integração com a API Pix da Efí Bank (Gerencianet)
 */

// Lógica para lidar com o certificado em ambiente Serverless (Netlify/Vercel)
let certificatePath = path.resolve(process.env.EFI_CERT_PATH || './certificates/cert.p12');

if (process.env.EFI_CERT_BASE64) {
  // Se existir a variável Base64, criamos um arquivo temporário no sistema
  const tempPath = path.join(os.tmpdir(), 'cert.p12');
  if (!fs.existsSync(tempPath)) {
    fs.writeFileSync(tempPath, Buffer.from(process.env.EFI_CERT_BASE64, 'base64'));
  }
  certificatePath = tempPath;
}

const options = {
  sandbox: process.env.EFI_SANDBOX === 'true',
  client_id: process.env.EFI_CLIENT_ID || '',
  client_secret: process.env.EFI_CLIENT_SECRET || '',
  certificate: certificatePath,
  validateMtls: true,
};

// @ts-ignore
const efiPay = new EfiPay(options);

export default efiPay;

/**
 * Cria uma cobrança Pix imediata
 */
export async function createImmediatePixCharge(orderId: string, amountBrl: number, customerEmail: string) {
  const body = {
    calendario: {
      expiracao: 3600, // 1 hora
    },
    valor: {
      original: (amountBrl / 100).toFixed(2),
    },
    chave: process.env.EFI_PIX_KEY as string,
    solicitacaoPagador: `Pedido #${orderId}`,
    infoAdicionais: [
      { nome: 'Pedido', valor: orderId },
      { nome: 'Cliente', valor: customerEmail },
    ],
  };

  if (!body.chave) {
    throw new Error('Variável de ambiente EFI_PIX_KEY não configurada.');
  }

  try {
    // @ts-ignore
    const charge = await efiPay.pixCreateImmediateCharge([], body);

    if (!charge.loc || !charge.loc.id) {
      throw new Error('Falha ao obter location da cobrança Pix');
    }

    const qrCodeParams = { id: charge.loc.id };
    const qrCodeData = await efiPay.pixGenerateQRCode(qrCodeParams);

    return {
      txid: charge.txid,
      pixCopiaECola: charge.pixCopiaECola,
      qrCodeImage: qrCodeData.imagemQrcode,
      qrCodeLink: qrCodeData.linkVisualizacao,
    };
  } catch (error: any) {
    console.error('Efí API Raw Error:', JSON.stringify(error, null, 2));
    throw error;
  }
}
