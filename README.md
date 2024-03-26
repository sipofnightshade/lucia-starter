# Sveltekit + Lucia starter project

Offers similar component to what Clerk offers for authentication in a minimalistic starter.

## Setup

To setup the project you need to first create a local **Libsql** database and run the drizzle scripts to set up the database and then start the dev server.

#### Create Local DB:

`database/local.db`

#### Run scripts:

```ts
pnpm db:generate
pnpm db:push
pnpm dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
