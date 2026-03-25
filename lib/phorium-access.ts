import { supabaseAdmin } from "@/lib/supabase/admin";

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";
export type AccessTier = "default" | "vip";

export type AccessState = {
  email: string;
  displayName: string | null;
  freeRunsUsed: number;
  subscriptionStatus: SubscriptionStatus;
  accessTier: AccessTier;
  canRun: boolean;
  canUseTechnical: boolean;
};

export type StartRunResult = AccessState & {
  runAllowed: boolean;
  runReason: "OK" | "FREE_LIMIT_REACHED" | "TECHNICAL_REQUIRES_SUBSCRIPTION";
  technicalEnabled: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseSubscriptionStatus(value: unknown): SubscriptionStatus {
  return value === "active" ||
    value === "past_due" ||
    value === "canceled" ||
    value === "inactive"
    ? value
    : "inactive";
}

function parseAccessTier(value: unknown): AccessTier {
  return value === "vip" || value === "default" ? value : "default";
}

export async function getOrCreateAccess(email: string): Promise<AccessState> {
  const normalized = normalizeEmail(email);

  let { data, error } = await supabaseAdmin
    .from("phorium_access")
    .select("email, display_name, free_runs_used, subscription_status, access_tier")
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
      .select("email, display_name, free_runs_used, subscription_status, access_tier")
      .single();

    if (inserted.error) throw inserted.error;
    data = inserted.data;
  }

  const freeRunsUsed = data.free_runs_used ?? 0;
  const subscriptionStatus = parseSubscriptionStatus(data.subscription_status);
  const accessTier = parseAccessTier(data.access_tier);
  const hasFullAccess = subscriptionStatus === "active" || accessTier === "vip";

  return {
    email: data.email,
    displayName: data.display_name ?? null,
    freeRunsUsed,
    subscriptionStatus,
    accessTier,
    canRun: hasFullAccess || freeRunsUsed < 3,
    canUseTechnical: hasFullAccess,
  };
}

export async function startRun(
  email: string,
  includesTechnical: boolean
): Promise<StartRunResult> {
  const normalized = normalizeEmail(email);

  const { data, error } = await supabaseAdmin.rpc("start_phorium_run", {
    p_email: normalized,
    p_includes_technical: includesTechnical,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("START_RUN_EMPTY_RESPONSE");
  }

  return {
    email: row.email,
    displayName: row.display_name ?? null,
    freeRunsUsed: row.free_runs_used ?? 0,
    subscriptionStatus: parseSubscriptionStatus(row.subscription_status),
    accessTier: parseAccessTier(row.access_tier),
    canRun: Boolean(row.can_run),
    canUseTechnical: Boolean(row.can_use_technical),
    runAllowed: Boolean(row.run_allowed),
    runReason: row.run_reason,
    technicalEnabled: Boolean(row.technical_enabled),
  };
}