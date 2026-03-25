import Stripe from "stripe";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

type DbSubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapStripeStatus(status: string | null | undefined): DbSubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "incomplete":
    case "paused":
    default:
      return "inactive";
  }
}

async function upsertAccessFromCheckout(params: {
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: DbSubscriptionStatus;
}) {
  const email = normalizeEmail(params.email);

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("phorium_access")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (selectError) throw selectError;

  if (!existing) {
    const { error: insertError } = await supabaseAdmin
      .from("phorium_access")
      .insert({
        email,
        display_name: null,
        free_runs_used: 0,
        access_tier: "default",
        subscription_status: params.subscriptionStatus,
        stripe_customer_id: params.stripeCustomerId,
        stripe_subscription_id: params.stripeSubscriptionId,
      });

    if (insertError) throw insertError;
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from("phorium_access")
    .update({
      subscription_status: params.subscriptionStatus,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
    })
    .eq("email", email);

  if (updateError) throw updateError;
}

async function updateAccessByCustomerId(params: {
  customerId: string;
  subscriptionId?: string | null;
  subscriptionStatus: DbSubscriptionStatus;
}) {
  const updatePayload: Record<string, string | null> = {
    subscription_status: params.subscriptionStatus,
  };

  if (params.subscriptionId !== undefined) {
    updatePayload.stripe_subscription_id = params.subscriptionId;
  }

  const { error } = await supabaseAdmin
    .from("phorium_access")
    .update(updatePayload)
    .eq("stripe_customer_id", params.customerId);

  if (error) throw error;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email =
          session.metadata?.email ||
          session.customer_details?.email ||
          session.customer_email ||
          null;

        if (!email) {
          console.warn("checkout.session.completed missing email", {
            sessionId: session.id,
          });
          break;
        }

        await upsertAccessFromCheckout({
          email,
          subscriptionStatus: "active",
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        if (!customerId) {
          console.warn("subscription event missing customer id", {
            eventType: event.type,
            subscriptionId: subscription.id,
          });
          break;
        }

        await updateAccessByCustomerId({
          customerId,
          subscriptionId: subscription.id,
          subscriptionStatus: mapStripeStatus(subscription.status),
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null;

        if (!customerId) break;

        await updateAccessByCustomerId({
          customerId,
          subscriptionStatus: "past_due",
        });

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null;

        if (!customerId) break;

        await updateAccessByCustomerId({
          customerId,
          subscriptionStatus: "active",
        });

        break;
      }

      default:
        break;
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Webhook handler failed:", error);
    return new Response("Webhook error", { status: 500 });
  }
}