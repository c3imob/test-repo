import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await request.json();
  if (!priceId) {
    return NextResponse.json({ error: "Missing price ID" }, { status: 400 });
  }

  try {
    let subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        metadata: { userId: session.user.id }
      });
      customerId = customer.id;
      subscription = await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          status: "pending",
          priceId
        },
        update: {
          stripeCustomerId: customerId,
          priceId
        }
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.STRIPE_SUCCESS_URL ?? "http://localhost:3000/account",
      cancel_url: process.env.STRIPE_CANCEL_URL ?? "http://localhost:3000/pricing",
      subscription_data: {
        metadata: {
          userId: session.user.id
        }
      },
      metadata: {
        userId: session.user.id
      }
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
