# Environment Variable Template

Use this template when running Rise90 outside the managed project environment. Copy the values into your deployment platform’s secret manager or into a local `.env` file that remains untracked by Git.

| Variable | Example placeholder | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://USER:PASSWORD@HOST:3306/DATABASE` | MySQL or TiDB connection string for Drizzle. |
| `JWT_SECRET` | `replace-with-a-long-random-secret` | Session cookie signing secret. |
| `VITE_APP_ID` | `your-oauth-app-id` | OAuth application identifier. |
| `OAUTH_SERVER_URL` | `https://your-oauth-server.example` | OAuth server base URL. |
| `VITE_OAUTH_PORTAL_URL` | `https://your-oauth-portal.example` | Browser OAuth portal URL. |
| `OWNER_OPEN_ID` | `your-owner-open-id` | Project owner identifier. |
| `BUILT_IN_FORGE_API_URL` | `https://forge.example` | Optional managed built-in API base URL. |
| `BUILT_IN_FORGE_API_KEY` | `replace-with-server-only-token` | Optional managed built-in API token. |
| `VITE_FRONTEND_FORGE_API_URL` | `https://forge.example` | Optional browser-safe built-in API base URL. |
| `VITE_FRONTEND_FORGE_API_KEY` | `replace-with-browser-token` | Optional browser-safe built-in API token. |

| `VITE_ANALYTICS_ENDPOINT` | `https://analytics.example.com` | Optional Umami analytics endpoint URL. |
| `VITE_ANALYTICS_WEBSITE_ID` | `your-umami-website-id` | Optional Umami website identifier. |

> Never expose `DATABASE_URL`, `JWT_SECRET`, or server-side API keys to the browser. Do not commit a populated `.env` file.
