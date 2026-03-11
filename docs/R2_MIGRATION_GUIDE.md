# R2 遷移操作指南

本指南說明如何將既有 Supabase Storage 的附件檔案遷移到 Cloudflare R2 (private)，並更新 `attachments` 資料表。

## 1. 前置條件

- 已建立 R2 bucket（private）
- 已在 Supabase 設定 Secrets：
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET`
- 已部署 Edge Functions：
  - `attachments-upload-url`
  - `attachments-download-url`
  - `attachments-delete`
- 已套用 migration：
  - `20260311090000_attachments_r2.sql`

## 2. 遷移策略

### 選項 A：保留舊檔，僅新上傳走 R2（最安全）
- 不搬舊檔
- `attachments.file_url` 仍可下載舊檔
- 新檔上傳寫入 `storage_provider='r2'` + `storage_key`

### 選項 B：搬移舊檔到 R2（完整切換）
- 需要寫搬移 script
- 搬移後更新 `attachments`：
  - `storage_provider='r2'`
  - `storage_key` 填入 R2 物件 key
  - `file_url` 可清空

## 3. 建議搬移流程（選項 B）

1. 匯出 attachments 清單
   - 來源：`attachments.file_url`（Supabase Storage public URL）
2. 將檔案下載到本地暫存
3. 上傳到 R2
4. 更新 `attachments.storage_provider` / `storage_key`

## 4. 範例 SQL 更新

```sql
update public.attachments
set storage_provider = 'r2',
    storage_key = 'case-id/uuid/filename.pdf'
where id = '<attachment_id>';
```

## 5. 驗證項目

- 前端下載可正常取得 signed URL
- 下載後檔案可開啟
- 舊檔若未搬移仍能透過 `file_url` 下載

## 6. 回滾策略

若搬移後發現問題：
- 保留原本 `file_url`
- 將 `storage_provider` 設回 `supabase` 或清空 `storage_key`

## 7. 建議的自動化工具

若要大量遷移，建議用下列方式之一：
- Node.js script (AWS SDK S3 + Supabase client)
- Python script (boto3 + Supabase REST)
- Cloudflare R2 工具鏈 (rclone / s3cmd)
