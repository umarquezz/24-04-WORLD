import http from 'http';

const data = JSON.stringify({
  event: 'TRANSACTION_PAID',
  transaction: {
    externalId: '3368a7f9-c5de-44f6-a2d7-0e0e0428feb1',
    status: 'COMPLETED',
    id: 'simulacao_pix_3_reais'
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let r = '';
  res.on('data', c => r += c);
  res.on('end', () => console.log('Resposta do Webhook:', r));
});

req.write(data);
req.end();
