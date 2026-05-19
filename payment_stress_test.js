import http from 'k6/http';
import { check, sleep } from 'k6';
import crypto from 'k6/crypto';

// --- CONFIGURATION MATCHING YOUR HTML ---
const CONFIG = {
  KEY_EXCHANGE_URL: "https://devlinkv2.paydee.co/mpigwv2/mkReq",
  PAYMENT_REQUEST_URL: "https://devlinkv2.paydee.co/mpigwv2/mpReq",
  PUBLIC_KEY: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq8j2SHHfzMLlhYppnlk-QqjjjZwMkhK6s6rERd0JhhY_6-Md4Z0327uEdfNbJrSEPJVPT55gjRhx4MorEhrabuafuY8thSPS4epwkOjjPtELwZxViWe1dzG5TQakJ_i8ZOQuUYFJg02RcwUTzE3ty-x7mkwj9t2wAdRqTagyaDIAVMTxP_Y4AS76xjA3aH43Q0HKHGAxxIlXBIQxImuPhlUbPtVtTHIsUwkIx2BDh8kPZ3Mgr3Cyky0F-cHpEFSi3rPSSLD_FVHlJRW2cODVm8E-s98CURQYs1npzDztzZgZPnnb9K57CB2Z50Ve6qUV7z4-uHs3nehiMJHktIs7LQIDAQAB",
  VERCEL_CALLBACK_URL: "https://payment-page-virid.vercel.app/api/callback",
  
  // Cleaned up formatting for k6 crypto module compatibility
  PRIVATE_KEY: `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAq8j2SHHfzMLlhYppnlk+QqjjjZwMkhK6s6rERd0JhhY/6+Md
4Z0327uEdfNbJrSEPJVPT55gjRhx4MorEhrabuafuY8thSPS4epwkOjjPtELwZxV
iWe1dzG5TQakJ/i8ZOQuUYFJg02RcwUTzE3ty+x7mkwj9t2wAdRqTagyaDIAVMTx
P/Y4AS76xjA3aH43Q0HKHGAxxIlXBIQxImuPhlUbPtVtTHIsUwkIx2BDh8kPZ3Mg
r3Cyky0F+cHpEFSi3rPSSLD/FVHlJRW2cODVm8E+s98CURQYs1npzDztzZgZPnnb
9K57CB2Z50Ve6qUV7z4+uHs3nehiMJHktIs7LQIDAQABAoIBAAufb7vBaf0ugfKx
8D56AaKR+b925korK+hZw/40G9+veV4KQlclrjCsSc854BoeJET9wd18X5em++wp
Juvf1uqiU6lC54y2up8gH8NLi+CP//shYDoz7aJlwgiqS94L0CIFZvWLHqsHIFxc
uhUHKsaINr60VcnvVZLHc/UoIwJLT1Hk2gIMnxxnCqkL1m/BNDeYaT30DLMPaeby
naEsq6JG+pk0szJ9ivTZQrVzWL88qYJor7eR+MGBh65fhhSZyn229EL9DtwVGkU2
8rlFwcCalhmCIgJO9vPK3QLoomT4FfokuECrxv0UwopYPBXyUycvzHmvbFTt5FS8
KLgfMcMCgYEAwqKKSeAuoQpJO4x8hP7fYQ94ezoRkDlV9Q5ICcgJW6giMbzT2adg
d2nuxQIwLRX/P4Dwh2OxCnOrX1FAMxmbs9/6OGgjHhKAAM0pIowZFs4Vqu/QlAZ5
UdPzHdGuA5oSEBhVMxe0L1dWbQr0UpjemH6gOfswDFYsIawLXOPI+TsCgYEA4fIm
QqIBoYAGUPuNfjoK2ZQpRaFGAGuvfpSyljMQDnYJJtOGTW8SI0QFzd31snYx5yP
vEvkR4lEcVPi6t6Mkdd4KVkmktdjIQ0ZOAlbBaaEWFy6lN7TyINJ7BAYFO/1D3Uj
4Gi9O7dV7v49Bzp5tVNFrUihM1yfOdUfP3gCFrcCgYB8YtoT6mSCYIt6tgaiDCx/
4B40SmENFcdcTBs3vRJV9DaeKLoPIEujJR0F5KcbOTKdx+5v6AMt1cxQpyFrRtNd
+ib0Q4El59bMLFE8leI208+/JXHcF+MSq2x0wxr9jEo85QAWHfD2TE+ccmLAIpgn
Rs1pIKGNUMj1X/kHDT/UHwKBgAsmSeEL6C56OlME2SJsr/hESkJ7RAIVQyw4yBEY
JKwerp3P1CDGWA40d9DNeeptd3cSML2X+SHWkjwNaasxZDpmKZXQwmiInGmrHc14
GLfEqc86dDKYdFb2s5UkjiuqU6t5mlWelYf22hS7EwPiTNM30r5kUSAZt/nAnJQj
NectAoGADXNyBnmq65m1YMlWe+PtDEi/hUZagVDPG7xh3T811fAi6+TZSLXCDVR4
gju9FJkwjce29Bmt7xbFYRvIfVUGbuvMxvgBJG4A2BG8wrFbIGDLQEk5VYBvSkKK
hniCoSnVEJYlfgyp9ri1vEgXrX18FwY1KADRc4EnDlEzwkkAAl0=
-----END RSA PRIVATE KEY-----`
};

