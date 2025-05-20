export type CreditBundleKey = '10' | '25' | '50' | '100';

export interface CreditBundle {
  price: number; // price in smallest currency unit (e.g. pence)
  credits: number;
}

export const CREDIT_BUNDLES: Record<CreditBundleKey, CreditBundle> = {
  '10': { price: 199, credits: 10 },
  '25': { price: 399, credits: 25 },
  '50': { price: 699, credits: 50 },
  '100': { price: 1299, credits: 100 },
};
