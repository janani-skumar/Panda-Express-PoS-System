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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

For Stripe checkout integration, add the following environment variables to your `.env` file:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (test mode key for development)
- `NEXT_PUBLIC_APP_URL` - Base URL of your application (e.g., `http://localhost:3000` for local development or your production URL)

Example `.env` file:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** The Stripe integration is currently configured for test mode. Use test mode keys from your Stripe dashboard.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment link

https://project-3-team-41-zbyt.onrender.com/

Style

Accessibility
- font bigger
- bold option

Idle page
- too much red
- no emoji
- remove employee login button

Home Page
- change red
- loading skeleton
- incerase idle time
- figure out how to provide accessibility
- remove manager view from side bar
- checkout out button needs to grab attention
- increase box shadow
- add background to white space

Manager
- min-height to full height
- Filter recipes by type

Checkout
- 

Build Your Own
- remove frink a a la carte
- move add to cart button 

A La Carte
- 

Kitchen
- masonry layout
- make recipes thinner
- make kitchen button easier to find
- filter for meal types in kitchen

Cashier
- fix a la carte entree

Menu
- make it bigger
- add catering option
- add pictures
- add apps
- custom font

TODO

Move toast to top middle
Once you complete order, go back to main screen
Quit order
Add appetizers (add more food in general)
Add logout button to employee pages
Add kitchen button
Disable a card if its out of stock for ingredients in kiosk view
Limit order quanities
Add catering
Premium items
ChatGPT Wrapper
Add sales report button
