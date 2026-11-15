# MarathiPatrikaMakers — Vercel deployment

Marathi biodata builder with 56 general, 15 Buddhist, 16 Islamic, and 15 Christian designs, free watermarked PDF/PNG exports, and ₹35 Razorpay-verified watermark-free downloads.

The वर्षश्राद्ध invitation gallery includes six designs and a separate editor with an optional photo, editable and reorderable text fields, and additional custom fields. Its PDF/PNG exports use the same paid session as the biodata builders. The invitation uses the bundled Noto Devanagari font; an AMS font is not included in the project.

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

Use the exact name `PAYMENT_TOKEN_SECRET`: `SESSION_SECRET` does not enable payments in this version. If it is missing or shorter than 32 characters, paid downloads remain disabled.

## Search and visitor analytics

- The preferred production address is `https://www.vivahpatrikamaker.in/`. In Vercel, attach and verify this domain and configure the non-`www` domain to redirect to it. Set production `APP_ORIGIN` to this exact origin and redeploy. Preview domains remain usable and are not redirected by the application.
- After deployment, check that `/robots.txt` and `/sitemap.xml` return HTTP 200 on the production domain. Verify ownership in Google Search Console, submit `https://www.vivahpatrikamaker.in/sitemap.xml`, and inspect the homepage and important template pages. Crawling, indexing and rankings are controlled by Google and are not guaranteed.
- Enable **Web Analytics** in the Vercel project dashboard and redeploy to provision its analytics endpoint. The HTML pages load the Vercel analytics script on the configured production or Vercel preview host; local development does not send analytics. The analytics filter removes URL query strings and fragments before page-view events are sent, and does not send biodata fields or photos as custom events. See the privacy page for the disclosure.
- The site also loads Google Tag Manager container `GTM-NL5L5P6N` on every page. Configure and publish the required Google Analytics tag or other tags in that container, then use Tag Assistant to verify delivery. Avoid configuring form-value, photo, or other personal-information collection. Vercel Analytics URL redaction does not apply to tags configured in Google Tag Manager; review their settings separately.
- After deployment, test both free and paid PDF/PNG exports, including the year-anniversary invitation, with Razorpay test credentials. Browser and serverless rendering depend on Chromium and fonts and cannot be verified solely by the unit tests.

## Payment security and data handling

1. The server normalizes the draft, checks it can render, hashes it, and creates a Razorpay order for exactly **3500 paise / INR**.
2. It returns a signed order token that binds that Razorpay order to the draft hash for 60 minutes. The full draft stays only in the browser; it is not placed in the token or stored by the application.
3. After checkout, the server verifies Razorpay's checkout signature and fetches the payment directly from Razorpay. The payment must be captured, for that exact order, for exactly 3500 paise in INR, and have no refunded amount. Previously signed ₹49 orders are honored until their existing authorization expires.
4. Only then does it issue a separate signed download authorization, valid for 15 minutes from the payment creation time reported by Razorpay. Every clean export rechecks Razorpay, and the authorization accepts edited drafts and different templates or builder profiles. Rechecking payment status cannot extend the deadline.

The active purchase is stored in the same browser tab and can be recovered there until it expires. After 15 minutes a new payment is needed for clean downloads. The timer starts when Razorpay creates the payment, so a delayed payment capture leaves less time. Keep a draft backup if needed; personal biodata and photos are not stored in an application database.

The Razorpay key ID is public by design for Checkout; `RAZORPAY_KEY_SECRET` and `PAYMENT_TOKEN_SECRET` are never sent to the browser. Signed tokens are bearer authorizations, so use HTTPS, keep their lifetime short, and do not log request bodies.

## Test mode, then live mode

The server refuses a live `rzp_live_…` key unless `ALLOW_LIVE_PAYMENTS=true` is also set. This is an intentional safety gate; changing environment variables is the merchant's explicit live-payment decision.

Before setting that flag:

- Deploy with `rzp_test_…` credentials and `PAYMENTS_ENABLED=true`.
- Complete a real Razorpay test payment on the deployed Vercel URL.
- Confirm the returned PDF and PNG have no watermark, the free files still have a watermark, and edited drafts and different templates download during the session; confirm expiry requires a new payment.
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

`npm test` uses a fake Razorpay gateway only: it does not call Razorpay or charge money. It covers token expiry/tampering, order/amount/currency matching, captured-payment checks, refund checks, cross-origin rejection, and the fixed-duration clean-download session. `npm run test:render` exercises the server-side PDF/PNG renderer.

Optional local development: `npm start`. Environment variables come from the shell; production never needs the Windows launchers.

## Architecture

The static build contains only the explicitly allowlisted public pages, scripts, styles, and assets. Private server code and environment variables are excluded. A Vercel Node function handles API routes. Bundled Linux Chromium renders PDF/PNG using temporary runtime storage.

In-memory request throttling applies only to a single function instance; use Vercel Firewall for shared traffic limits. Large image uploads or exports can exceed Vercel request limits, so keep uploaded images modest. Original asset details and font licensing are in `DEITY_ASSETS.md` and `assets/OFL.txt`.

## GitHub checks

GitHub Actions installs dependencies, checks the Razorpay SDK interface, runs the isolated payment tests, builds the public assets, and smoke-tests PDF/PNG generation. Do not upload `node_modules`, `.data`, `.env` files, public build output, or test artifacts; `.gitignore` excludes them.
