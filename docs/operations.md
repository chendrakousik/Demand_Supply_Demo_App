# SiliconFlow operations

## Phase and launch gates

| Phase | Tracker | Verification |
| --- | --- | --- |
| Setup & Planning | SF-001–006 | Verify collaborators, assign remaining owners, require the Checks workflow before merging to main. |
| Snowflake Foundation | SF-007–015 | Apply migrations in development, load fixtures, and verify a restricted API read. |
| UI & Authentication | SF-016–024 | Approve the role matrix and verify email, Google, Microsoft, logout and expiry with the chosen provider. |
| Data APIs & Uploads | SF-025–031 | Sign in and confirm the Data Management workspace reports Snowflake as its data source. Upload mixed valid and invalid rows, retry the upload and reconcile the batch. |
| Allocation & Reports | SF-032–039 | Approve the provisional policy or update it and its fixtures. Compare run totals to the SQL views, UI, CSV and Excel. |
| Testing & Launch | SF-040–047 | Choose a host, deploy staging, compare all frames with loaded fonts, approve mobile layout, run staging smoke tests and obtain release sign-off. |

## Snowflake

Create a separate database, warehouse, service identity and RSA key per environment. Select the target database before applying `001_foundation.sql`. Apply `002_demo_seed.sql` only in development. Adjust the database and warehouse identifiers in the grant scripts for the target environment. Grant the API role to the key-pair-authenticated service user, apply `003_api_read_grants.sql`, and verify an API read. Apply `004_api_write_grants.sql` after that verification. Mount the private key via the host's secrets mechanism.

The API uses Snowflake for all live writes. Restrict initial deployment to one API replica. Sessions, mutation coordination and job polling are local to that process. A restart invalidates sessions, resumes queued jobs and marks interrupted running jobs failed. Before scaling horizontally, move sessions and job claims to a shared store and enforce idempotency across workers. The demo query implementation reads table data before filtering and is sized for the supplied MVP fixtures.

## Managed sign-in

Select an OIDC provider with a confidential web client, a hosted email flow and federated Google and Microsoft connections. Set the issuer, client credentials and HTTPS application origin at runtime. Register `APP_ORIGIN/api/auth/callback` as the callback. Map the provider's signed role claim to an array of `Admin`, `Data`, `Planner`, or `BA`. Configure the provider-specific URL query parameters for each connection in `OIDC_*_PARAMETERS`. Passwords are entered at the provider. Application logout clears the local session.

### Provisional access matrix

| Role | Data read | Data write | Operations and reports | Restrictions write | Run allocation | Administration |
| --- | --- | --- | --- | --- | --- | --- |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes |
| Data | Yes | Yes | — | — | — | — |
| Planner | Yes | — | Yes | Yes | Yes | — |
| BA | Yes | — | Yes | — | — | — |

Approve this matrix and the allocation policy before setting `SF_POLICIES_APPROVED=1`. The provisional policy processes smaller priority numbers first, then earlier demand dates and demand IDs. It uses matching product and location stock available by the demand date, uses the earliest stock first with lot and supply ID tie breaks, and splits demand across eligible lots. A matching saved restriction excludes a lot. Unfilled demand is recorded as a shortage.

## Staging and production

Build the Docker image and deploy one replica behind HTTPS. Configure health checks for `GET /api/health`, API error monitoring, run failure alerts, and platform logs. Provision staging Snowflake and auth settings separately from production. Test each provider, restricted direct navigation and API access, session expiry, invalid CSV, retries and allocation exports. At 1440 × 900 review reference screenshots, original assets and sidebar variants. Approve narrow layouts before release. Record the previous image tag, snapshot production data before applying schema changes, and verify a rollback by redeploying the prior compatible image. Apply production changes only after staging sign-off and smoke-test live Data Management and allocation exports.
