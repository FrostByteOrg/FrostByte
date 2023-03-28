## Getting Started With Local Development
1. Clone this repository
  ```bash
  # HTTPS
  $ git clone https://github.com/FrostCord/FrostCord.git

  # or

  # SSH
  $ git clone git@github.com:FrostCord/FrostCord
  ```
2. Navigate to the project directory
  ```bash
  cd FrostCord
  ```
3. Head to https://app.supabase.com and sign up
4. Create a new project and navigate to the settings/api tab
5. Copy your project anon key and project reference id (the string of characters in the subdomain of supabase.co)
6. Open `.env.example` and set:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the anon key you just copied
  - `PROJECT_ID` to the project reference id from the previous step
7. Rename `.env.example` to `.env.local`
8. Install dependencies
  ```bash
  npm install
  ```
9. Prepare the local supabase containers
  ```bash
  npx supabase start
  ```
10. Install the livekit server by following instructions [here](https://docs.livekit.io/getting-started/server-setup/)
11. Run livekit in dev mode
  ```bash
  livekit-server --dev
  ```
12. Navigate to http://localhost:54323/project/default/storage/buckets and create 2 public buckets:
  - avatars
  - servericons
13. Start NextJS dev server
  ```bash
  npm run dev
  ```
14. Navigate http://localhost:3000 and sign up/log in


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
