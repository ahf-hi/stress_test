import http from 'k6/http';
import { check } from 'k6';
import crypto from 'k6/crypto';

export default function () {
  const merchantId = 'SYSSPC000000001';
  const trxId = `DMYPAG${Math.floor(Date.now() / 1000)}`;
  const date = '20260519';
  const amount = '100';
  
  const rawString = "SALES" + merchantId + trxId + date + "458" + amount + "JSON" + "" + "TNG_MY";

  // Use the standard object-based sign method
  const hasher = crypto.createHMAC('sha256', 'your-secret-key'); // If required
  // HOWEVER: Since we need RSA signing (not HMAC), and k6 standard library 
  // sometimes hides 'createSign' behind specific k6 versions, we will 
  // attempt to use the most common interface:
  
  const signer = crypto.createSign('SHA256'); 
  signer.update(rawString);
  
  const PRIVATE_KEY_PEM = "-----BEGIN RSA PRIVATE KEY-----... (your key) ...-----END RSA PRIVATE KEY-----";
  
  const signature = signer.sign(PRIVATE_KEY_PEM, 'base64');
  const mpiMac = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const payload = `MPI_TRANS_TYPE=SALES&MPI_MERC_ID=${merchantId}&MPI_TRXN_ID=${trxId}&MPI_PURCH_DATE=${date}&MPI_PURCH_CURR=458&MPI_PURCH_AMT=${amount}&MPI_RESPONSE_TYPE=JSON&MPI_PAYMENT_CHANNEL_ID=TNG_MY&MPI_MAC=${mpiMac}`;

  const res = http.post('https://devlinkv2.paydee.co/mpigwv2/mpReq', payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log(`[Result]: ${res.status}`);
}
