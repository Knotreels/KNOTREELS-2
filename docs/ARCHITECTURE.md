# KnotReels Architecture

This directory describes the modular layout used in the project.

```
src/
  features/
    credits/        # credit purchase and spending logic
      purchaseCredits.ts
      spendCredits.ts
      types.ts
    firebase/       # firebase client and admin helpers
      client.ts
      admin.ts
    stripe/         # shared Stripe client
      stripe.ts
    users/          # user domain types/helpers
      types.ts
  app/              # Next.js app router and API routes
  components/       # React components
```

- **features/credits** – reusable functions for purchasing and spending credits.
- **features/firebase** – wraps Firebase client and Admin SDK initialisation so that API routes can reuse it.
- **features/stripe** – exports the configured Stripe instance.
- **features/users** – defines basic user types used across the app.

API routes import these helpers to keep serverless logic small and focused.
