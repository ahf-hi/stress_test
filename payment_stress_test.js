import http from 'k6/http';
import { SharedArray } from 'k6/data';

const data = new SharedArray('payloads', function () {
  return open('./payloads.csv').split('\n').slice(1).map(line => {
    const [trxId, mac, date] = line.split(',');
    return { trxId, mac, date };
  });
});

export default function () {
  const row = data[__ITER % data.length];

  // 1. MK REQ: Key Exchange (Must happen first)
  const mkPayload = JSON.stringify({
    "merchantId": "SYSSPC000000001",
    "pubKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq8j2SHHfzMLlhYppnlk-QqjjjZwMkhK6s6rERd0JhhY_6-Md4Z0327uEdfNbJrSEPJVPT55gjRhx4MorEhrabuafuY8thSPS4epwkOjjPtELwZxViWe1dzG5TQakJ_i8ZOQuUYFJg02RcwUTzE3ty-x7mkwj9t2wAdRqTagyaDIAVMTxP_Y4AS76xjA3aH43Q0HKHGAxxIlXBIQxImuPhlUbPtVtTHIsUwkIx2BDh8kPZ3Mgr3Cyky0F-cHpEFSi3rPSSLD_FVHlJRW2cODVm8E-s98CURQYs1npzDztzZgZPnnb9K57CB2Z50Ve6qUV7z4-uHs3nehiMJHktIs7LQIDAQAB",
    "purchaseId": row.trxId
  });

  http.post('https://devlinkv2.paydee.co/mpigwv2/mkReq', mkPayload, {
    headers: { 'Content-Type': 'application/json' }
  });

  // 2. MP REQ: Payment Submission
  const mpPayload = `MPI_TRANS_TYPE=SALES&MPI_MERC_ID=SYSSPC000000001&MPI_TRXN_ID=${row.trxId}&MPI_PURCH_DATE=${row.date}&MPI_PURCH_CURR=458&MPI_PURCH_AMT=100&MPI_RESPONSE_TYPE=JSON&MPI_PAYMENT_CHANNEL_ID=TNG_MY&MPI_MAC=${row.mac}`;

  const res = http.post('https://devlinkv2.paydee.co/mpigwv2/mpReq', mpPayload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log(`[TRX: ${row.trxId}] mkReq + mpReq Status: ${res.status}`);
}
