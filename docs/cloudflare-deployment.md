# Cloudflare Hosting Guide: SmartPOS Business Front

This guide provides step-by-step instructions for hosting and deploying **`smartpos-business-front`** on **Cloudflare Frontends** using **OpenNext for Cloudflare (`@opennextjs/cloudflare`)** and **Wrangler**.

---

## 1. Overview & Architecture

* **Framework**: Next.js 16 (App Router)
* **Hosting Platform**: Cloudflare Workers / Pages
* **Adapter**: `@opennextjs/cloudflare`
* **Features Supported**:
  * Edge Middleware & Route Protection (`proxy.ts`)
  * Backend API Reverse Proxy (`app/api/proxy/[...path]`)
  * Client-side Hydration & Zustand Stores
  * Global CDN Caching & Edge Security Headers

---

## 2. Cloudflare Dashboard Setup (Git Integration)

Follow these exact steps from your Cloudflare Dashboard (logged in as `Codebridge2026@...`):

### Step 1: Start Application Setup
1. In your Cloudflare Dashboard home screen, locate the **"Ship something new"** card.
2. Click the **Create app** button (or navigate to **Compute > Workers & Pages** on the left menu).
3. Choose **Pages** tab and click **Connect to Git**.

### Step 2: Connect Your GitHub Account
1. Under Git provider, select **GitHub**.
2. If prompted, authorize Cloudflare to access your GitHub account **`codebridgeService`**.
3. Choose **Only select repositories** and select:
   * **`codebridgeService/smartpos-business-front`**
4. Click **Begin setup**.

### Step 3: Configure Build Settings
Fill in the deployment details:
* **Project name**: `smartpos-business-front` (or your preferred subdomain)
* **Production branch**: `master`
* **Framework preset**: `Next.js` (or `None`)
* **Build command**:
  ```bash
  npx opennextjs-cloudflare build
  ```
* **Build output directory**:
  ```text
  .open-next/assets
  ```
* **Root directory**: `/` (leave empty or default)

### Step 4: Configure Environment Variables
Under **Environment variables (Advanced)**, add the following variables for the Production environment:

| Variable Name | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://smartpos-api.servicefixit.me/api/v1` | Backend API base endpoint |
| `NEXT_PUBLIC_APP_NAME` | `SmartPOS Business` | Application Title |
| `NEXT_PUBLIC_APP_ENV` | `production` | Deployment Environment |
| `NEXT_PUBLIC_DEFAULT_DEVICE_TYPE` | `browser` | POS Client Device Type |
| `NEXT_PUBLIC_DEFAULT_PLATFORM` | `web` | POS Platform |
| `NODE_VERSION` | `20` | Ensures Node.js 20+ runtime for builds |

### Step 5: Save and Deploy
1. Click **Save and Deploy**.
2. Cloudflare will clone the `smartpos-business-front` repository, install dependencies, run the OpenNext build, and publish the worker and assets globally to a `*.pages.dev` or `*.workers.dev` URL.

---

## 3. Alternative: Local CLI Deployment with Wrangler

If you prefer deploying directly from your terminal:

1. **Log in to Cloudflare**:
   ```bash
   npx wrangler login
   ```
   *This will open your browser to authorize Wrangler with your `Codebridge2026@...` Cloudflare account.*

2. **Run the build and deploy command**:
   ```bash
   npm run deploy
   ```
   *This executes `opennextjs-cloudflare build` and deploys the worker and static assets using `wrangler.jsonc`.*

---

## 4. Custom Domain Setup

Once deployed:
1. In Cloudflare Dashboard, go to your project under **Compute > Workers & Pages**.
2. Click **Custom domains** tab.
3. Click **Set up a custom domain** (e.g. `pos.codebridge.me` or `app.yourdomain.com`).
4. Cloudflare will automatically provision SSL/TLS certificates and configure DNS records.
