## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Rename the `.env.example` to `.env.local` and fill in the variables

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Generating Types

For maximum type safety on the Supabase API client some configuration is needed. Follow [this](https://supabase.com/docs/reference/cli/supabase-link) for how to install the Supabase CLI.

<details><summary>Quick guide here</summary>

```bash
npm i supabase

npx supabase init

supabase login

supabase link --project-ref <string>
```

</details>

Once installed and configured, you are safe to run the npm script inside the package.json

```bash
npm run update-types
```

This command will generate the appropriate types for your Supabase API client. More info [here](https://supabase.com/docs/guides/api/generating-types) and [here](https://supabase.com/docs/reference/javascript/typescript-support)
