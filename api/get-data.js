const https = require('https');

// Helper to make https requests using Node.js native https module (dependency-free)
function makeRequest(url, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error("Failed to parse response: " + data));
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;
  const token = process.env.LARK_SPREADSHEET_TOKEN;
  let range = process.env.LARK_SHEET_RANGE || "2168c9!A1:C200";

  // Defensive check: replace Sheet1 with exact Lark sheetId to avoid "not found sheetId" 90215 error
  if (range && range.startsWith("Sheet1")) {
    range = range.replace("Sheet1", "2168c9");
  }

  if (!appId || !appSecret || !token) {
    return res.status(500).json({ code: 1, msg: "Missing Vercel environment variables. Please check dashboard Settings -> Environment Variables." });
  }

  try {
    // 1. Get Tenant Access Token
    const authRes = await makeRequest(
      "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
      "POST",
      { "Content-Type": "application/json; charset=utf-8" },
      { app_id: appId, app_secret: appSecret }
    );

    const accessToken = authRes.tenant_access_token;
    if (!accessToken) {
      return res.status(500).json({ code: 2, msg: "Feishu Authentication failed.", detail: authRes });
    }

    // 2. Fetch Spreadsheet Values
    const encodedRange = encodeURIComponent(range);
    const sheetRes = await makeRequest(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${token}/values/${encodedRange}?valueRenderOption=ToString`,
      "GET",
      { "Authorization": `Bearer ${accessToken}` }
    );

    if (sheetRes.code !== 0) {
      return res.status(500).json({ code: 3, msg: sheetRes.msg, detail: sheetRes });
    }

    const values = sheetRes.data.valueRange.values || [];
    return res.status(200).json({ code: 0, values: values });
  } catch (err) {
    return res.status(500).json({ code: 5, msg: err.message });
  }
}
