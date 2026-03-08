import { supabaseAdmin } from "@/lib/supabase/admin";

export type AccessState = {
  email: string;
  displayName: string | null;
  freeRunsUsed: number;
  subscriptionStatus: "inactive" | "active" | "past_due" | "canceled";
  accessTier: "default" | "vip";
  canRun: boolean;
  canUseTechnical: boolean;
};

function isVipTier(accessTier: string | null | undefined) {
  return (accessTier ?? "default") === "vip";
}

export async function getOrCreateAccess(email: string): Promise<AccessState> {
  const normalized = email.trim().toLowerCase();

  let { data, error } = await supabaseAdmin
    .from("phorium_access")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const inserted = await supabaseAdmin
      .from("phorium_access")
      .insert({
        email: normalized,
        display_name: null,
        free_runs_used: 0,
        subscription_status: "inactive",
        access_tier: "default",
      })
      .select("*")
      .single();

    if (inserted.error) throw inserted.error;
    data = inserted.data;
  }

  const subscriptionStatus = (data.subscription_status ??
    "inactive") as AccessState["subscriptionStatus"];

  const accessTier = (data.access_tier ?? "default") as AccessState["accessTier"];

  const isActive = subscriptionStatus === "active";
  const isVip = isVipTier(accessTier);

  return {
    email: data.email,
    displayName: data.display_name ?? null,
    freeRunsUsed: data.free_runs_used ?? 0,
    subscriptionStatus,
    accessTier,
    canRun: isVip || isActive || (data.free_runs_used ?? 0) < 3,
    canUseTechnical: isVip || isActive,
  };
}

export async function registerRun(email: string, includesTechnical: boolean) {
  const normalized = email.trim().toLowerCase();
  const access = await getOrCreateAccess(normalized);

  if (!access.canRun) {
    throw new Error("FREE_LIMIT_REACHED");
  }

  const hasFullAccess =
    access.subscriptionStatus === "active" || access.accessTier === "vip";

  if (includesTechnical && !hasFullAccess) {
    throw new Error("TECHNICAL_REQUIRES_SUBSCRIPTION");
  }

  if (!hasFullAccess) {
    const update = await supabaseAdmin
      .from("phorium_access")
      .update({ free_runs_used: access.freeRunsUsed + 1 })
      .eq("email", normalized);

    if (update.error) throw update.error;
  }

  const runInsert = await supabaseAdmin.from("phorium_runs").insert({
    email: normalized,
    includes_technical: includesTechnical && hasFullAccess,
  });

  if (runInsert.error) throw runInsert.error;
}