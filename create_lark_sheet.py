#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
普新精舍 60期夜間初級禪修班——自動建立並初始化飛書執事試算表
利用飛書 API 建立一個全新的試算表，從 data.js 讀取現有排班並寫入，最後將新 Token 寫入 .env 中。
"""

import os
import re
import json
import urllib.request
import urllib.parse
import ssl

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

def update_env_token(token, sheet_title):
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        return
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if line.startswith('LARK_SPREADSHEET_TOKEN='):
            new_lines.append(f'LARK_SPREADSHEET_TOKEN="{token}"\n')
        elif line.startswith('LARK_SHEET_RANGE='):
            new_lines.append(f'LARK_SHEET_RANGE="{sheet_title}!A1:C200"\n')
        else:
            new_lines.append(line)
            
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("📝 [Success] 已自動將新試算表 Token 與預設 Range 寫入本地 .env 檔案中！")

def get_tenant_access_token(app_id, app_secret):
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    headers = {"Content-Type": "application/json; charset=utf-8"}
    data = json.dumps({"app_id": app_id, "app_secret": app_secret}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=context) as response:
        res = json.loads(response.read().decode('utf-8'))
        return res.get("tenant_access_token")

# 建立新試算表
def create_spreadsheet(access_token, title):
    url = "https://open.feishu.cn/open-apis/sheets/v3/spreadsheets"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    data = json.dumps({
        "title": title
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(req, context=context) as response:
        res = json.loads(response.read().decode('utf-8'))
        if res.get("code") == 0:
            sheet_data = res.get("data", {}).get("spreadsheet", {})
            return sheet_data.get("spreadsheet_token"), sheet_data.get("url")
        else:
            print("❌ 建立試算表失敗:", res.get("msg"))
            return None, None

# 獲取試算表中的分頁資訊 (利用 V2 Metainfo API)
def get_first_sheet_info(access_token, token):
    url = f"https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{token}/metainfo"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    req = urllib.request.Request(url, headers=headers, method="GET")
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, context=context) as response:
            res = json.loads(response.read().decode('utf-8'))
            if res.get("code") == 0:
                sheets = res.get("data", {}).get("sheets", [])
                if sheets:
                    return sheets[0].get("sheetId"), sheets[0].get("title")
    except Exception as e:
        print("⚠️ 讀取分頁 metadata 發生異常:", e)
    return "0", "Sheet1"

# 設定試算表為公開連結分享 (任何人可閱讀/編輯)
def set_sheet_public(access_token, token):
    url = f"https://open.feishu.cn/open-apis/drive/v1/permissions/{token}/public"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    data = json.dumps({
        "link_share_entity": "anyone",
        "share_entity": "anyone",
        "external_access": True,
        "security_entity": "anyone"
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method="PATCH")
        context = ssl._create_unverified_context()
        urllib.request.urlopen(req, context=context)
        print("🔓 [Success] 試算表已成功設定為公開連結協作分享！")
    except Exception as e:
        print("⚠️ 無法自動設定為公開協作，這通常需要您在飛書後台給予該 App '雲端硬碟' 的相關權限。您也可以手動在分享中設定。")

# 寫入初始排班數據 (使用 V2 values 寫入 API，以 sheet_id 作為 Range)
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
            print(f"✅ [Success] 已成功將 {len(values) - 1} 筆初始執事角色寫入飛書試算表中！")
        else:
            print("❌ 寫入試算表失敗:", res.get("msg"))

# 從 data.js 讀取現有排班資料
def parse_current_roles():
    data_js_path = os.path.join(os.path.dirname(__file__), 'data.js')
    if not os.path.exists(data_js_path):
        return []
    
    with open(data_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    role_pattern = r'\{\s*id:\s*["\']([^"\']+)["\'],\s*title:\s*["\']([^"\']+)["\'],\s*assignee:\s*["\']([^"\']+)["\']'
    matches = re.findall(role_pattern, content)
    
    values = [["角色 ID", "職稱", "指派人員"]]
    for role_id, title, assignee in matches:
        values.append([role_id, title, assignee])
        
    return values

def main():
    print("🎬 [Start] 啟動飛書試算表自動建立程式...")
    env = load_env()
    if not env:
        return
        
    app_id = env.get("LARK_APP_ID")
    app_secret = env.get("LARK_APP_SECRET")
    
    access_token = get_tenant_access_token(app_id, app_secret)
    
    title = "60期夜間初級禪修班——結業典禮執事分配表"
    print(f"🚀 正在飛書中建立新試算表: '{title}'...")
    token, url = create_spreadsheet(access_token, title)
    
    if token and url:
        print(f"🎉 建立成功！\nSpreadsheet Token: {token}\nSpreadsheet URL: {url}")
        
        # 獲取分頁資訊 (利用 V2 Metainfo 獲取精確的 sheetId)
        sheet_id, sheet_title = get_first_sheet_info(access_token, token)
        print(f"📝 偵測到預設分頁 - ID: {sheet_id} | 標題: {sheet_title}")
        
        # 嘗試開啟公開分享
        set_sheet_public(access_token, token)
        
        # 讀取並寫入資料 (以精確的 sheetId 作為範圍前綴)
        roles_values = parse_current_roles()
        if len(roles_values) > 1:
            write_sheet_values(access_token, token, sheet_id, roles_values)
        else:
            print("⚠️ 未能在 data.js 中解析到任何執事角色。")
            
        # 更新 .env 檔案 (寫入真實的 sheet_title，以便使用者後續同步時使用)
        update_env_token(token, sheet_title)
        print("\n✨ [Done] 飛書自動建表作業已全部圓滿完成！")
        print(f"🔗 請直接點擊此連結開啟您的飛書試算表：\n{url}")
    else:
        print("❌ 無法建立飛書試算表。")

if __name__ == "__main__":
    main()
