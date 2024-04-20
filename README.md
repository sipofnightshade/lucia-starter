# Sveltekit + Lucia starter project

Minimal starter project with just the basic authentication pages and components that you can build on.
![image](https://i.imgur.com/bNajOlU.png)

## Features

- Email - Password auth with verification codes + rate limiting
- Google & Github Oauth
- Authentication Modals
- Account linking
- Shadcn-svelte + Superforms
- Turso DB + Drizzle ORM (swap with your preferred db, just follow drizzle docs)

## Setup

To setup the project you need to first create a local **Libsql** database and run the drizzle scripts to set up the database and then start the dev server.

##### Create Local DB:

- In project root, add `database/local.db`

##### Set Environment Variables:

- Change `.env.example` --> `.env`
- Update keys to enable Oauth & Resend verification emails

##### Run scripts:

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
