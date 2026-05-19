import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
const CONFIG = {
  KEY_EXCHANGE_URL: "https://devlinkv2.paydee.co/mpigwv2/mkReq",
  PAYMENT_REQUEST_URL: "https://devlinkv2.paydee.co/mpigwv2/mpReq",
  PUBLIC_KEY: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq8j2SHHfzMLlhYppnlk-QqjjjZwMkhK6s6rERd0JhhY_6-Md4Z0327uEdfNbJrSEPJVPT55gjRhx4MorEhrabuafuY8thSPS4epwkOjjPtELwZxViWe1dzG5TQakJ_i8ZOQuUYFJg02RcwUTzE3ty-x7mkwj9t2wAdRqTagyaDIAVMTxP_Y4AS76xjA3aH43Q0HKHGAxxIlXBIQxImuPhlUbPtVtTHIsUwkIx2BDh8kPZ3Mgr3Cyky0F-cHpEFSi3rPSSLD_FVHlJRW2cODVm8E-s98CURQYs1npzDztzZgZPnnb9K57CB2Z50Ve6qUV7z4-uHs3nehiMJHktIs7LQIDAQAB",
  
  // URL to your Vercel helper or callback domain to sign strings natively
  SIGNING_SERVICE_URL: "https://payment-page-virid.vercel.app/api/sign" 
};

export const options = {
  vus: 1,
  iterations: 1,
};

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
  // STEP 2: OFF-LOAD SIGNING TO NODE/VERCEL
  // ==========================================
  let base64UrlValue = '';
  
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

  const signResponse = http.post(CONFIG.SIGNING_SERVICE_URL, JSON.stringify({ text: rawString }), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (signResponse.status === 200) {
    const resBody = JSON.parse(signResponse.body);
    base64UrlValue = resBody.mpiMac; // Grabbing the generated MAC from your API backend
    console.log(`[Signature Success via Backend Service]: ${base64UrlValue}`);
  } else {
    console.log(`[CRITICAL] External Signing Service Failed with status: ${signResponse.status}. falling back...`);
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
