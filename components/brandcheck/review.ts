import type {
  ApprovedAsset,
  DraftAssessment,
  DraftBody,
  EvidenceRecord,
  Finding,
  Source,
  TermRule,
} from "./model";
import { runGroundedGeminiReview } from "./aiReview";
import { DEFAULT_GEMINI_MODEL } from "./model";
import { groundAIFinding, groundedAssessment } from "../../lib/grounded-assessment";

const makeFinding = (
  source: Source,
  fields: Omit<Finding, "sourceId" | "sourceVersion">,
): Finding => ({
  ...fields,
  sourceId: source.id,
  sourceVersion: source.version,
});

export function generateAlternativeClaim(excerpt: string): { alternative: string; reason: string } {
  const lower = excerpt.toLowerCase();

  // 1. Revenue, ROI & financial claims
  if (/(?:revenue|roi|sales|profit|dollar|turnover)/i.test(lower)) {
    return {
      alternative: "proven to help drive steady, measurable revenue growth for growing teams",
      reason: "Replaces unverified financial percentages with approved value-based growth positioning.",
    };
  }

  // 2. Accuracy, prediction & zero errors/downtime
  if (/(?:accuracy|predict|zero\s+(?:operational\s+)?failures|zero\s+downtime|zero\s+errors?|zero\s+bugs?|100%\s+uptime)/i.test(lower)) {
    return {
      alternative: "high predictive reliability and resilient architecture engineered for high availability",
      reason: "Replaces absolute perfection with substantiated high-availability engineering positioning.",
    };
  }

  // 3. Human intervention & autonomous operations
  if (/(?:human\s+intervention|human\s+oversight|without\s+human|complete\s+autopilot|autopilot|replace\s+(?:your\s+)?(?:team|staff)|eliminates?\s+(?:the\s+need\s+for\s+)?(?:expensive\s+)?(?:consultants?|humans?|staff|agencies))/i.test(lower)) {
    if (/consultant|agenc|staff/i.test(lower)) {
      return {
        alternative: "empowers existing teams to execute with greater speed and internal clarity",
        reason: "Replaces workforce elimination claims with team empowerment positioning.",
      };
    }
    return {
      alternative: "with streamlined automation that keeps authorized teams in control",
      reason: "Replaces ungrounded total automation with approved human-in-the-loop workflow positioning.",
    };
  }

  // 4. Productivity multipliers & time reduction
  if (/(?:\d+x\s+productivity|workweek|inefficiency|10x|100x|1000x|\d+%\s+(?:productivity|faster|time))/i.test(lower)) {
    return {
      alternative: "designed to streamline workflows and reduce repetitive coordination overhead",
      reason: "Replaces unverified multiplier assertions with approved workflow efficiency benefits.",
    };
  }

  // 5. Cost reduction
  if (/(?:cost|overhead|expenses?|spend)/i.test(lower) && /(?:\d+%|cut|slash|save)/i.test(lower)) {
    return {
      alternative: "helps optimize operational expenses by automating routine administrative tasks",
      reason: "Replaces unsubstantiated cost-slashing numbers with verifiable operational optimization.",
    };
  }

  // 6. Absolute guarantees & infallibility
  if (/(?:guarantee|guaranteed|guarantees)/i.test(lower)) {
    return {
      alternative: "committed to helping teams achieve consistent, measurable results",
      reason: "Replaces legally risky absolute guarantees with commitment-oriented positioning.",
    };
  }

  if (/(?:never\s+makes?\s+mistakes|flawless|infallible|perfect)/i.test(lower)) {
    return {
      alternative: "engineered with continuous automated validation to minimize operational errors",
      reason: "Replaces impossible zero-defect claims with realistic engineering quality standards.",
    };
  }

  if (/(?:never\s+experiences?\s+downtime|100%\s+safe|100%\s+risk-free)/i.test(lower)) {
    return {
      alternative: "architected for enterprise-grade security and resilient uptime",
      reason: "Replaces absolute risk-free claims with substantiated enterprise resiliency standards.",
    };
  }

  // 7. Timeline & deceptive ease
  if (/(?:overnight|billion-dollar|in\s+seconds|within\s+(?:your\s+)?(?:first\s+)?(?:month|week|7\s+days|30\s+days)|no\s+effort|push\s+of\s+a\s+button)/i.test(lower)) {
    return {
      alternative: "through structured, sustainable team adoption with intuitive onboarding",
      reason: "Replaces deceptive instant timeline claims with realistic adoption milestones.",
    };
  }

  // 8. Superlatives & competitor comparisons
  if (/(?:better\s+than\s+every\s+competitor|world's\s+best|revolutionary|unbeatable|unrivaled|#1|best\s+ever|miracle)/i.test(lower)) {
    return {
      alternative: "purpose-built with differentiated collaboration capabilities",
      reason: "Replaces unsubstantiated superlatives with concrete product capability positioning.",
    };
  }

  // 9. Customer numbers
  if (/(?:\d+\s+million\s+companies|trusted\s+by\s+\d+)/i.test(lower)) {
    return {
      alternative: "trusted by forward-thinking, high-growth organizations",
      reason: "Replaces unverified adoption statistics with approved community scale descriptors.",
    };
  }

  // 10. General numeric percentage or multiplier
  return {
    alternative: "proven to help teams achieve significant, measurable workflow improvements",
    reason: "Replaces unverified quantitative metric with approved benefit description.",
  };
}

export function reviewDraft(
  body: DraftBody,
  sources: Source[],
  terms: TermRule[],
  evidence: EvidenceRecord[] = [],
  approvedAssets: ApprovedAsset[] = [],
): Finding[] {
  const active = new Map(
    sources
      .filter((source) => source.status === "Approved")
      .map((source) => [source.id, source]),
  );
  const findings: Finding[] = [];
  for (const section of [
    { key: "title", location: "Draft title", text: body.title },
    { key: "text", location: "Draft text", text: body.text },
  ]) {
    const text = section.text.trim();
    if (!text) continue;

    for (const term of terms) {
      const source = active.get(term.sourceId);
      if (!source || !term.retired.trim() || !term.preferred.trim()) continue;
      const escaped = term.retired.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const candidates = text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"));
      const match = Array.from(candidates).find(candidate => {
        const start = candidate.index ?? 0;
        const offset = term.preferred.toLowerCase().indexOf(term.retired.toLowerCase());
        if (offset < 0 || start < offset) return true;
        const preferredStart = start - offset;
        const end = preferredStart + term.preferred.length;
        const isPreferred = text.slice(preferredStart, end).toLowerCase() === term.preferred.toLowerCase()
          && !/[\p{L}\p{N}]/u.test(text[end] || " ");
        return !isPreferred;
      });
      if (match)
        findings.push(
          makeFinding(source, {
            id: `term:${section.key}:${term.id}`,
            category: "Terminology",
            severity: "Needs attention",
            evidenceStatus: "Rule match",
            location: section.location,
            excerpt: match[0],
            explanation: `“${term.retired}” is a retired name. The approved term is “${term.preferred}”.`,
            suggestion: `Replace “${match[0]}” with “${term.preferred}”.`,
            replacement: { from: match[0], to: term.preferred },
          }),
        );
    }

    const claimSource =
      Array.from(active.values()).find((s) => s.kind === "Claim policy") ||
      active.get("CLAIM-001");
    const numericClaims = [
      ...text.matchAll(
        /\b(?:\d+(?:\.\d+)?\s?(?:x|×|%|percent|times)(?!\w)|double\b|triple\b)/gi,
      ),
    ];
    for (const [index, numericClaim] of numericClaims.entries()) {
      const start = numericClaim.index ?? 0;
      const nextStart = numericClaims[index + 1]?.index ?? text.length;
      const tail = text
        .slice(start + numericClaim[0].length, Math.min(nextStart, start + 100))
        .split(/[.!?\n]/, 1)[0]
        .trim();
      const excerpt = `${numericClaim[0]}${tail ? ` ${tail}` : ""}`;
      const supportedClaim = evidence.some((record) => {
        const phrase = record.claim.trim().replace(/\s+/g, " ");
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return (
          phrase.length > 0 &&
          active.has(record.sourceId) &&
          active.get(record.sourceId)?.kind === "Evidence" &&
          record.expiresAt >= new Date().toISOString().slice(0, 10) &&
          new RegExp(
            `(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
            "iu",
          ).test(excerpt.replace(/\s+/g, " "))
        );
      });
      if (claimSource && !supportedClaim) {
        const { alternative, reason } = generateAlternativeClaim(excerpt);
        findings.push(
          makeFinding(claimSource, {
            id: `claim:${section.key}:${index}`,
            category: "Claims",
            severity: "Needs attention",
            evidenceStatus: "Evidence needed",
            location: section.location,
            excerpt,
            explanation:
              `This sounds like a measurable performance claim. ${reason} The approved pack does not contain evidence for it. BrandCheck has not determined whether it is true or false.`,
            suggestion:
              `Alternative claim: Replace with “${alternative}” (or link current approved evidence in Brand guidelines).`,
            replacement: { from: excerpt, to: alternative },
          }),
        );
      }
    }

    const toneSource =
      Array.from(active.values()).find(
        (s) =>
          s.id.includes("TONE") ||
          (s.kind === "Messaging" && /tone|voice/i.test(s.title)),
      ) || active.get("TONE-001");
    const absolute = text.match(
      /\b(?:guarantee(?:s|d)?|always|never|every team|perfect|best ever|miracle cure)\b/i,
    );
    if (toneSource && absolute) {
      const { alternative } = generateAlternativeClaim(absolute[0]);
      findings.push(
        makeFinding(toneSource, {
          id: `tone:${section.key}:absolute`,
          category: "Tone",
          severity: "Suggestion",
          evidenceStatus: "Review suggestion",
          location: section.location,
          excerpt: absolute[0],
          explanation:
            "This wording may sound more absolute than the approved clear, specific voice. A person should decide in context.",
          suggestion:
            `Alternative wording: Replace “${absolute[0]}” with “${alternative}”.`,
          replacement: { from: absolute[0], to: alternative },
        }),
      );
    }
  }

  if (body.image) {
    const accessSource =
      Array.from(active.values()).find((s) => s.kind === "Accessibility") ||
      active.get("ACCESS-001");
    if (accessSource && !body.image.decorative && !body.image.alt.trim())
      findings.push(
        makeFinding(accessSource, {
          id: "access:alt",
          category: "Accessibility",
          severity: "Needs attention",
          evidenceStatus: "Rule match",
          location: `Image: ${body.image.name}`,
          excerpt: "Alternative text is empty",
          explanation:
            "The image is marked meaningful but has no alternative text for people who cannot see it.",
          suggestion:
            "Describe the information conveyed by the image, or mark it decorative if it adds no information.",
        }),
      );
    const assetSource =
      Array.from(active.values()).find((s) => s.kind === "Asset policy") ||
      active.get("ASSET-001");
    if (
      assetSource &&
      body.image.source === "upload" &&
      !approvedAssets.some((asset) => asset.sha256 === body.image?.sha256)
    )
      findings.push(
        makeFinding(assetSource, {
          id: "asset:unapproved",
          category: "Asset usage",
          severity: "Needs attention",
          evidenceStatus: "Evidence needed",
          location: `Image: ${body.image.name}`,
          excerpt: body.image.name,
          explanation:
            "The uploaded file fingerprint is not in this workspace’s approved asset library. This does not prove the visual is off-brand.",
          suggestion:
            "Ask an authorised reviewer to confirm the visual, or choose an approved asset.",
        }),
      );
  }
  return findings;
}

export interface HybridReviewOptions {
  mode: "hybrid" | "rules";
  apiKey?: string;
  modelName?: string;
}

export interface HybridReviewOutput {
  findings: Finding[];
  assessment: DraftAssessment | null;
  notice: string | null;
  isSimulated: boolean;
}

/**
 * Hybrid review pipeline:
 * Combines fast deterministic rules with grounded Gemini AI analysis
 * for nuanced tone, multi-claim verification, and executive assessment.
 */
export async function reviewDraftHybrid(
  body: DraftBody,
  sources: Source[],
  terms: TermRule[],
  evidence: EvidenceRecord[] = [],
  approvedAssetsOrOptions?: ApprovedAsset[] | HybridReviewOptions,
  maybeOptions?: HybridReviewOptions,
): Promise<HybridReviewOutput> {
  let approvedAssets: ApprovedAsset[] = [];
  let options: HybridReviewOptions = { mode: "hybrid" };

  if (Array.isArray(approvedAssetsOrOptions)) {
    approvedAssets = approvedAssetsOrOptions;
    if (maybeOptions) options = maybeOptions;
  } else if (
    approvedAssetsOrOptions &&
    typeof approvedAssetsOrOptions === "object"
  ) {
    options = approvedAssetsOrOptions;
  }

  const deterministicFindings = reviewDraft(
    body,
    sources,
    terms,
    evidence,
    approvedAssets,
  );

  if (options.mode === "rules") {
    return {
      findings: deterministicFindings,
      assessment: null,
      notice: null,
      isSimulated: false,
    };
  }

  // Run Grounded Gemini AI
  const aiResult = await runGroundedGeminiReview(
    body,
    sources,
    terms,
    evidence,
    options.apiKey,
    options.modelName || DEFAULT_GEMINI_MODEL,
  );

  // Preserve rule findings and accept only source-compatible AI leads.
  const merged: Finding[] = [...deterministicFindings];

  for (const rawFinding of aiResult.findings || []) {
    const aiFinding = groundAIFinding(rawFinding, sources);
    if (!aiFinding) continue;
    const isDuplicate = merged.some(
      (existing) =>
        existing.category === aiFinding.category &&
        existing.sourceId === aiFinding.sourceId &&
        ((body.image && existing.category === "Accessibility" &&
          existing.location.startsWith("Image:") && !body.image.alt.trim()) ||
        existing.excerpt
          .toLowerCase()
          .includes(aiFinding.excerpt.toLowerCase()) ||
          aiFinding.excerpt
            .toLowerCase()
            .includes(existing.excerpt.toLowerCase())),
    );

    if (!isDuplicate) {
      merged.push(aiFinding);
    }
  }

  let notice: string | null = null;
  if (aiResult.error) {
    notice = `AI Review notice: ${aiResult.error} (Fallback active)`;
  } else if (aiResult.isSimulated) {
    notice = options.apiKey?.trim()
      ? "AI review simulation completed."
      : "Gemini offline demo active. Enter a Gemini API Key in settings for live SOTA reasoning.";
  } else {
    notice = `Analyzed live using Google Gemini (${aiResult.model || options.modelName || DEFAULT_GEMINI_MODEL}).`;
  }

  return {
    findings: merged,
    assessment: aiResult.assessment ?? (merged.length > 0 ? groundedAssessment(merged, body.text) : null),
    notice,
    isSimulated: Boolean(aiResult.isSimulated),
  };
}
