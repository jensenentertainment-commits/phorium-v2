import Stripe from "stripe";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
          session.metadata?.email || session.customer_details?.email;

        if (email) {
          await supabaseAdmin
            .from("phorium_access")
            .upsert(
              {
                email: email.toLowerCase(),
                subscription_status: "active",
                stripe_customer_id:
                  typeof session.customer === "string"
                    ? session.customer
                    : null,
                stripe_subscription_id:
                  typeof session.subscription === "string"
                    ? session.subscription
                    : null,
              },
              { onConflict: "email" }
            );
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        if (customerId) {
          const mappedStatus =
            subscription.status === "active" || subscription.status === "trialing"
              ? "active"
              : subscription.status === "past_due"
              ? "past_due"
              : "canceled";

          await supabaseAdmin
            .from("phorium_access")
            .update({
              subscription_status: mappedStatus,
              stripe_subscription_id: subscription.id,
            })
            .eq("stripe_customer_id", customerId);
        }
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