export default function buildStyleDNA(user) {
  const dna = {
    styleIdentity: "",
    fitPreference: "",
    lifestyle: "",
    archetype: "",
    recommendedCategories: [],
    signatureColors: [],
    strengths: [],
    bodyShapeTip: null,   // NEW
    skinToneNote: null,   // NEW
  }

  // Style Identity — unchanged, still quiz-driven
  if (user.stylePreference === "Smart Casual") {
    dna.styleIdentity = "Modern Professional";
  }
  else if (user.stylePreference === "Streetwear") {
    dna.styleIdentity = "Urban Trendsetter";
  }
  else if (user.stylePreference === "Classic") {
    dna.styleIdentity = "Timeless Gentleman";
  }
  else if (user.stylePreference === "Minimalist") {
    dna.styleIdentity = "Clean Minimal";
  }
  else if (user.stylePreference === "Athleisure") {
    dna.styleIdentity = "Active Lifestyle";
  }
  else {
    dna.styleIdentity = "Elegant Formal";
  }

  // Archetype + base recommendations — unchanged block, same as before
  if (dna.styleIdentity === "Modern Professional") {
    dna.archetype = "The Ambitious Achiever";
    dna.recommendedCategories = ["Blazers", "Tailored Trousers", "Oxford Shirts"];
    dna.signatureColors = ["Navy", "Charcoal", "Camel"];
    dna.strengths = ["Professional", "Polished", "Reliable"];
  }
  else if (dna.styleIdentity === "Urban Trendsetter") {
    dna.archetype = "The Trend Pioneer";
    dna.recommendedCategories = ["Overshirts", "Cargo Pants", "Sneakers"];
    dna.signatureColors = ["Olive", "Black", "Rust"];
    dna.strengths = ["Creative", "Bold", "Expressive"];
  }
  else if (dna.styleIdentity === "Timeless Gentleman") {
    dna.archetype = "The Classic Icon";
    dna.recommendedCategories = ["Oxford Shirts", "Tailored Trousers", "Loafers"];
    dna.signatureColors = ["Navy", "Camel", "Olive"];
    dna.strengths = ["Classic", "Refined", "Confident"];
  }
  else if (dna.styleIdentity === "Clean Minimal") {
    dna.archetype = "The Minimalist";
    dna.recommendedCategories = ["Minimal Tees", "Straight Trousers", "White Sneakers"];
    dna.signatureColors = ["White", "Grey", "Beige"];
    dna.strengths = ["Clean", "Modern", "Effortless"];
  }
  else if (dna.styleIdentity === "Active Lifestyle") {
    dna.archetype = "The Performer";
    dna.recommendedCategories = ["Joggers", "Performance Tees", "Training Shoes"];
    dna.signatureColors = ["Black", "Grey", "Electric Blue"];
    dna.strengths = ["Energetic", "Focused", "Confident"];
  }
  else {
    dna.archetype = "The Sophisticated Leader";
    dna.recommendedCategories = ["Suits", "Dress Shirts", "Leather Shoes"];
    dna.signatureColors = ["Black", "Burgundy", "Midnight Blue"];
    dna.strengths = ["Elegant", "Powerful", "Sophisticated"];
  }

  // ---- NEW: Body shape layer (separate signal, not blended into archetype string) ----
  const BODY_SHAPE_TIPS = {
    "Inverted Triangle": "Balance broad shoulders with volume on the lower half",
    "Triangle": "Draw attention upward with structured tops and bold necklines",
    "Hourglass": "Emphasize your waist — belted and fitted pieces work best",
    "Rectangle": "Add definition with layering, belts, and textured pieces",
    "Oval": "Vertical lines and A-line silhouettes create a streamlined look",
    "Trapezoid": "Athletic build — slim-fit and tailored cuts show your physique well",
  };

  if (user.bodyShape && BODY_SHAPE_TIPS[user.bodyShape]) {
    dna.bodyShapeTip = BODY_SHAPE_TIPS[user.bodyShape];
    dna.strengths = [...dna.strengths, `${user.bodyShape} Aware`];
  }

  // ---- NEW: Skin tone layer — overrides signatureColors with REAL analyzed
  // colors when available, instead of the static per-style-identity guess ----
  if (user.colourPalette?.best?.length) {
    dna.signatureColors = user.colourPalette.best; // hex values from build_color_intelligence
    dna.skinToneNote = `Colors calibrated to your ${user.skinTone || "analyzed"} skin tone`;
  } else if (user.skinTone) {
    // Skin tone known but no palette passed in — note it without overriding colors
    dna.skinToneNote = `Skin tone on file: ${user.skinTone}`;
  }

  // Occasion / Lifestyle — unchanged
  if (user.occasionPreference === "College") dna.lifestyle = "Campus";
  else if (user.occasionPreference === "Office") dna.lifestyle = "Corporate";
  else if (user.occasionPreference === "Party") dna.lifestyle = "Social";
  else if (user.occasionPreference === "Travel") dna.lifestyle = "Explorer";
  else dna.lifestyle = "Balanced";

  // Fit Preference — unchanged
  if (user.stylePreference === "Smart Casual") dna.fitPreference = "Comfort + Style";
  else if (user.stylePreference === "Streetwear") dna.fitPreference = "Relaxed Fit";
  else if (user.stylePreference === "Classic") dna.fitPreference = "Tailored Fit";
  else if (user.stylePreference === "Minimalist") dna.fitPreference = "Clean Slim Fit";
  else if (user.stylePreference === "Athleisure") dna.fitPreference = "Athletic Fit";
  else dna.fitPreference = "Structured Fit";

  return dna;
}