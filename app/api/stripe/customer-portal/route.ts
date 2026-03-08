import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-post mangler." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const { data, error } = await supabaseAdmin
      .from("phorium_access")
      .select("stripe_customer_id")
      .eq("email", normalized)
      .maybeSingle();

    if (error) throw error;

    if (!data?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Ingen Stripe-kunde funnet for denne brukeren." },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/min-side`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Customer portal creation failed:", error);
    return NextResponse.json(
      { error: "Kunne ikke åpne abonnementssiden." },
      { status: 500 }
    );
  }
}