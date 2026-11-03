import { env } from "cloudflare:workers";
import { z } from "zod";
import { runGroundedGeminiReview, runRichSimulatedAiReview } from "../components/brandcheck/aiReview";
import { ReviewError } from "./shared-review";
import type { Policy } from "./policy";
import { reserveAIRequest } from "./ai-quota";
import { groundAIFinding } from "./grounded-assessment";
const outputSchema = z.object({
  assessment: z.unknown().nullable().optional(),
  findings: z.array(z.object({ id: z.string().max(160), category: z.enum(["Terminology", "Claims", "Tone", "Accessibility", "Asset usage", "Messaging"]), severity: z.enum(["Needs attention", "Suggestion"]), evidenceStatus: z.enum(["Rule match", "Review suggestion", "Evidence needed"]), location: z.string().max(500), excerpt: z.string().min(1).max(10000), explanation: z.string().max(8000), sourceId: z.string().max(80), sourceVersion: z.string().max(80), suggestion: z.string().max(8000), replacement: z.object({ from: z.string().max(10000), to: z.string().max(10000) }).optional(), detectedBy: z.literal("ai").optional() })).max(60),
});
export async function runSavedAIReview(request: Request, title: string, text: string, pack: Policy) {
  const sources = pack.sources.filter(s => s.status === "Approved");
  const model = env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  if (!env.GEMINI_API_KEY) {
    const activeSourcesMap = new Map(sources.map(s => [s.id, s]));
    const simulated = runRichSimulatedAiReview({ title, text, channel: "Workspace content", audience: "Brand audience", image: null }, activeSourcesMap);
    return {
      findings: simulated.findings.map(f => groundAIFinding(f, sources)).filter((f): f is NonNullable<typeof f> => f !== null),
      assessment: simulated.assessment,
      isSimulated: true,
      model: "offline-governance-engine",
    };
  }

  if (!await reserveAIRequest(env.DB, request)) throw new ReviewError(429, "The current AI service allowance has been reached. Run rule checks or try again later.");
  const evidence = pack.evidence.filter(e => e.expiresAt >= new Date().toISOString().slice(0,10) && sources.some(s => s.id === e.sourceId && s.kind === "Evidence"));

  let result;
  try {
    result = await runGroundedGeminiReview({ title, text, channel: "Workspace content", audience: "Brand audience", image: null }, sources, pack.terms.filter(t => sources.some(s => s.id === t.sourceId)), evidence, env.GEMINI_API_KEY, model, 22000);
  } catch {
    result = { error: "Gemini connection error", isSimulated: true, findings: [], assessment: null };
  }

  if (result.error || result.isSimulated) {
    const activeSourcesMap = new Map(sources.map(s => [s.id, s]));
    const simulated = runRichSimulatedAiReview({ title, text, channel: "Workspace content", audience: "Brand audience", image: null }, activeSourcesMap);
    return {
      findings: simulated.findings.map(f => groundAIFinding(f, sources)).filter((f): f is NonNullable<typeof f> => f !== null),
      assessment: simulated.assessment,
      isSimulated: true,
      model: "offline-governance-engine",
    };
  }

  const output = outputSchema.safeParse(result);
  if (!output.success) {
    const activeSourcesMap = new Map(sources.map(s => [s.id, s]));
    const simulated = runRichSimulatedAiReview({ title, text, channel: "Workspace content", audience: "Brand audience", image: null }, activeSourcesMap);
    return {
      findings: simulated.findings.map(f => groundAIFinding(f, sources)).filter((f): f is NonNullable<typeof f> => f !== null),
      assessment: simulated.assessment,
      isSimulated: true,
      model: "offline-governance-engine",
    };
  }

  return { findings: output.data.findings.map(f => groundAIFinding(f, sources)).filter((f): f is NonNullable<typeof f> => f !== null), assessment: null, isSimulated: false, model };
}
