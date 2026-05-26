const https = require('https');

// Helper to make https requests (dependency-free Node.js)
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

  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, msg: "Method not allowed. Use POST." });
  }

  // Parse request body
  let body = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ code: 400, msg: "Invalid JSON body." });
    }
  } else {
    body = req.body || {};
  }

  const { roleId, assignee } = body;
  if (!roleId || assignee === undefined) {
    return res.status(400).json({ code: 400, msg: "Missing roleId or assignee." });
  }

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;
  const token = process.env.LARK_SPREADSHEET_TOKEN;
  const range = process.env.LARK_SHEET_RANGE || "2168c9!A1:C200";
  const sheetId = process.env.LARK_SHEET_ID || "2168c9";

  if (!appId || !appSecret || !token) {
    return res.status(500).json({ code: 1, msg: "Missing environment variables on Vercel." });
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
      return res.status(500).json({ code: 2, msg: "Feishu Authentication failed." });
    }

    // 2. Fetch Spreadsheet Values to dynamically find the correct row number
    const encodedRange = encodeURIComponent(range);
    const sheetRes = await makeRequest(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${token}/values/${encodedRange}?valueRenderOption=ToString`,
      "GET",
      { "Authorization": `Bearer ${accessToken}` }
    );

    if (sheetRes.code !== 0) {
      return res.status(500).json({ code: 3, msg: "Failed to read spreadsheet values.", detail: sheetRes });
    }

    const values = sheetRes.data.valueRange.values || [];
    
    // Scan column A to locate the matching roleId
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      if (values[i] && values[i][0] === roleId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return res.status(404).json({ code: 404, msg: `Role ID '${roleId}' not found in sheet.` });
    }

    // Feishu Sheet rows are 1-indexed, so rowNumber = index + 1
    const rowNumber = rowIndex + 1;
    const targetCell = `${sheetId}!C${rowNumber}`; // e.g. "2168c9!C5"
    
    // 3. Write the new assignee value to that specific cell (Column C)
    const writeRes = await makeRequest(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${token}/values`,
      "PUT",
      {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      {
        "valueRange": {
          "range": targetCell,
          "values": [[assignee]]
        }
      }
    );

    if (writeRes.code !== 0) {
      return res.status(500).json({ code: 4, msg: "Failed to write values back to Feishu Sheet.", detail: writeRes });
    }

    return res.status(200).json({ code: 0, msg: "Successfully updated Feishu Sheet!", cell: targetCell, assignee });
  } catch (err) {
    return res.status(500).json({ code: 5, msg: err.message });
  }
}
