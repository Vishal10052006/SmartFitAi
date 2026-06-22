export default function calculateOutfitScore(
  outfit,
  styleDNA,
  bodyShape,
  skinTone
) {
  let score = 60;

  if (outfit.aiGenerated) {
    score += 20;
  }

  // Style Identity Match

  if (
    styleDNA?.styleIdentity === "Urban Trendsetter" &&
    (
      outfit.name?.toLowerCase().includes("bomber") ||
      outfit.name?.toLowerCase().includes("olive")
    )
  ) {
    score += 15;
  }

  if (
    styleDNA?.styleIdentity === "Clean Minimal" &&
    (
      outfit.name?.toLowerCase().includes("white") ||
      outfit.name?.toLowerCase().includes("minimal")
    )
  ) {
    score += 15;
  }

  if (
    styleDNA?.styleIdentity === "Modern Professional" &&
    outfit.occasion === "Office"
  ) {
    score += 15;
  }

  // Body Shape Match

  if (bodyShape === "Inverted Triangle") {
    score += 10;
  }

  // Skin Tone Match

  if (skinTone) {
    score += 10;
  }

  if (
    outfit.color &&
    styleDNA?.signatureColors?.some(
      color =>
        outfit.name?.toLowerCase().includes(
          color.toLowerCase()
        )
    )
  ) {
    score += 10;
  }

  if (
    styleDNA?.styleIdentity === "Modern Professional" &&
    (
      outfit.name?.toLowerCase().includes("linen") ||
      outfit.name?.toLowerCase().includes("chinos")
    )
  ) {
    score += 12;
  }

  if (
    styleDNA?.styleIdentity === "Urban Trendsetter" &&
    (
      outfit.name?.toLowerCase().includes("bomber") ||
      outfit.name?.toLowerCase().includes("cargo")
    )
  ) {
    score += 12;
  }

  if (
    styleDNA?.styleIdentity === "Clean Minimal" &&
    (
      outfit.name?.toLowerCase().includes("white") ||
      outfit.name?.toLowerCase().includes("tee")
    )
  ) {
    score += 12;
  }

  if (outfit.occasion === "Office") score += 5;
  if (outfit.occasion === "Weekend") score += 3;
  if (outfit.occasion === "Festive") score += 2;

  return Math.min(score, 99);
}