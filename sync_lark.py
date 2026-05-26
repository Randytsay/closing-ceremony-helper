#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
普新精舍 60期夜間初級禪修班——結業典禮飛書 (Feishu/Lark) 試算表自動化同步腳本
讀取本地 .env 憑證，拉取飛書試算表資料，動態生成 data.js 並自動 Git Pushed 部署至 Vercel。
"""

import os
import re
import sys
import json
import urllib.request
import subprocess

# 1. 讀取本地 .env 檔案
def load_env():
    env = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print("❌ [Error] 找不到 .env 檔案，請複製 .env.example 並設定您的飛書金鑰！")
        sys.exit(1)
        
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

# 2. 獲取飛書 Tenant Access Token
def get_tenant_access_token(app_id, app_secret):
    url = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal"
    headers = {
        "Content-Type": "application/json; charset=utf-8"
    }
    data = json.dumps({
        "app_id": app_id,
        "app_secret": app_secret
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            if res_body.get("code") == 0:
                print("✅ [Success] 飛書認證成功，順利取得 Tenant Access Token！")
                return res_body.get("tenant_access_token")
            else:
                print(f"❌ [Error] 飛書認證失敗: {res_body.get('msg')} (code: {res_body.get('code')})")
                sys.exit(1)
    except Exception as e:
        print(f"❌ [Error] 呼叫飛書認證 API 發生異常: {e}")
        sys.exit(1)

# 3. 讀取飛書試算表單格值
def fetch_spreadsheet_values(token, sheet_range, access_token):
    # 對 range 進行 URL 編碼
    encoded_range = urllib.parse.quote(sheet_range)
    url = f"https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{token}/values/{encoded_range}"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            if res_body.get("code") == 0:
                print(f"✅ [Success] 順利讀取飛書試算表數據！範圍: {sheet_range}")
                return res_body.get("data", {}).get("valueRange", {}).get("values", [])
            else:
                print(f"❌ [Error] 讀取飛書試算表失敗: {res_body.get('msg')} (code: {res_body.get('code')})")
                if res_body.get("code") == 10615:
                    print("💡 提示: 請確保您已將此飛書自建應用加入至該試算表的「協作者分享名冊」中，並給予「可閱讀」權限！")
                sys.exit(1)
    except Exception as e:
        print(f"❌ [Error] 呼叫讀取飛書試算表 API 發生異常: {e}")
        sys.exit(1)

# 4. 更新 data.js 檔案
def update_data_js(sheet_rows):
    if not sheet_rows:
        print("⚠️ [Warning] 飛書試算表回傳空數據，未進行 data.js 的更新。")
        return
        
    # 表頭過濾：排除第一行如果是 "角色 ID" 或 "角色ID" 的標題行
    if sheet_rows[0] and ("角色" in str(sheet_rows[0][0]) or "ID" in str(sheet_rows[0][0])):
        data_rows = sheet_rows[1:]
    else:
        data_rows = sheet_rows

    data_js_path = os.path.join(os.path.dirname(__file__), 'data.js')
    if not os.path.exists(data_js_path):
        print("❌ [Error] 找不到 data.js 檔案，請確保在本專案目錄下執行！")
        sys.exit(1)

    with open(data_js_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取所有指派的人名，以更新 defaultVolunteers 陣列
    unique_names = set()
    update_count = 0

    for row in data_rows:
        if len(row) >= 3:
            role_id = str(row[0]).strip()
            role_title = str(row[1]).strip()
            assignee = str(row[2]).strip()
            
            if role_id and assignee:
                # 收集非預設標記的人名
                names = re.split(r'[,、.\s]', assignee)
                for n in names:
                    trimmed = n.strip()
                    if trimmed and trimmed not in ["XXX", "學長團隊", "課務團隊", "全體義工團隊", "學員代表", "12位學員長", "各組學員長", "課務長"]:
                        unique_names.add(trimmed)
                
                # 5. 使用正則表達式，精準更新 data.js 中對應 role_id 的 assignee 值
                # 比對格式: { id: "role_id", ..., assignee: "...", ... }
                pattern = r'(\{\s*id:\s*["\']' + re.escape(role_id) + r'["\'],[^{}]*assignee:\s*["\'])([^"\']*)(["\'])'
                content, count = re.subn(pattern, r'\g<1>' + assignee.replace('\\', '\\\\') + r'\g<3>', content)
                if count > 0:
                    update_count += count

    print(f"🔄 [Info] 已在 data.js 中成功更新了 {update_count} 處執事人員指派！")

    # 6. 動態更新 defaultVolunteers 陣列
    if unique_names:
        sorted_names = sorted(list(unique_names))
        # 產生格式化的 JS 陣列人名單
        volunteers_js_str = "defaultVolunteers: [\n    "
        volunteers_js_str += ",\n    ".join([f'"{name}"' for name in sorted_names])
        volunteers_js_str += "\n  ]"
        
        # 正則替換 defaultVolunteers: [ ... ]
        content, count = re.subn(r'defaultVolunteers:\s*\[[^\]]*\]', volunteers_js_str, content)
        if count > 0:
            print(f"👥 [Info] 已自動更新名單庫 (defaultVolunteers)，共收錄 {len(sorted_names)} 位人員！")

    # 寫回 data.js
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("💾 [Success] data.js 已安全寫入本地磁碟！")

# 7. 自動 Git 提交與 Push 部署
def auto_git_deploy():
    try:
        # 檢查是否有 data.js 變更
        status = subprocess.run(["git", "status", "--porcelain", "data.js"], capture_output=True, text=True)
        if not status.stdout.strip():
            print("🧘 [Info] 本地 data.js 未發生任何變更，無需 Push 至雲端發布。")
            return
            
        print("🚀 [Info] 偵測到本地排班變更，正在自動提交並推送至 GitHub 倉庫...")
        subprocess.run(["git", "add", "data.js"], check=True)
        subprocess.run(["git", "commit", "-m", "chore: auto-sync volunteer roster from Feishu Sheet"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("🎉 [Deploy] 推送成功！Vercel 正式啟動秒級雲端重新編譯發布！")
    except Exception as e:
        print(f"⚠️ [Warning] 自動 Git 發布失敗 (可能未設定 SSH 金鑰或遠端權限): {e}")
        print("💡 您仍可手動執行 git add data.js && git commit && git push 進行發布。")

def main():
    print("🎬 [Start] 啟動飛書試算表自動同步程式...")
    env = load_env()
    
    app_id = env.get("LARK_APP_ID")
    app_secret = env.get("LARK_APP_SECRET")
    token = env.get("LARK_SPREADSHEET_TOKEN")
    sheet_range = env.get("LARK_SHEET_RANGE", "Sheet1!A1:C100")
    
    if not token or "[請填入" in token:
        print("❌ [Error] 請在本地 .env 檔案中設定正確的 LARK_SPREADSHEET_TOKEN！")
        sys.exit(1)
        
    access_token = get_tenant_access_token(app_id, app_secret)
    sheet_rows = fetch_spreadsheet_values(token, sheet_range, access_token)
    
    update_data_js(sheet_rows)
    auto_git_deploy()
    print("🏁 [Done] 同步與自動發布作業已圓滿完成！")

if __name__ == "__main__":
    main()
