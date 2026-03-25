import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-post mangler." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!appUrl || !priceId) {
      return NextResponse.json(
        { error: "Manglende Stripe-konfigurasjon." },
        { status: 500 }
      );
    }

    const normalized = email.trim().toLowerCase();

    const { data: existing, error: dbError } = await supabaseAdmin
      .from("phorium_access")
      .select("stripe_customer_id, subscription_status")
      .eq("email", normalized)
      .maybeSingle();

    if (dbError) throw dbError;

    if (existing?.subscription_status === "active") {
      return NextResponse.json(
        { error: "Brukeren har allerede et aktivt abonnement." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existing?.stripe_customer_id || undefined,
      customer_email: existing?.stripe_customer_id ? undefined : normalized,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/betaling/fullfort?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/betaling/avbrutt`,
      metadata: {
        email: normalized,
        product: "phorium",
        source: "checkout_route",
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe returnerte ingen checkout-url." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout creation failed:", error);

    return NextResponse.json(
      { error: "Kunne ikke opprette betaling." },
      { status: 500 }
    );
  }
}