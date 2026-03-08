import { NextResponse } from "next/server";
import { getOrCreateAccess } from "@/lib/phorium-access";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-post mangler." }, { status: 400 });
    }

    const access = await getOrCreateAccess(email);
    return NextResponse.json(access);
  } catch (error) {
    console.error("Account fetch failed:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kontodata." },
      { status: 500 }
    );
  }
}