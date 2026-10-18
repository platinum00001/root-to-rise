# Root to Rise — static site

Live: https://platinum00001.github.io/root-to-rise/

Plain static HTML (no login, no server). Site behaviour lives in `assets/rtr.js` and `assets/rtr.css`;
FAQ answers used by the "Ask us" chat helper are in `assets/rtr-faq.js` (keep them in sync with the FAQ sections).

## Settings — edit `assets/rtr-config.js` only

| Constant | Purpose |
|---|---|
| `RTR_FORM_EMAIL` | Inbox that receives every form (via FormSubmit.co). The first submission triggers a one-time "Activate Form" email to this inbox — click it. |
| `RTR_SQUARE_DONATE_URL` | Square online-checkout donation link. Empty = "Online giving coming soon — call or email us". |
| `RTR_PHONE` | Public phone shown in footer/Contact. Empty = hidden. |
| `RTR_EMAIL` | Public email shown in footer/Contact. Empty = hidden. |
