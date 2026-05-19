import http from 'k6/http';
import { SharedArray } from 'k6/data';

// Load the pre-signed data into memory once.
// This is extremely fast and works in any k6 environment.
const data = new SharedArray('payloads', function () {
  const f = open('./payloads.csv');
  return f.split('\n').slice(1).map(line => {
    const [trxId, mac] = line.split(',');
    return { trxId, mac };
  });
});

export default function () {
  // Pick a pre-signed row based on the current iteration
  const row = data[__ITER % data.length];

  // Build the request using the pre-signed MAC
  const payload = `MPI_TRANS_TYPE=SALES&MPI_MERC_ID=SYSSPC000000001&MPI_TRXN_ID=${row.trxId}&MPI_PURCH_DATE=20260519&MPI_PURCH_CURR=458&MPI_PURCH_AMT=100&MPI_RESPONSE_TYPE=JSON&MPI_PAYMENT_CHANNEL_ID=TNG_MY&MPI_MAC=${row.mac}`;

  const res = http.post(
    'https://devlinkv2.paydee.co/mpigwv2/mpReq', 
    payload, 
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );

  console.log(`[trxId]: ${row.trxId} | [Status]: ${res.status}`);
}
