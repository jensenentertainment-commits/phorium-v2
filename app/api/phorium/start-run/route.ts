import { NextResponse } from "next/server";
import { startRun } from "@/lib/phorium-access";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body?.email;
    const includesTechnical = Boolean(body?.includesTechnical);

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-post mangler." },
        { status: 400 }
      );
    }

    const result = await startRun(email, includesTechnical);

    if (!result.runAllowed) {
      if (result.runReason === "FREE_LIMIT_REACHED") {
        return NextResponse.json(
          {
            error: "FREE_LIMIT_REACHED",
            message: "Du har brukt opp dine 3 gratis analyser.",
            access: result,
          },
          { status: 402 }
        );
      }

      if (result.runReason === "TECHNICAL_REQUIRES_SUBSCRIPTION") {
        return NextResponse.json(
          {
            error: "TECHNICAL_REQUIRES_SUBSCRIPTION",
            message: "Teknisk kontroll krever abonnement eller VIP-tilgang.",
            access: result,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "RUN_NOT_ALLOWED",
          message: "Analyse kan ikke startes.",
          access: result,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      access: result,
    });
  } catch (error) {
    console.error("Start run failed:", error);

    return NextResponse.json(
      { error: "Kunne ikke starte analyse." },
      { status: 500 }
    );
  }
}