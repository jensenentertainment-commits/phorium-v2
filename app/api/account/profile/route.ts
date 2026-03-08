import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getOrCreateAccess } from "@/lib/phorium-access";

export async function POST(req: Request) {
  try {
    const { email, displayName } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-post mangler." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const trimmedDisplayName =
      typeof displayName === "string" ? displayName.trim().slice(0, 80) : "";

    await getOrCreateAccess(normalized);

    const { error } = await supabaseAdmin
      .from("phorium_access")
      .update({
        display_name: trimmedDisplayName || null,
      })
      .eq("email", normalized);

    if (error) throw error;

    const updated = await getOrCreateAccess(normalized);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile save failed:", error);
    return NextResponse.json(
      { error: "Kunne ikke lagre profil." },
      { status: 500 }
    );
  }
}