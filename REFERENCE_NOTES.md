# Research and implementation notes

Reviewed 12 November 2026. Public-page observations are not claims about competitors' private implementations. No competitor payment was performed.

## Reference findings

[MarathiBiodataMaker](https://marathibiodatamaker.com/) presents photo/no-photo galleries, advertises 24 templates and image/PDF exports, and uses a fill–preview–download journey. Its documented field coverage includes personal details, education/occupation, religion/community, कुलदैवत, गोत्र, देवक, रास, नक्षत्र, चरण, नाडी, गण and मंगळ, parents' details/professions, siblings, maternal relatives and contact information.

Traditional invocation/Ganesh headers and framed paper are recognizable conventions. Exact downloadable artwork, every hidden template variation and post-payment export behavior were not independently verified. This is a focused review of the user's reference, not an exhaustive audit of all competitors.

The supplied image guides our paper layout: top/bottom decorative strips, white paper, centered deity header, aligned label–colon–value rows, optional upper-right photo and Marathi headings. The requested title is **परिचय पत्रिका**. There is no bottom slogan or notebook ruling.

## Implemented plan

1. Shared field schema, defensive validation and previous-draft compatibility.
2. Original Marathi multipage interface and 24 photo/no-photo design treatments.
3. Sequential combined builder, custom fields, ordering, hidden fields, dropdown/custom choices, uploads and draft backups.
4. Shared fixed-A4 renderer, responsive scaling, adaptive font/row spacing and explicit overflow warnings.
5. Real server PDF rendering with enforced watermark for the free route.
6. Short-lived signed order/download tokens, server-fixed amount, signature/capture checks, and draft-hash-bound clean exports without a database or webhook.
7. Fifteen original transparent deity PNGs with dropdown, visual gallery and upload-last option.
8. Automated browser/payment tests and visual inspection of a rasterized PDF.

Personal and horoscope fields merge under वैयक्तिक माहिती on the paper to follow the example. Family and contact sections follow underneath, never side by side. The form retains four distinct sequential sections for editing.

## Final-screen-only pricing

Homepage, gallery, builder and preview have no pricing/payment promotion. Only the final download page offers the watermarked/free option and ₹49 clean export. Selecting a template never grants a clean download. A backend-verified captured payment is required.

[Razorpay's official Standard Checkout guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) documents server order creation and checkout HMAC verification. This build additionally fetches the payment and checks capture, amount/currency, order binding and refunds before export. A client success flag is never trusted.

The preview itself is not DRM: screenshots and local browser editing cannot be prevented by server payment verification.

## Original assets

The deity PNGs use built-in imagegen; names and prompts are in DEITY_ASSETS.md. Borders and earlier vector marks are original code-native designs. The font comes from the [official Google Fonts Noto Sans Devanagari directory](https://github.com/google/fonts/tree/main/ofl/notosansdevanagari), with its license bundled.

## Owner decisions still required

Gateway credentials/merchant setup, HTTPS domain and hosting, support/refund/terms details, storage policy and real gateway test-mode verification. The application is not publicly deployed, and live payment credentials have not been tested. Excessive content is blocked at a minimum font size rather than cropped to force a one-page result.
