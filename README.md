# Easy Case Management (簡易案件管理系統)

一個基於 React + Vite + Supabase 打造的現代化案件管理系統，提供使用者與管理員完善的案件追蹤、時間軸事件紀錄與權限管理功能。

## 🌟 核心功能 (Key Features)

### 1. 權限與使用者管理 (Authentication & Authorization)
- **登入與註冊**：整合 Supabase Auth，安全的會員註冊與登出入機制。
- **角色權限機制**：
  - **一般使用者 (User)**：可瀏覽案件、建立新案件、新增案件事件與時間軸。
  - **管理員 (Admin)**：具備最高權限，可管理使用者帳號狀態、審核新用戶，並擁有案件的批次刪除與強制刪除功能。
- **審核機制**：新註冊的使用者狀態為 Pending (待審核)，需由管理員批准後方可登入使用系統。

### 2. 案件管理 (Case Management)
- **案件列表**：提供直覺的卡片式案件檢視，支援搜尋功能。
- **案件 CRUD**：建立、讀取、更新與刪除完整的案件生命週期管理。
- **批次操作**：管理員專屬的批次選擇與刪除功能，加速管理流程。

### 3. 事件時間軸 (Event Timeline)
- **事件追蹤**：支援在每個案件底下新增子事件與進度更新。
- **時間軸檢視**：以視覺化的時間軸呈現案件的歷史發展軌跡與最新狀態。

### 4. 測試資料管理
- 提供快速寫入測試資料 (Seed) 與清除測試資料的輔助工具 (僅限管理員)。

---

## 🛠️ 技術架構 (Tech Stack)

- **前端框架**：[React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **建置工具**：[Vite](https://vitejs.dev/)
- **路由管理**：[React Router DOM v7](https://reactrouter.com/)
- **樣式與 UI**：[Tailwind CSS v4](https://tailwindcss.com/) + [@heroicons/react](https://heroicons.com/)
- **後端與資料庫**：[Supabase](https://supabase.com/) (PostgreSQL 關聯式資料庫 + 身分驗證機制)
- **日期處理**：[date-fns](https://date-fns.org/)

---

## 📂 專案目錄結構 (Directory Structure)

```text
src/
├── components/       # 共用與 UI 模組化元件 (CaseCard, SearchBar, Timeline, 等)
├── context/          # React Context 狀態管理 (AuthContext, 等)
├── pages/            # 頁面級別元件 (Login, Register, CaseList, CaseDetail, UserManagement, 等)
├── services/         # 外部 API 與連線設定 (supabaseClient.ts, 等)
├── types/            # TypeScript 型別定義檔 (database.ts, 等)
├── utils/            # 共用工具函式 (seedDatabase.ts, 等)
├── App.tsx           # 應用程式主進入點與路由配置
└── main.tsx          # React 掛載點
```

---

## 🚀 安裝與執行 (Installation & Setup)

### 先決條件 (Prerequisites)
- [Node.js](https://nodejs.org/) (建議 v18 以上版本)
- npm, yarn, 或 pnpm

### 1. 取得專案代碼

```bash
git clone <repository-url>
cd Easy-Case-Management
```

### 2. 安裝相依套件

```bash
npm install
```

### 3. 設定環境變數

請在專案根目錄建立一個 `.env` 檔案，並填入由 Supabase 專案中取得的對應金鑰：

```env
VITE_SUPABASE_URL=你的_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```

> **注意**：請確保配置好 Supabase 中的 Database 表格 (如 `cases`, `profiles`, `case_events` 等) 以及 Row Level Security (RLS) 規則，以確保功能正常運作。

### 4. 啟動開發伺服器

```bash
npm run dev
```

啟動後，開啟瀏覽器並造訪命令列提示的網址 (通常為 `http://localhost:5173`)。

---

## 📜 常用指令 (Scripts)

- `npm run dev`：啟動具備 Hot-Module-Replacement (HMR) 的本地開發伺服器。
- `npm run build`：將應用程式編譯打包為正式連線使用的靜態檔案。
- `npm run preview`：在本地端預覽剛剛 build 出來的正式版檔案。
- `npm run lint`：執行 ESLint 語法檢查。
