// app/api/tools/[tool]/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { TOOLS, type ToolKey } from "@/lib/tools";
import { TECHNICAL_TOOL } from "@/lib/technical";
import { normalizeToStandard } from "@/lib/standard";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function asToolKey(x: string): x is ToolKey {
  return (
    x === "publiseringsklar" ||
    x === "presisjonskontroll" ||
    x === "konsistenskontroll" ||
    x === "faktagrunnlag" ||
    x === "tekniskkontroll"
  );
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ tool: string }> }
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Serverkonfigurasjon mangler API-nøkkel." },
        { status: 500 }
      );
    }

    const { tool } = await ctx.params;
    const toolParam = tool?.trim();

    if (!toolParam || !asToolKey(toolParam)) {
      return NextResponse.json({ error: "Ukjent verktøy." }, { status: 404 });
    }

    const cfg = toolParam === "tekniskkontroll" ? TECHNICAL_TOOL : TOOLS[toolParam];

    const { text } = (await req.json()) as { text?: string };
    const t = typeof text === "string" ? text.trim() : "";

    if (!t || t.length < cfg.minChars) {
      return NextResponse.json(
        {
          error: `Teksten er for kort for en pålitelig vurdering (minst ca. ${cfg.minChars} tegn).`,
        },
        { status: 400 }
      );
    }

    const user = `Vurder teksten under.\n\nTEKST:\n${t}`.trim();

    const resp = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: cfg.system },
        { role: "user", content: user },
      ],
    });

    const content = resp.choices[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    const standard = normalizeToStandard(toolParam, parsed);
    return NextResponse.json(standard);
  } catch {
    return NextResponse.json(
      { error: "Uventet feil ved vurdering." },
      { status: 500 }
    );
  }
}