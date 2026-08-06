export default function calculateOutfitScore(
  outfit,
  styleDNA,
  bodyShape,
  skinTone
) {
  let score = 60;

  // Real tag match, not name-string guessing (see T6.1)
  if (outfit.tags?.bodyShapeFit?.includes(bodyShape)) {
    score += 20;
  }

  if (outfit.tags?.styleIdentity?.includes(styleDNA?.styleIdentity)) {
    score += 20;
  }

  // Outfits are already skin-tone filtered by the API — this just
  // rewards having tone data present
  if (skinTone) {
    score += 10;
  }

  // No signature-color bonus: styleDNA.signatureColors is English
  // names ("Navy"), outfit.color is hex — no reliable match without
  // a lookup table. Not v1 scope.

  if (outfit.occasion === "Office") score += 5;
  if (outfit.occasion === "Weekend") score += 3;
  if (outfit.occasion === "Festive") score += 2;

  return Math.min(score, 99);
}