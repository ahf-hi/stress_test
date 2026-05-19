import http from 'k6/http';
import { crypto } from 'k6/crypto';
import { check } from 'k6';

// --- CONFIGURATION ---
const PRIVATE_KEY_PEM = 
  "-----BEGIN RSA PRIVATE KEY-----\n" +
  "MIIEogIBAAKCAQEAq8j2SHHfzMLlhYppnlk+QqjjjZwMkhK6s6rERd0JhhY/6+Md" +
  "4Z0327uEdfNbJrSEPJVPT55gjRhx4MorEhrabuafuY8thSPS4epwkOjjPtELwZxV" +
  "iWe1dzG5TQakJ/i8ZOQuUYFJg02RcwUTzE3ty+x7mkwj9t2wAdRqTagyaDIAVMTx" +
  "P/Y4AS76xjA3aH43Q0HKHGAxxIlXBIQxImuPhlUbPtVtTHIsUwkIx2BDh8kPZ3Mg" +
  "r3Cyky0F+cHpEFSi3rPSSLD/FVHlJRW2cODVm8E+s98CURQYs1npzDztzZgZPnnb" +
  "9K57CB2Z50Ve6qUV7z4+uHs3nehiMJHktIs7LQIDAQABAoIBAAufb7vBaf0ugfKx" +
  "8D56AaKR+b925korK+hZw/40G9+veV4KQlclrjCsSc854BoeJET9wd18X5em++wp" +
  "Juvf1uqiU6lC54y2up8gH8NLi+CP//shYDoz7aJlwgiqS94L0CIFZvWLHqsHIFxc" +
  "uhUHKsaINr60VcnvVZLHc/UoIwJLT1Hk2gIMnxxnCqkL1m/BNDeYaT30DLMPaeby" +
  "naEsq6JG+pk0szJ9ivTZQrVzWL88qYJor7eR+MGBh65fhhSZyn229EL9DtwVGkU2" +
  "8rlFwcCalhmCIgJO9vPK3QLoomT4FfokuECrxv0UwopYPBXyUycvzHmvbFTt5FS8" +
  "KLgfMcMCgYEAwqKKSeAuoQpJO4x8hP7fYQ94ezoRkDlV9Q5ICcgJW6giMbzT2adg" +
  "d2nuxQIwLRX/P4Dwh2OxCnOrX1FAMxmbs9/6OGgjHhKAAM0pIowZFs4Vqu/QlAZ5" +
  "UdPzHdGuA5oSEBhVMxe0L1dWbQr0UpjemH6gOfswDFYsIawLXOPI+TsCgYEA4fIm" +
  "QqIBoYAGUPuNfjoK2ZQpRaFGAGuvfpSyljMQDnYJJtOGTW8SI0QFzd31snYx5yP" +
  "vEvkR4lEcVPi6t6Mkdd4KVkmktdjIQ0ZOAlbBaaEWFy6lN7TyINJ7BAYFO/1D3Uj" +
  "4Gi9O7dV7v49Bzp5tVNFrUihM1yfOdUfP3gCFrcCgYB8YtoT6mSCYIt6tgaiDCx/" +
  "4B40SmENFcdcTBs3vRJV9DaeKLoPIEujJR0F5KcbOTKdx+5v6AMt1cxQpyFrRtNd" +
  "+ib0Q4El59bMLFE8leI208+/JXHcF+MSq2x0wxr9jEo85QAWHfD2TE+ccmLAIpgn" +
  "Rs1pIKGNUMj1X/kHDT/UHwKBgAsmSeEL6C56OlME2SJsr/hESkJ7RAIVQyw4yBEY" +
  "JKwerp3P1CDGWA40d9DNeeptd3cSML2X+SHWkjwNaasxZDpmKZXQwmiInGmrHc14" +
  "GLfEqc86dDKYdFb2s5UkjiuqU6t5mlWelYf22hS7EwPiTNM30r5kUSAZt/nAnJQj" +
  "NectAoGADXNyBnmq65m1YMlWe+PtDEi/hUZagVDPG7xh3T811fAi6+TZSLXCDVR4" +
  "gju9FJkwjce29Bmt7xbFYRvIfVUGbuvMxvgBJG4A2BG8wrFbIGDLQEk5VYBvSkKK" +
  "hniCoSnVEJYlfgyp9ri1vEgXrX18FwY1KADRc4EnDlEzwkkAAl0=" +
  "\n-----END RSA PRIVATE KEY-----";

export default function () {
  // 1. Prepare dynamic data
  const merchantId = 'SYSSPC000000001';
  const trxId = `DMYPAG${Math.floor(Date.now() / 1000)}`;
  const date = '20260519';
  const amount = '100';

  // 2. Build the exact string format expected by the gateway
  const rawString = "SALES" + merchantId + trxId + date + "458" + amount + "JSON" + "" + "TNG_MY";

  // 3. Perform native local signing
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(rawString);
  const signature = signer.sign(PRIVATE_KEY_PEM, 'base64');
  
  // Format for Gateway (Base64URL)
  const mpiMac = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  // 4. Submit Payment
  const url = 'https://devlinkv2.paydee.co/mpigwv2/mpReq';
  const payload = `MPI_TRANS_TYPE=SALES&MPI_MERC_ID=${merchantId}&MPI_TRXN_ID=${trxId}&MPI_PURCH_DATE=${date}&MPI_PURCH_CURR=458&MPI_PURCH_AMT=${amount}&MPI_RESPONSE_TYPE=JSON&MPI_PAYMENT_CHANNEL_ID=TNG_MY&MPI_MAC=${mpiMac}`;

  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log(`[mpReq Status]: ${res.status} | Body: ${res.body}`);
  
  check(res, {
    'Transaction successful': (r) => r.status === 200,
  });
}
