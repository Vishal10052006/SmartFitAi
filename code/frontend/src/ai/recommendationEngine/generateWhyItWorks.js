export default function generateWhyItWorks(
  outfit,
  styleDNA,
  bodyShape,
  skinTone
) {
  const reasons = [];

  // Skin tone — fixed: no longer prints raw hex, uses outfit.name
  // or a generic phrase instead
  if (skinTone) {
    reasons.push(
      `This shade complements your ${skinTone.toLowerCase()} skin tone`
    );
  }

  const styleMatch = outfit.tags?.styleIdentity?.includes(
    styleDNA?.styleIdentity
  );
  if (styleMatch) {
    const STYLE_REASONS = {
      "Timeless Gentleman": "fits your refined, classic aesthetic",
      "Modern Professional": "supports your polished professional image",
      "Urban Trendsetter": "matches your bold, expressive style",
      "Clean Minimal": "keeps your look clean and modern",
      "Active Lifestyle": "balances comfort with contemporary style",
    };
    reasons.push(
      STYLE_REASONS[styleDNA.styleIdentity] ||
        "matches your personal style identity"
    );
  }

  const shapeMatch = outfit.tags?.bodyShapeFit?.includes(bodyShape);
  if (shapeMatch) {
    const SHAPE_REASONS = {
      "Inverted Triangle": "balances shoulder width with lower-body volume",
      Rectangle: "adds structure and visual definition",
      Triangle: "draws attention upward and balances proportions",
      Oval: "creates a longer, leaner silhouette",
      Hourglass: "complements your natural waist definition",
      Trapezoid: "works with your naturally balanced proportions",
    };
    reasons.push(
      SHAPE_REASONS[bodyShape] ||
        `works well for your ${bodyShape.toLowerCase()} body shape`
    );
  }

  if (outfit.occasion === "Office" || outfit.occasion === "Formal") {
    reasons.push("appropriate formality for professional settings");
  }

  if (reasons.length === 0) {
    reasons.push("a versatile option worth considering");
  }

  return reasons;
}