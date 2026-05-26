import os
import json
import urllib.request
import ssl

env_path = os.path.join(os.path.dirname(__file__), '.env')
env = {}
with open(env_path, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
            parts = line.split('=', 1)
            if len(parts) == 2:
                env[parts[0].strip().strip('"').strip("'")] = parts[1].strip().strip('"').strip("'")

app_id = env.get("LARK_APP_ID")
app_secret = env.get("LARK_APP_SECRET")
token = env.get("LARK_SPREADSHEET_TOKEN")

url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
headers = {"Content-Type": "application/json; charset=utf-8"}
data = json.dumps({"app_id": app_id, "app_secret": app_secret}).encode('utf-8')
context = ssl._create_unverified_context()
req = urllib.request.Request(url, data=data, headers=headers, method="POST")
with urllib.request.urlopen(req, context=context) as r:
    access_token = json.loads(r.read().decode('utf-8')).get("tenant_access_token")

# Get metainfo
meta_url = f"https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{token}/metainfo"
meta_headers = {"Authorization": f"Bearer {access_token}"}
meta_req = urllib.request.Request(meta_url, headers=meta_headers, method="GET")

print("Spreadsheet Token:", token)
try:
    with urllib.request.urlopen(meta_req, context=context) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Metainfo Response:")
        print(json.dumps(res, indent=2, ensure_ascii=False))
except Exception as e:
    print("Error calling metainfo:", e)
