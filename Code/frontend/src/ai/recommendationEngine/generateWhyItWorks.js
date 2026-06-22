export default function generateWhyItWorks(
  outfit,
  styleDNA,
  bodyShape,
  skinTone
) {
  const reasons = [];

  // Skin Tone

  if (skinTone?.tone) {
    reasons.push(
      `${outfit.color} complements your ${skinTone.tone.toLowerCase()} skin tone`
    );
  }

  // Style Identity

  const styleMessages = {
    "Timeless Gentleman":
        "Creates a refined and sophisticated appearance",

    "Modern Professional":
        "Supports a polished professional image",

    "Urban Trendsetter":
        "Expresses confidence and individuality",

    "Clean Minimal":
        "Maintains a clean and modern aesthetic",

    "Active Lifestyle":
        "Balances comfort with contemporary style"
    };

    if (styleDNA?.styleIdentity) {
    reasons.push(
        styleMessages[styleDNA.styleIdentity] ||
        "Matches your personal style identity"
    );
    }

  // Body Shape

  const shapeMessages = {
    "Inverted Triangle":
        "Balances shoulder width with lower-body volume",

    "Rectangle":
        "Adds structure and visual definition",

    "Triangle":
        "Draws attention upward and balances proportions",

    "Oval":
        "Creates a longer and leaner silhouette"
    };

    if (bodyShape) {
    reasons.push(
        shapeMessages[bodyShape] ||
        `Works well for your ${bodyShape.toLowerCase()} body shape`
    );
    }

  return reasons;
}