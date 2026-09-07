This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

The stone jar contact buttons use the following centralized configuration:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_CONTACT_URL=https://m.me/your-page?ref={message}
```

`NEXT_PUBLIC_CONTACT_URL` may point to Messenger, Zalo, another chat URL, or a
`tel:` URL. The optional `{message}` token is replaced with an encoded message
containing the stone jar name and detail URL. Without this variable, the site
falls back to a prefilled email link.

Apply `supabase/migrations/20260907074751_add_stones_and_stone_jars.sql` to the
same Supabase project configured by `NEXT_PUBLIC_SUPABASE_URL` before using the
stone CMS.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
