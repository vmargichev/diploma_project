# Stripe and password reset configuration

Set these in `learn_universe_backend/.env`. Never commit actual secrets. Restart Django after editing this file.

| Setting | Purpose |
| --- | --- |
| STRIPE_SECRET_KEY | Backend Stripe Checkout API key. Use a test key for the demo. |
| EMAIL_BACKEND | Set to `anymail.backends.mailgun.EmailBackend` for actual email delivery; use `django.core.mail.backends.console.EmailBackend` for console-only local development. |
| MAILGUN_API_KEY | Mailgun API credential authorized to send for the configured domain. |
| MAILGUN_SENDER_DOMAIN | Your verified Mailgun sending domain. |
| MAILGUN_API_URL | `https://api.mailgun.net/v3` for US or `https://api.eu.mailgun.net/v3` for EU. Must match the domain region. |
| FROM_EMAIL | Sender address associated with your verified sending domain. |
| FRONTEND_SITE_URL | Browser-facing application URL, currently `http://localhost:5173`. Used in password reset links and Stripe return URLs. |

The current Stripe flow redirects to hosted Checkout and does not read a frontend publishable key. There is no webhook handler reading a webhook signing secret; that would be a separate payment reliability improvement. MAILERSEND_API_TOKEN is not needed for Mailgun. Django SECRET_KEY and database credentials do not need to change simply because Stripe or Mailgun credentials changed.

On 24 October 2026 the backend loaded nonempty Stripe, Mailgun domain/key and sender settings. The Stripe key had a test-key prefix. Local EMAIL_BACKEND was switched from console to Mailgun. These checks establish configuration presence, not provider validity. No live payment or email delivery was attempted. Related-course tests, reset-email rendering and Stripe session creation/return URLs are checked with an in-memory mail backend and a mocked Stripe client.

Only replace keys that are revoked, incorrect, or exposed. Secret values are not printed in reports. Missing course pictures and avatars are missing media files, not missing API keys: local placeholders are displayed until real uploads are restored.
