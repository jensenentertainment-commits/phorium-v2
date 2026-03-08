import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const PRICE_ID = "price_1T8JLcCgdAq66XSdbgWH0EBp";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-post mangler." },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from("phorium_access")
      .select("stripe_customer_id")
      .eq("email", normalized)
      .maybeSingle();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: existing?.stripe_customer_id || undefined,
      customer_email: existing?.stripe_customer_id ? undefined : normalized,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/betaling/fullfort?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/betaling/avbrutt`,
      metadata: {
        email: normalized,
        product: "phorium",
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette betaling." },
      { status: 500 }
    );
  }
}