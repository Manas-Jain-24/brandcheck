import type { DraftBody, EvidenceRecord, Source, TermRule } from "./model";
import { seedSources, seedTerms, demoBody } from "./model";

export interface BrandProfile {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  industry: string;
  sources: Source[];
  terms: TermRule[];
  evidence: EvidenceRecord[];
  sampleDraft: DraftBody;
}

export const DEMO_BRANDS: BrandProfile[] = [
  {
    id: "novadesk",
    name: "NovaDesk",
    avatar: "N",
    tagline: "Fictional demo brand",
    industry: "B2B SaaS Workspace",
    sources: structuredClone(seedSources),
    terms: structuredClone(seedTerms),
    evidence: [],
    sampleDraft: structuredClone(demoBody),
  },
  {
    id: "aura-health",
    name: "Aura Health",
    avatar: "A",
    tagline: "Biotech & Daily Wellness",
    industry: "Consumer Health & Biotech",
    sources: [
      {
        id: "AURA-TERM-001",
        title: "Product naming",
        body: "Aura Health is the approved company and product name. AuraCare was the legacy product name and is retired.",
        version: "1.0",
        updated: "2026-10-28",
        kind: "Terminology",
        status: "Approved",
      },
      {
        id: "AURA-MSG-001",
        title: "Approved positioning",
        body: "Aura Health provides personalized daily cellular wellness and vitality support designed to complement a healthy lifestyle.",
        version: "1.0",
        updated: "2026-10-28",
        kind: "Messaging",
        status: "Approved",
      },
      {
        id: "AURA-CLAIM-001",
        title: "Clinical efficacy & cure claims",
        body: "Medical outcome, curative, or disease elimination claims (e.g. '100% cure', 'eliminates all fatigue') require peer-reviewed double-blind clinical trial evidence on file. No evidence for absolute cure is approved.",
        version: "1.0",
        updated: "2026-10-28",
        kind: "Claim policy",
        status: "Approved",
      },
      {
        id: "AURA-TONE-001",
        title: "Voice and responsible guidance",
        body: "Adopt an empathetic, responsible tone. Avoid absolute promises like 'miracle cure' or 'guaranteed recovery'. Content must not offer clinical diagnoses without physician review.",
        version: "1.0",
        updated: "2026-10-28",
        kind: "Messaging",
        status: "Approved",
      },
      {
        id: "AURA-ACCESS-001",
        title: "Image descriptions",
        body: "Clinical infographics and supplement visuals require accurate, descriptive alternative text for accessibility.",
        version: "1.0",
        updated: "2026-10-28",
        kind: "Accessibility",
        status: "Approved",
      },
      {
        id: "AURA-ASSET-001",
        title: "Approved visual assets",
        body: "Only use laboratory-verified packaging visuals and brand photography from the approved asset library.",
        version: "1.0",
        updated: "2026-10-28",
        kind: "Asset policy",
        status: "Approved",
      },
    ],
    terms: [
      {
        id: "term-auracare",
        retired: "AuraCare",
        preferred: "Aura Health",
        sourceId: "AURA-TERM-001",
      },
    ],
    evidence: [],
    sampleDraft: {
      title: "Aura Health Morning Vitality Campaign",
      channel: "Instagram & Newsletter",
      audience: "Health-conscious professionals",
      text: "AuraCare is a miracle cure that eliminates 100% of morning fatigue forever. Our clinical formula guarantees complete recovery from day one.",
      image: {
        name: "aura-vitality.png",
        mime: "image/png",
        bytes: 0,
        sha256: "aura-approved-asset",
        alt: "",
        decorative: false,
        source: "approved-demo",
      },
    },
  },
  {
    id: "vertex-capital",
    name: "Vertex Capital",
    avatar: "V",
    tagline: "Quantitative Wealth Management",
    industry: "Fintech & Asset Management",
    sources: [
      {
        id: "VTX-TERM-001",
        title: "Fund and platform naming",
        body: "Vertex Alpha Fund is the approved institutional vehicle name. The legacy crypto token 'VertexCoin' has been liquidated and must not appear in any publication.",
        version: "1.0",
        updated: "2026-10-29",
        kind: "Terminology",
        status: "Approved",
      },
      {
        id: "VTX-MSG-001",
        title: "Approved investment positioning",
        body: "Vertex Capital manages algorithmic multi-asset quantitative wealth portfolios for accredited and institutional clients.",
        version: "1.0",
        updated: "2026-10-29",
        kind: "Messaging",
        status: "Approved",
      },
      {
        id: "VTX-CLAIM-001",
        title: "Returns and performance guarantees",
        body: "Promising specific return multipliers (e.g. '500% ROI' or 'guaranteed yield') or claiming 'zero risk' violates SEC and FINRA advertising compliance. All performance statements require audited prospectus evidence.",
        version: "1.0",
        updated: "2026-10-29",
        kind: "Claim policy",
        status: "Approved",
      },
      {
        id: "VTX-TONE-001",
        title: "Fiduciary tone and risk disclaimers",
        body: "Maintain conservative, transparent fiduciary language. Explicitly state that capital is at risk; never promise risk-free returns or use gambling metaphors.",
        version: "1.0",
        updated: "2026-10-29",
        kind: "Messaging",
        status: "Approved",
      },
      {
        id: "VTX-ACCESS-001",
        title: "Financial charts and data visualization",
        body: "All yield charts and performance graphs must have descriptive text alternatives detailing axes and data periods.",
        version: "1.0",
        updated: "2026-10-29",
        kind: "Accessibility",
        status: "Approved",
      },
      {
        id: "VTX-ASSET-001",
        title: "Approved compliance seals",
        body: "Regulatory badges and audit disclosures must be sourced from the approved compliance asset registry.",
        version: "1.0",
        updated: "2026-10-29",
        kind: "Asset policy",
        status: "Approved",
      },
    ],
    terms: [
      {
        id: "term-vertexcoin",
        retired: "VertexCoin",
        preferred: "Vertex Alpha Fund",
        sourceId: "VTX-TERM-001",
      },
    ],
    evidence: [],
    sampleDraft: {
      title: "Vertex Alpha Fund Investor Announcement",
      channel: "Investor Briefing",
      audience: "High-net-worth investors",
      text: "Invest in VertexCoin today for a guaranteed 500% ROI with zero downside risk. The safest yield in modern algorithmic finance.",
      image: {
        name: "vertex-portfolio.png",
        mime: "image/png",
        bytes: 0,
        sha256: "vertex-approved-asset",
        alt: "",
        decorative: false,
        source: "approved-demo",
      },
    },
  },
];

