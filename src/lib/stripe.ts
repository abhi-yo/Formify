import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    submissions: 100,
    storage: 25 * 1024 * 1024, // 25MB
    features: ["Email forwarding", "Basic dashboard", "CSV export"],
  },
  PRO: {
    name: "Pro",
    price: 7,
    priceId: "price_pro_monthly",
    submissions: 2000,
    storage: 1024 * 1024 * 1024, // 1GB
    features: ["All Free features", "Slack webhook", "Priority support"],
  },
  TEAM: {
    name: "Team",
    price: 19,
    priceId: "price_team_monthly",
    submissions: 10000,
    storage: 5 * 1024 * 1024 * 1024, // 5GB
    features: ["All Pro features", "Multi-user orgs", "Custom domains"],
  },
};

export async function createCheckoutSession({
  priceId,
  userId,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
  });

  return session;
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
