#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
普新精舍 60期夜間初級禪修班——手動同步本地 data.js 數據寫回飛書雲端試算表
"""

import os
import re
import json
import urllib.request
import urllib.parse
import ssl
import sys

def load_env():
    env = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print("❌ [Error] 找不到 .env 檔案！")
        return None
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split('=', 1)
                if len(parts) == 2:
                    key = parts[0].strip().strip('"').strip("'")
                    val = parts[1].strip().strip('"').strip("'")
                    env[key] = val
    return env

def get_tenant_access_token(app_id, app_secret):
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    headers = {"Content-Type": "application/json; charset=utf-8"}
    data = json.dumps({"app_id": app_id, "app_secret": app_secret}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=context) as response:
        res = json.loads(response.read().decode('utf-8'))
        return res.get("tenant_access_token")

# 從 data.js 讀取現有排班資料
def parse_current_roles():
    data_js_path = os.path.join(os.path.dirname(__file__), 'data.js')
    if not os.path.exists(data_js_path):
        print("❌ [Error] 找不到 data.js 檔案！")
        sys.exit(1)
    
    with open(data_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    role_pattern = r'\{\s*id:\s*["\']([^"\']+)["\'],\s*title:\s*["\']([^"\']+)["\'],\s*assignee:\s*["\']([^"\']+)["\']'
    matches = re.findall(role_pattern, content)
    
    values = [["角色 ID", "職稱", "指派人員"]]
    for role_id, title, assignee in matches:
        values.append([role_id, title, assignee])
        
    return values

# 寫入初始排班數據
def write_sheet_values(access_token, token, sheet_id, values):
    range_str = f"{sheet_id}!A1:C{len(values)}"
    url = f"https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{token}/values"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    data = json.dumps({
        "valueRange": {
            "range": range_str,
            "values": values
        }
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method="PUT")
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=context) as response:
        res = json.loads(response.read().decode('utf-8'))
        if res.get("code") == 0:
            print(f"✅ [Success] 已成功將 {len(values) - 1} 筆排班資料同步回寫至飛書試算表中！")
        else:
            print("❌ 寫入試算表失敗:", res.get("msg"))

def main():
    print("🎬 [Start] 啟動本地 data.js 寫回飛書雲端同步...")
    env = load_env()
    if not env:
        return
        
    app_id = env.get("LARK_APP_ID")
    app_secret = env.get("LARK_APP_SECRET")
    token = env.get("LARK_SPREADSHEET_TOKEN")
    sheet_id = env.get("LARK_SHEET_ID", "2168c9")
    
    print(f"🔑 app_id: {app_id}")
    print(f"📊 spreadsheet token: {token}")
    print(f"📄 sheet_id: {sheet_id}")
    
    access_token = get_tenant_access_token(app_id, app_secret)
    roles_values = parse_current_roles()
    
    if len(roles_values) > 1:
        print(f"📝 解析到 {len(roles_values) - 1} 筆本地執事指派，開始寫入...")
        write_sheet_values(access_token, token, sheet_id, roles_values)
    else:
        print("⚠️ 未能在 data.js 中解析到任何執事角色。")
        
    print("🏁 [Done] 雲端同步完成！")

if __name__ == "__main__":
    main()