// --- STRESS LOAD PROFILE ---
export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp up to 5 concurrent users over 10 seconds
    { duration: '20s', target: 5 },  // Sustained load with 5 active threads
    { duration: '5s',  target: 0 },  // Ramp down smoothly
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // Enforce failure rates under 1%
  },
};

// --- HELPER: GENERATE FORMATTED TIMESTAMP ---
function getFormattedDate() {
  const d = new Date();
  return d.getFullYear().toString() +
         (d.getMonth() + 1).toString().padStart(2, '0') +
         d.getDate().toString().padStart(2, '0') +
         d.getHours().toString().padStart(2, '0') +
         d.getMinutes().toString().padStart(2, '0') +
         d.getSeconds().toString().padStart(2, '0');
}

// --- HELPER: BASE64URL ENCODING ---
function base64UrlEncode(str) {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// --- VIRTUAL USER EXECUTION LOOP ---
export default function () {
  // 1. Dynamic parameters initialized per iteration
  const timestamp = getFormattedDate();
  
  // Injecting an incremental counter via __VU and __ITER to prevent collision under high thread load
  const mpiTrxnId = `DMYPAG${timestamp}${__VU}${__ITER}`; 

  const formFields = {
    MPI_TRANS_TYPE: 'SALES',
    MPI_MERC_ID: 'SYSSPC000000001',
    MPI_PURCH_DATE: timestamp,
    MPI_TRXN_ID: mpiTrxnId,
    MPI_PURCH_CURR: '458',
    MPI_PURCH_AMT: '10.00', // Hardcoded dynamic pricing simulation value
    MPI_RESPONSE_TYPE: 'JSON',
    MPI_ADDITIONAL_INFO_IND: '', // Kept empty per form execution defaults
    MPI_PAYMENT_CHANNEL_ID: 'TNG_MY',
    MPI_RETURN_URL: CONFIG.VERCEL_CALLBACK_URL
  };

  // ==========================================
  // STEP 1: EXECUTE KEY EXCHANGE (mkReq)
  // ==========================================
  const mkReqPayload = JSON.stringify({
    merchantId: formFields.MPI_MERC_ID,
    pubKey: CONFIG.PUBLIC_KEY,
    purchaseId: formFields.MPI_TRXN_ID
  });

  const mkReqParams = { headers: { 'Content-Type': 'application/json' } };
  const mkReqResponse = http.post(CONFIG.KEY_EXCHANGE_URL, mkReqPayload, mkReqParams);

  const mkReqSuccess = check(mkReqResponse, {
    'mkReq status is 200': (r) => r.status === 200,
    'mkReq returned 000 success': (r) => r.json().errorCode === '000',
  });

  // Short-circuit the user loop execution if key exchange fails
  if (!mkReqSuccess) {
    console.error(`[VU ${__VU}] mkReq Failed: ${mkReqResponse.body}`);
    sleep(1);
    return;
  }

  // ==========================================
  // STEP 2: MAC SIGNATURE GENERATION
  // ==========================================
  // Mirrors your 'clear_mac()' concatenation order precisely
  const rawSignatureString = 
    formFields.MPI_TRANS_TYPE +
    formFields.MPI_MERC_ID +
    formFields.MPI_TRXN_ID +
    formFields.MPI_PURCH_DATE +
    formFields.MPI_PURCH_CURR +
    formFields.MPI_PURCH_AMT +
    formFields.MPI_RESPONSE_TYPE +
    formFields.MPI_ADDITIONAL_INFO_IND +
    formFields.MPI_PAYMENT_CHANNEL_ID;

  // Sign using SHA256withRSA
  const signatureBase64 = crypto.sign(
    'sha256', 
    crypto.createPrivateKey(CONFIG.PRIVATE_KEY), 
    rawSignatureString, 
    'base64'
  );
  
  // Format the resulting output signature into Base64URL string
  formFields.MPI_MAC = base64UrlEncode(signatureBase64);

  // ==========================================
  // STEP 3: EXECUTE PAYMENT SUBMISSION (mpReq)
  // ==========================================
  // Cleansing payload fields: Remove properties matching an empty string just like your frontend loop does
  const cleanedPayload = {};
  Object.keys(formFields).forEach((key) => {
    if (formFields[key] !== '') {
      cleanedPayload[key] = formFields[key];
    }
  });

  const mpReqParams = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const mpReqResponse = http.post(CONFIG.PAYMENT_REQUEST_URL, cleanedPayload, mpReqParams);

  check(mpReqResponse, {
    'mpReq status is 200': (r) => r.status === 200,
    'mpReq has valid response payload': (r) => r.body.length > 0,
  });

  // Simulating typical user pacing think-time between checkouts
  sleep(1);
}
