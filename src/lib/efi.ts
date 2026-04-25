import EfiPay from 'sdk-node-apis-efi';
import path from 'path';

/**
 * Utilitário para integração com a API Pix da Efí Bank (Gerencianet)
 */

// Caminho recomendado para Next.js na Netlify
const certificatePath = path.join(process.cwd(), 'certificates', 'cert.p12');

// Limpeza de variáveis para evitar espaços em branco invisíveis
const options = {
  sandbox: (process.env.EFI_SANDBOX || '').trim() === 'true',
  client_id: (process.env.EFI_CLIENT_ID || '').trim(),
  client_secret: (process.env.EFI_CLIENT_SECRET || '').trim(),
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
    calendario: { expiracao: 3600 },
    valor: { original: (amountBrl / 100).toFixed(2) },
    chave: (process.env.EFI_PIX_KEY || '').trim(),
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
    const charge = await efiPay.pixCreateImmediateCharge({}, body);

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
    const errorMessage = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
    console.error('Efí API Raw Error:', errorMessage);
    throw errorMessage;
  }
}
