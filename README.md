# SiliconFlow

SiliconFlow is a React and Node application for semiconductor demand, supply and allocation.

## Local demo

Use Node.js 24. From the repository root, install dependencies and create the local environment file.

```powershell
npm ci
Copy-Item .env.example .env
npm run api
```

In another terminal run `npm run dev` and open the address printed by Vite. Select **Data Management** from Home and sign in to enter the demo workspace. The demo uses synthetic data and resets when the API restarts. To read from development Snowflake with local sign-in, configure the database settings and set `SF_DEMO_DATA=snowflake`.

## Verify

```text
npm run lint
npm test
npm run build
```

The Transaction Data screen provides demand and supply CSV templates. Use the headers in the downloaded template, ISO dates, positive whole quantities and a maximum file size of 10 MB. The application reports row errors and loads valid records once per upload.

See [Figma screen inventory](docs/figma-frames.md) for the design map and [operations](docs/operations.md) for Snowflake, auth, roles, allocation rules, staging and release gates.
