import { NextResponse } from "next/server";
import { registerRun, getOrCreateAccess } from "@/lib/phorium-access";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-post mangler." },
        { status: 400 }
      );
    }

    const access = await getOrCreateAccess(email);

    if (!access.canRun) {
      return NextResponse.json(
        {
          error: "FREE_LIMIT_REACHED",
          message: "Du har brukt opp dine 3 gratis analyser.",
          access,
        },
        { status: 402 }
      );
    }

    await registerRun(email, false);

    const updated = await getOrCreateAccess(email);

    return NextResponse.json({
      ok: true,
      access: updated,
    });
  } catch (error) {
    console.error("Start run failed:", error);

    const message =
      error instanceof Error ? error.message : "Ukjent feil";

    if (message === "FREE_LIMIT_REACHED") {
      return NextResponse.json(
        {
          error: "FREE_LIMIT_REACHED",
          message: "Du har brukt opp dine 3 gratis analyser.",
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: "Kunne ikke starte analyse." },
      { status: 500 }
    );
  }
}