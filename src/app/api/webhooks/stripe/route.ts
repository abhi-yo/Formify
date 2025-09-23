import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id!;
        const customerId = session.customer as string;

        await db.organization.upsert({
          where: { id: userId },
          update: {
            stripeCustomerId: customerId,
            subscriptionStatus: "active",
          },
          create: {
            id: userId,
            name: "Personal",
            stripeCustomerId: customerId,
            subscriptionStatus: "active",
          },
        });
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        const customer = invoice.customer as string;

        await db.organization.updateMany({
          where: { stripeCustomerId: customer },
          data: { subscriptionStatus: "active" },
        });
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        const failedCustomer = failedInvoice.customer as string;

        await db.organization.updateMany({
          where: { stripeCustomerId: failedCustomer },
          data: { subscriptionStatus: "past_due" },
        });
        break;

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        const subCustomer = subscription.customer as string;

        await db.organization.updateMany({
          where: { stripeCustomerId: subCustomer },
          data: { subscriptionStatus: "canceled" },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
