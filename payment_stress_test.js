// --- 1. BROWSER SHIM FOR K6 COMPATIBILITY ---
globalThis.navigator = { userAgent: "k6" };
globalThis.window = globalThis;

import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
const CONFIG = {
  KEY_EXCHANGE_URL: "https://devlinkv2.paydee.co/mpigwv2/mkReq",
  PAYMENT_REQUEST_URL: "https://devlinkv2.paydee.co/mpigwv2/mpReq",
  PUBLIC_KEY: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq8j2SHHfzMLlhYppnlk-QqjjjZwMkhK6s6rERd0JhhY_6-Md4Z0327uEdfNbJrSEPJVPT55gjRhx4MorEhrabuafuY8thSPS4epwkOjjPtELwZxViWe1dzG5TQakJ_i8ZOQuUYFJg02RcwUTzE3ty-x7mkwj9t2wAdRqTagyaDIAVMTxP_Y4AS76xjA3aH43Q0HKHGAxxIlXBIQxImuPhlUbPtVtTHIsUwkIx2BDh8kPZ3Mgr3Cyky0F-cHpEFSi3rPSSLD_FVHlJRW2cODVm8E-s98CURQYs1npzDztzZgZPnnb9K57CB2Z50Ve6qUV7z4-uHs3nehiMJHktIs7LQIDAQAB",
  VERCEL_CALLBACK_URL: "https://payment-page-virid.vercel.app/api/callback",
  
  // Back to the original clean key structure
  CLEAN_KEY: "MIIEogIBAAKCAQEAq8j2SHHfzMLlhYppnlk+QqjjjZwMkhK6s6rERd0JhhY/6+Md" +
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
    "hniCoSnVEJYlfgyp9ri1vEgXrX18FwY1KADRc4EnDlEzwkkAAl0="
};

export const options = {
  vus: 1,
  iterations: 1,
};

// --- 2. EVALUATION LOADER ---
const JSRSASIGN_URL = "https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/10.5.27/jsrsasign-all-min.js";
let jsrsasignLoaded = false;

function loadJsrsasign() {
  if (jsrsasignLoaded) return;
  const res = http.get(JSRSASIGN_URL);
  if (res.status !== 200) {
    throw new Error(`Failed to download jsrsasign library. Code: ${res.status}`);
  }
  (0, eval)(res.body); 
  jsrsasignLoaded = true;
}

function getFormattedDate() {
  const d = new Date();
  return d.getFullYear().toString() +
         (d.getMonth() + 1).toString().padStart(2, '0') +
         d.getDate().toString().padStart(2, '0') +
         d.getHours().toString().padStart(2, '0') +
         d.getMinutes().toString().padStart(2, '0') +
         d.getSeconds().toString().padStart(2, '0');
}

export default function () {
  const d = new Date();
  const shortTime = d.getDate().toString().padStart(2, '0') +
                    d.getHours().toString().padStart(2, '0') +
                    d.getMinutes().toString().padStart(2, '0') +
                    d.getSeconds().toString().padStart(2, '0');
  
  const vuPart = __VU.toString().padStart(2, '0');
  const iterPart = __ITER.toString().padStart(4, '0');
  const mpiTrxnId = `DMYPAG${shortTime}${vuPart}${iterPart}`; 

  const formFields = {
    MPI_TRANS_TYPE: 'SALES',
    MPI_MERC_ID: 'SYSSPC000000001',
    MPI_PURCH_DATE: getFormattedDate(),
    MPI_TRXN_ID: mpiTrxnId,
    MPI_PURCH_CURR: '458',
    MPI_PURCH_AMT: '100', 
    MPI_RESPONSE_TYPE: 'JSON',
    MPI_ADDITIONAL_INFO_IND: '', 
    MPI_PAYMENT_CHANNEL_ID: 'TNG_MY'
  };

  // ==========================================
  // STEP 1: KEY EXCHANGE (mkReq)
  // ==========================================
  const mkReqPayload = JSON.stringify({
    merchantId: formFields.MPI_MERC_ID,
    pubKey: CONFIG.PUBLIC_KEY,
    purchaseId: formFields.MPI_TRXN_ID
  });

  const mkReqParams = { headers: { 'Content-Type': 'application/json' } };
  const mkReqResponse = http.post(CONFIG.KEY_EXCHANGE_URL, mkReqPayload, mkReqParams);
  console.log(`[mkReq] Status: ${mkReqResponse.status} | Body: ${mkReqResponse.body}`);

  // ==========================================
  // STEP 2: NATIVE PKCS#1 INITIALIZATION
  // ==========================================
  let base64UrlValue = '';
  try {
    loadJsrsasign();

    const KJUR = globalThis.KJUR;
    const hextob64 = globalThis.hextob64;

    const rawString = 
      formFields.MPI_TRANS_TYPE +
      formFields.MPI_MERC_ID +
      formFields.MPI_TRXN_ID +
      formFields.MPI_PURCH_DATE +
      formFields.MPI_PURCH_CURR +
      formFields.MPI_PURCH_AMT +
      formFields.MPI_RESPONSE_TYPE +
      formFields.MPI_ADDITIONAL_INFO_IND +
      formFields.MPI_PAYMENT_CHANNEL_ID;

    // Direct PKCS#1 object assignment completely skipping KEYUTIL regex traps
    const rsaKey = new KJUR.crypto.RSAKey();
    
    // Explicitly wraps your clean string back to the correct PKCS#1 format
    const pkcs1Pem = "-----BEGIN RSA PRIVATE KEY-----\n" + CONFIG.CLEAN_KEY + "\n-----END RSA PRIVATE KEY-----";
    rsaKey.readPrivateKeyFromPEMString(pkcs1Pem);

    let sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
    sig.init(rsaKey); 
    sig.updateString(rawString);
    let sigValueHex = sig.sign();
    
    let base64Value = hextob64(sigValueHex);
    base64UrlValue = base64Value
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    console.log(`[Signature Success] Generated 256-byte RSA MAC: ${base64UrlValue}`);

  } catch (err) {
    console.log(`[CRITICAL ERROR inside Dynamic Eval Engine Step]: ${err.message || err}`);
    return;
  }

  // ==========================================
  // STEP 3: EXECUTE PAYMENT SUBMISSION (mpReq)
  // ==========================================
  let formBodyData = [];
  Object.keys(formFields).forEach((key) => {
    if (formFields[key] !== '') {
      formBodyData.push(`${encodeURIComponent(key)}=${encodeURIComponent(formFields[key])}`);
    }
  });

  formBodyData.push(`MPI_MAC=${encodeURIComponent(base64UrlValue)}`);

  const payloadString = formBodyData.join('&');
  const mpReqParams = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const mpReqResponse = http.post(CONFIG.PAYMENT_REQUEST_URL, payloadString, mpReqParams);
  console.log(`[mpReq] Status: ${mpReqResponse.status} | Body: ${mpReqResponse.body}`);

  check(mpReqResponse, {
    'mpReq status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'summary.html': `
    <!DOCTYPE html>
    <html lang="en">
    <head><title>Payment Test Results</title></head>
    <body style="font-family: sans-serif; padding: 40px; background: #f4f6f9;">
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h2 style="color: #2563eb;">k6 Payment Test Summary</h2>
        <p>Loops: <strong>${data.metrics.iterations.values.count}</strong></p>
        <p>Failures: <strong>${data.metrics.http_req_failed.values.passes}</strong></p>
      </div>
    </body>
    </html>
    `,
  };
}
