// constants/plans.js
export const PLAN_TIERS = [
  {
    key: "free",
    name: "Free",
    price: 0,
    tenants: "Max 5 tenants",
    maxTenants: 5,
    fee: "5% platform fee per rent payment",
    description: "Ideal for individual landlords starting out.",
  },
  {
    key: "pro",
    name: "Pro",
    price: 9000,
    tenants: "Max 8 tenants",
    maxTenants: 8,
    fee: "3% platform fee per rent payment",
    description: "Great for growing property portfolios.",
  },
  {
    key: "premium",
    name: "Premium",
    price: 17000,
    tenants: "Max 15 tenants",
    maxTenants: 15,
    fee: "1% platform fee per rent payment",
    description: "Optimal balance for mid-sized landlords.",
  },
  {
    key: "business",
    name: "Business",
    price: 34000,
    tenants: "Unlimited tenants",
    maxTenants: null,
    fee: "0% platform fee per rent payment",
    description: "Zero commissions on tenant rent collected.",
  },
];