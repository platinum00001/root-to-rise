# Root to Rise — static site

Live: https://platinum00001.github.io/root-to-rise/ (the older Grok app-builder copy at roottorisema.grok.me is separate and is NOT updated by this repo)

Public pages must never name individuals (anonymity policy). Leadership wording: "Led by people in long-term recovery and licensed counselors."

Plain static HTML (no login, no server). Site behaviour lives in `assets/rtr.js` and `assets/rtr.css`;
FAQ answers used by the "Ask us" chat helper are in `assets/rtr-faq.js` (keep them in sync with the FAQ sections).

## Settings — edit `assets/rtr-config.js` only

| Constant | Purpose |
|---|---|
| `RTR_FORM_EMAIL` | Inbox that receives every form (via FormSubmit.co). The first submission triggers a one-time "Activate Form" email to this inbox — click it. |
| `RTR_SQUARE_DONATE_URL` | Square online-checkout donation link. Empty = "Online giving coming soon — call or email us". |
| `RTR_PHONE` | Public phone shown in footer/Contact. Empty = hidden. |
| `RTR_EMAIL` | Public email shown in footer/Contact. Empty = hidden. |

## Benefits navigator (v1 app) — `navigator/`

Live: https://platinum00001.github.io/root-to-rise/navigator/

Benefits eligibility checker, resource finder, partner offers and optional member accounts (shared Supabase project,
tables `members`, `eligibility_answers`, `notification_consent`, `offer_signups`, `email_optin`; RLS on).
`navigator/config.js` holds only the public Supabase URL + publishable key — never a secret/service-role key.
Editor: `/navigator/admin/` (Sveltia CMS). Tests: `node navigator/tests/screen.test.js`. Details: `navigator/README.md`.
