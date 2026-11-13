# MarathiPatrikaMakers — Vercel deployment

Marathi biodata builder with 24 designs, PDF/PNG exports, and Razorpay-verified clean downloads.

## Deploy

1. Import this folder into Vercel. Select framework **Other** and Node.js **24.x**.
2. Keep the project root as the root directory. The included vercel.json sets the build command, public output, and API routing.
3. Set environment variables below in Vercel Settings → Environment Variables, then deploy.
4. Test free PDF/PNG exports and Razorpay test-mode checkout on the deployed URL before using live keys. Redeploy after changing variables.

No local server, SQLite file, browser installation, or .env file is required for production.

| Variable | Purpose |
| --- | --- |
| APP_ORIGIN | Exact public HTTPS origin, e.g. https://your-project.vercel.app, without a path. Set this for custom domains; otherwise defaults to the Vercel deployment URL. |
| SESSION_SECRET | Persistent random secret of at least 32 characters. Required for payments. |
| PAYMENTS_ENABLED | Set true to enable configured payments; unset or false disables checkout. |
| RAZORPAY_KEY_ID | Test/live Razorpay key ID. |
| RAZORPAY_KEY_SECRET | Matching private key secret. |
| RAZORPAY_WEBHOOK_SECRET | Secret configured for your webhook. |
| UPSTASH_REDIS_REST_URL | Durable Upstash Redis REST endpoint, from Upstash or Vercel Marketplace. |
| UPSTASH_REDIS_REST_TOKEN | Private REST token for that database. |

Free exports work without payment credentials or Redis. Checkout remains disabled until all payment variables, the session secret and Redis are configured. Configure the Razorpay webhook at https://YOUR-DOMAIN/api/payment/webhook and subscribe to payment.captured.

Paid orders store an immutable biodata snapshot in Redis for 30 days. Signed session cookies bind orders to the same browser. Each paid download checks captured status, exact amount (4900 paise), currency, order identity and refunds against Razorpay. Changing the session secret or deleting cookies prevents recovery.

## Architecture

Static output contains only explicitly allowed public pages, scripts, styles and assets. Private server files and stored orders are excluded. A Node serverless function handles /api routes. Bundled Linux Chromium renders PDF/PNG using temporary runtime storage. In-memory rate limiting applies per instance; use Vercel Firewall for shared traffic limits. Large image uploads or exports can exceed Vercel payload limits; use smaller images.

## Development and checks

```sh
npm install
npm test
npm run build
```

Dependencies are pinned in package.json. Run npm install and commit the generated package-lock.json before switching CI to npm ci. The previous lockfile was removed because it described the old dependencies; this environment could not reach npm to regenerate it.

Optional local development: npm start. Uses Edge by default; BROWSER_EXECUTABLE_PATH or BROWSER_CHANNEL can select another installed browser. Environment variables come from the shell, with no .env loading. Production never needs npm start or the Windows launchers.

Payment-flow tests invoke the function directly with a fake gateway and test-only memory storage, without real transactions. Browser checks use npm run test:browser against TEST_ORIGIN, which defaults to the development address.

Publish merchant contact details, terms and refund policy before accepting live payments. Drafts remain in browser storage; Redis order snapshots contain personal data and photos, so restrict database access. Original asset details and font licensing are documented in DEITY_ASSETS.md and assets/OFL.txt.

## GitHub checks

The official razorpay Node SDK handles server-side order creation and payment fetches. Private credentials remain in Vercel environment variables. The browser checkout script is loaded directly from Razorpay.

GitHub Actions installs dependencies, checks the SDK API, runs payment tests, builds public assets, and smoke-tests PDF/PNG generation with the Linux serverless browser. Mocked tests do not charge money or validate a live merchant account. Run a Razorpay test-mode checkout on Vercel before enabling live payments.

Do not upload node_modules, .data, .env files, public build output, or test artifacts; .gitignore excludes them. The project is prepared for GitHub with automated checks and Vercel configuration.
