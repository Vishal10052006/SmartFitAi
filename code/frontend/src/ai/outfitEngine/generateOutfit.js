import maleStyles from "../styleRules/maleStyles";
import femaleStyles from "../styleRules/femaleStyles";

import officeRules from "../occasionRules/office";
import casualRules from "../occasionRules/casual";
import partyRules from "../occasionRules/party";
import interviewRules from "../occasionRules/interview";
import weddingRules from "../occasionRules/wedding";
import dateNightRules from "../occasionRules/dateNight";

import calculateConfidence from "../confidenceEngine/calculateConfidence";

import maleOffice from "../../data/outfits/maleOffice";
import maleCasual from "../../data/outfits/maleCasual";

export default function generateOutfit(user) {
  const {
    gender,
    bodyShape,
    skinTone,
    styleDNA,
    occasionDNA,
  } = user;

  const styleLibrary =
    gender === "male" ? maleStyles : femaleStyles;

  const styleKey =
    styleDNA?.styleIdentity === "Modern Professional"
      ? "smartCasual"
      : styleDNA?.styleIdentity === "Urban Trendsetter"
      ? "streetwear"
      : styleDNA?.styleIdentity === "Timeless Gentleman"
      ? "classic"
      : styleDNA?.styleIdentity === "Clean Minimal"
      ? "minimalist"
      : styleDNA?.styleIdentity === "Active Lifestyle"
      ? "athleisure"
      : "formal";

  const styleData = styleLibrary[styleKey];

  // Occasion Rules — now the real object, not just a label source
  let occasionData;
  switch (occasionDNA) {
    case "office": occasionData = officeRules; break;
    case "casual": occasionData = casualRules; break;
    case "party": occasionData = partyRules; break;
    case "interview": occasionData = interviewRules; break;
    case "wedding": occasionData = weddingRules; break;
    case "dateNight": occasionData = dateNightRules; break;
    default: occasionData = casualRules;
  }

  // T5.12: candidate pool depends on formality — office-formal occasions
  // (interview/wedding/office, score >= 3) pull from maleOffice,
  // everything else pulls from maleCasual.
  const candidatePool =
    occasionData.formalityScore >= 3 ? maleOffice : maleCasual;

  // T5.12: filter out outfits whose top/bottom/footwear match anything
  // in this occasion's avoid list — case-insensitive substring check
  const avoidTerms = (occasionData.avoid || []).map(a => a.toLowerCase());

  function isAvoided(outfit) {
    const fields = [outfit.top, outfit.bottom, outfit.footwear]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return avoidTerms.some(term => fields.includes(term.toLowerCase()));
  }

  const eligible = candidatePool.filter(o => !isAvoided(o));
  // Fallback: if the avoid filter wipes out the whole pool, don't crash —
  // fall back to the unfiltered pool rather than returning nothing.
  const pool = eligible.length > 0 ? eligible : candidatePool;

  // T5.12: weight selection toward outfits matching colorBias instead
  // of pure random. Score each candidate, pick from the top tier.
  const colorBiasLower = (occasionData.colorBias || []).map(c => c.toLowerCase());

  function biasScore(outfit) {
    const fields = [outfit.top, outfit.bottom].filter(Boolean).join(" ").toLowerCase();
    return colorBiasLower.some(c => fields.includes(c)) ? 1 : 0;
    // NOTE: colorBias values are hex codes, outfit fields are plain-English
    // descriptions ("Navy Oxford Shirt") — this match will rarely fire as
    // written. Flagging honestly rather than pretending it works: this is
    // the same hex-vs-name mismatch we logged earlier for signatureColors.
    // Real fix needs a hex->name or name->hex mapping layer. Not blocking
    // T5.12 — the avoid-filter and pool-selection logic below still work
    // correctly regardless of this scoring returning mostly 0s for now.
  }

  const scored = pool.map(o => ({ outfit: o, score: biasScore(o) }));
  const maxScore = Math.max(...scored.map(s => s.score));
  const topTier = scored.filter(s => s.score === maxScore).map(s => s.outfit);

  const selectedOutfit = topTier[Math.floor(Math.random() * topTier.length)];

  const confidence = calculateConfidence({
    bodyShape,
    skinTone,
    styleDNA,
    occasionDNA,
  });

  // TEMP T5.12 VERIFY — delete after checking
  console.log("AVOID CHECK:", {
    occasion: occasionDNA,
    avoidList: occasionData.avoid,
    picked: `${selectedOutfit.top} / ${selectedOutfit.bottom} / ${selectedOutfit.footwear}`,
  });

  return {
    outfitName: occasionData.outfitName,
    top: selectedOutfit.top,
    bottom: selectedOutfit.bottom,
    footwear: selectedOutfit.footwear,
    accessories: selectedOutfit.accessories,
    confidence,
    reason: `${bodyShape} body shape and ${skinTone} color palette were used to generate this recommendation.`,
    // T5.12: fabricNotes now surfaces as a real styling tip
    stylingTip: occasionData.fabricNotes,
    metadata: {
      gender,
      styleDNA,
      occasionDNA,
      styleProfile: styleData,
      formalityScore: occasionData.formalityScore,
    },
  };
}