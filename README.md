# MarathiPatrikaMakers — Vercel deployment

Marathi biodata builder with 24 designs, free watermarked PDF/PNG exports, and ₹49 Razorpay-verified watermark-free downloads.

## Deploy

1. Import this folder into Vercel. Select framework **Other** and Node.js **24.x**.
2. Keep the project root as the root directory. The included `vercel.json` builds the public pages and routes `/api/*` to one Node function.
3. Set the variables below in Vercel Settings → Environment Variables. Use **Preview** and **Production** only where appropriate, then redeploy.
4. Test free PDF/PNG exports and a Razorpay **test-mode** checkout on the deployed URL before considering live payments.

No database, Redis, webhook, server-side draft store, or `.env` file is required in production. Free exports work with no payment variables.

| Variable | Purpose |
| --- | --- |
| `APP_ORIGIN` | Exact public HTTPS origin, such as `https://your-domain.in`, with no path. Set it for the canonical custom domain; Vercel deployment URLs are supported automatically. |
| `PAYMENTS_ENABLED` | Set to `true` only for a configured Razorpay test or explicitly approved live checkout. Omit it or set `false` to keep clean downloads disabled. |
| `RAZORPAY_KEY_ID` | Razorpay key ID. The code recognizes `rzp_test_…` and `rzp_live_…` IDs only. |
| `RAZORPAY_KEY_SECRET` | Matching private Razorpay key secret. Never expose it to the browser or commit it. |
| `PAYMENT_TOKEN_SECRET` | A persistent random secret of at least 32 characters. It signs the short-lived order and download authorizations. |
| `ALLOW_LIVE_PAYMENTS` | Leave unset while testing. Set to `true` only after a successful test-mode checkout and the live-payment checklist below has been completed. Required with an `rzp_live_…` key. |

`RAZORPAY_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` are intentionally not used. Do not add a Razorpay webhook for this version.

## Payment security and data handling

1. The server normalizes the draft, checks it can render, hashes it, and creates a Razorpay order for exactly **4900 paise / INR**.
2. It returns a signed order token that binds that Razorpay order to the draft hash for 15 minutes. The full draft stays only in the browser; it is not placed in the token or stored by the application.
3. After checkout, the server verifies Razorpay's checkout signature and fetches the payment directly from Razorpay. The payment must be captured, for that exact order, for exactly 4900 paise in INR, and have no refunded amount.
4. Only then does it issue a separate signed download authorization, valid for 30 minutes. Every clean export rechecks Razorpay and accepts only the draft whose hash is bound to that authorization.

This design deliberately does not support recovering a clean file after the short authorization expires or after the original browser draft is changed/lost. Keep the draft in the browser or use the built-in backup before paying. That trade-off keeps personal biodata and photos out of an application database.

The Razorpay key ID is public by design for Checkout; `RAZORPAY_KEY_SECRET` and `PAYMENT_TOKEN_SECRET` are never sent to the browser. Signed tokens are bearer authorizations, so use HTTPS, keep their lifetime short, and do not log request bodies.

## Test mode, then live mode

The server refuses a live `rzp_live_…` key unless `ALLOW_LIVE_PAYMENTS=true` is also set. This is an intentional safety gate; changing environment variables is the merchant's explicit live-payment decision.

Before setting that flag:

- Deploy with `rzp_test_…` credentials and `PAYMENTS_ENABLED=true`.
- Complete a real Razorpay test payment on the deployed Vercel URL.
- Confirm the returned PDF and PNG have no watermark, the free files still have a watermark, and a changed draft is rejected.
- Confirm the merchant identity, contact details, terms, privacy notice, and refund policy are published and accurate.
- Switch to matching `rzp_live_…` credentials, set `ALLOW_LIVE_PAYMENTS=true`, and redeploy deliberately.

Never put a test key in a production live deployment or a live secret in Preview. No live key or payment was enabled by this code change.

## Development and checks

```sh
npm install
npm test
npm run build
npm run test:render
```

`npm test` uses a fake Razorpay gateway only: it does not call Razorpay or charge money. It covers token expiry/tampering, order/amount/currency matching, captured-payment checks, refund checks, cross-origin rejection, and clean-download draft binding. `npm run test:render` exercises the server-side PDF/PNG renderer.

Optional local development: `npm start`. Environment variables come from the shell; production never needs the Windows launchers.

## Architecture

The static build contains only the explicitly allowlisted public pages, scripts, styles, and assets. Private server code and environment variables are excluded. A Vercel Node function handles API routes. Bundled Linux Chromium renders PDF/PNG using temporary runtime storage.

In-memory request throttling applies only to a single function instance; use Vercel Firewall for shared traffic limits. Large image uploads or exports can exceed Vercel request limits, so keep uploaded images modest. Original asset details and font licensing are in `DEITY_ASSETS.md` and `assets/OFL.txt`.

## GitHub checks

GitHub Actions installs dependencies, checks the Razorpay SDK interface, runs the isolated payment tests, builds the public assets, and smoke-tests PDF/PNG generation. Do not upload `node_modules`, `.data`, `.env` files, public build output, or test artifacts; `.gitignore` excludes them.
