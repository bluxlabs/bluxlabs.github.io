# Contact backend handoff

## Implemented
- POST /api/contact: same-origin JSON, field validation, 16 KB limit, honeypot, five attempts per IP per ten minutes.
- Fixed recipient: sol@bluxlabs.com. Validated visitor address is Reply-To. Plain text email, server-only credentials.
- Resend adapter with timeout and idempotency key. Unchanged retries keep the same provider key. Provider acceptance does not guarantee inbox delivery.
- Failure preserves input; missing configuration returns 503 and explicitly says the message was not sent.
- No database or inquiry logging. The application forwards data to the email provider and does not persist inquiries.

## Required from Blux
Confirm server OS, Node version, proxy/deployment process, email provider (SMTP or API), approved sender address and exact public origin.
Gmail SMTP is now supported for Node/Vite hosting; Resend remains an alternative for Worker hosting. Configure secrets on the server, never in frontend variables or source control.

## Company-server deployment
Requires Node 22+; locally validated with Node 24.
Run npm ci, npm run build, then npm start. Use a process supervisor and HTTPS reverse proxy in production.
Copy .env.example to .env and configure MAIL_TRANSPORT=smtp, SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER, SMTP_PASS (Google App Password when permitted), CONTACT_FROM (the authenticated mailbox or an approved alias), and CONTACT_ALLOWED_ORIGIN (exact public HTTPS origin).
.env is ignored by git. Restrict file access and restart after changes.
HOST defaults to 127.0.0.1; PORT defaults to 3000. Node serves only dist/client; never expose the source directory as the web root.
A static-file-only deployment cannot run the contact API.

## Proxy and limits
Only if a same-host reverse proxy overwrites X-Real-IP, set TRUST_LOOPBACK_PROXY=true. Otherwise leave it unset.
Example settings inside an existing HTTPS nginx server:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 16k;
    proxy_read_timeout 20s;
}
```

The current rate limit is process-local and resets on restart. Add proxy/WAF enforcement before public launch; use shared enforcement for multiple processes. The honeypot is a basic mitigation, not a CAPTCHA.

## Verification and remaining work
npm run test:api and npm run test:sites use mocked email delivery; no test email is sent.
Before launch: configure the actual provider, validate sender DNS, send an authorized test inquiry and confirm inbox arrival and Reply-To behavior.
Provider confirmation, real credentials, public deployment and inbox verification remain pending.
The fixed local preview at http://127.0.0.1:4173/ runs the same contact handler via Vite; without credentials it returns an honest unavailable message.
The original static Worker files are preserved; package-api.mjs wraps the built server entry with the API. Worker hosting needs equivalent server environment bindings.


## Gmail SMTP confirmation
The company confirmed Gmail with SMTP on 2026-09-09. Use the Node server deployment; GitHub Pages cannot run SMTP, and the portable Worker wrapper does not load Nodemailer.
Port 465 uses TLS; 587 requires STARTTLS. Never use the normal Google login password. App Passwords depend on account/admin policy and 2-Step Verification; if unavailable, OAuth or administrator-managed relay needs separate configuration.
CONTACT_FROM must be the authenticated mailbox or an approved sending alias; do not assume the recipient address is also the login account.
SMTP attempts are deduplicated for 24 hours in process memory, including uncertain failures. A timed-out attempt should be checked in the mailbox before creating a new inquiry; process restarts/multiple instances do not guarantee exactly-once delivery. Shared durable deduplication is needed when scaling.
11 API/server tests pass with mocked delivery. Credentials and actual inbox verification remain pending.
Official setup: https://support.google.com/a/answer/9003945
