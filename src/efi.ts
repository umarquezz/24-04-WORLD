import EfiPay from 'sdk-node-apis-efi';
import path from 'path';

/**
 * Utilitário para integração com a API Pix da Efí Bank (Gerencianet)
 */

const options = {
  sandbox: process.env.EFI_SANDBOX === 'true',
  client_id: process.env.EFI_CLIENT_ID || '',
  client_secret: process.env.EFI_CLIENT_SECRET || '',
  certificate: path.join(process.cwd(), process.env.EFI_CERT_PATH || 'certificates/cert.p12'),
  validateMtls: true,
};

// @ts-ignore - O SDK da Efí não tem tipos oficiais perfeitos
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
      original: (amountBrl / 100).toFixed(2), // Converte centavos para decimal 0.00
    },
    chave: process.env.EFI_PIX_KEY as string,
    solicitacaoPagador: `Pedido #${orderId}`,
    infoAdicionais: [
      {
        nome: 'Pedido',
        valor: orderId,
      },
      {
        nome: 'Cliente',
        valor: customerEmail,
      },
    ],
  };

  if (!body.chave) {
    throw new Error('Variável de ambiente EFI_PIX_KEY não configurada.');
  }

  try {
    // 1. Criar a cobrança
    // @ts-ignore - O SDK tem definições de tipos incompletas
    const charge = await efiPay.pixCreateImmediateCharge([], body);

    if (!charge.loc || !charge.loc.id) {
      throw new Error('Falha ao obter location da cobrança Pix');
    }

    // 2. Gerar o QR Code e o Pix Copia e Cola
    const qrCodeParams = { id: charge.loc.id };
    const qrCodeData = await efiPay.pixGenerateQRCode(qrCodeParams);

    return {
      txid: charge.txid,
      pixCopiaECola: charge.pixCopiaECola,
      qrCodeImage: qrCodeData.imagemQrcode,
      qrCodeLink: qrCodeData.linkVisualizacao,
    };
  } catch (error: any) {
    console.error('Efí API Error:', error.message || error);
    throw error;
  }
}
