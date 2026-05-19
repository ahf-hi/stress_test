import http from 'k6/http';
import { SharedArray } from 'k6/data';

// Load pre-computed CSV
const data = new SharedArray('payloads', function () {
  return open('./payloads.csv').split('\n').slice(1).map(line => {
    const [trxId, mac] = line.split(',');
    return { trxId, mac };
  });
});

export default function () {
  const row = data[__ITER % data.length];
  
  // Manually construct the form-encoded payload
  const payload = 
    `MPI_TRANS_TYPE=SALES` +
    `&MPI_MERC_ID=SYSSPC000000001` +
    `&MPI_TRXN_ID=${row.trxId}` +
    `&MPI_PURCH_DATE=20260519` +
    `&MPI_PURCH_CURR=458` +
    `&MPI_PURCH_AMT=100` +
    `&MPI_RESPONSE_TYPE=JSON` +
    `&MPI_PAYMENT_CHANNEL_ID=TNG_MY` +
    `&MPI_MAC=${row.mac}`;

  const res = http.post('https://devlinkv2.paydee.co/mpigwv2/mpReq', payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log(`[TRX: ${row.trxId}] Status: ${res.status}`);
}