export function createCustomBrand(
  name: string,
  industry: string,
  retiredTerm: string,
  preferredTerm: string,
  draftText?: string,
): BrandProfile {
  const cleanName = name.trim();
  const id = `custom-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const avatar = cleanName.charAt(0).toUpperCase() || "B";
  const termSourceId = `${id.toUpperCase().slice(0, 8)}-TERM-001`;
  const claimSourceId = `${id.toUpperCase().slice(0, 8)}-CLAIM-001`;
  const toneSourceId = `${id.toUpperCase().slice(0, 8)}-TONE-001`;

  const sources: Source[] = [
    {
      id: termSourceId,
      title: `${cleanName} brand naming`,
      body: `${preferredTerm} is the approved name. “${retiredTerm}” is retired and must not appear in publication.`,
      version: "1.0",
      updated: new Date().toISOString().slice(0, 10),
      kind: "Terminology",
      status: "Approved",
    },
    {
      id: claimSourceId,
      title: "Promotional claims & measurements",
      body: `All quantified performance claims and metric guarantees for ${cleanName} require verified evidence on file.`,
      version: "1.0",
      updated: new Date().toISOString().slice(0, 10),
      kind: "Claim policy",
      status: "Approved",
    },
    {
      id: toneSourceId,
      title: "Brand voice and tone",
      body: `Communicate with clear, accurate language. Avoid unsupported absolute promises like “guarantees” or “perfect”.`,
      version: "1.0",
      updated: new Date().toISOString().slice(0, 10),
      kind: "Messaging",
      status: "Approved",
    },
    {
      id: `${id.toUpperCase().slice(0, 8)}-ACCESS-001`,
      title: "Image accessibility",
      body: "Meaningful images require informative alternative text describing their content.",
      version: "1.0",
      updated: new Date().toISOString().slice(0, 10),
      kind: "Accessibility",
      status: "Approved",
    },
    {
      id: `${id.toUpperCase().slice(0, 8)}-ASSET-001`,
      title: "Approved visual assets",
      body: "Use assets verified in the approved library.",
      version: "1.0",
      updated: new Date().toISOString().slice(0, 10),
      kind: "Asset policy",
      status: "Approved",
    },
  ];

  const terms: TermRule[] = [
    {
      id: `term-${id}`,
      retired: retiredTerm.trim(),
      preferred: preferredTerm.trim(),
      sourceId: termSourceId,
    },
  ];

  const sampleDraft: DraftBody = {
    title: `${cleanName} Launch Announcement`,
    channel: "Social & Web",
    audience: "Prospective customers",
    text: draftText?.trim() || `${retiredTerm} guarantees 2x productivity for every team. Discover the power of ${preferredTerm}.`,
    image: {
      name: `${id}-hero.png`,
      mime: "image/png",
      bytes: 0,
      sha256: `${id}-asset`,
      alt: "",
      decorative: false,
      source: "approved-demo",
    },
  };

  return {
    id,
    name: cleanName,
    avatar,
    tagline: industry.trim() || "Custom Brand",
    industry: industry.trim() || "Custom Brand",
    sources,
    terms,
    evidence: [],
    sampleDraft,
  };
}

