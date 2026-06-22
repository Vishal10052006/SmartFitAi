export default function buildStyleDNA(user) {
  const dna = {
  styleIdentity: "",
  fitPreference: "",
  lifestyle: "",
  archetype: "",
  recommendedCategories: [],
  signatureColors: [],
  strengths: []
}

  // Style Identity

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

  {/*Archetype and Recommendations*/}

  if (dna.styleIdentity === "Modern Professional") {
    dna.archetype = "The Ambitious Achiever";

    dna.recommendedCategories = [
      "Blazers",
      "Tailored Trousers",
      "Oxford Shirts"
    ]

    dna.signatureColors = [
      "Navy",
      "Charcoal",
      "Camel"
    ]

    dna.strengths = [
      "Professional",
      "Polished",
      "Reliable"
    ]
  }

  // Urban Trendsetter

  else if (dna.styleIdentity === "Urban Trendsetter") {
    dna.archetype = "The Trend Pioneer";

    dna.recommendedCategories = [
      "Overshirts",
      "Cargo Pants",
      "Sneakers"
    ]

    dna.signatureColors = [
      "Olive",
      "Black",
      "Rust"
    ]

    dna.strengths = [
      "Creative",
      "Bold",
      "Expressive"
    ]
  }

  // Timeless Gentleman
  else if (dna.styleIdentity === "Timeless Gentleman") {
    dna.archetype = "The Classic Icon";

    dna.recommendedCategories = [
      "Oxford Shirts",
      "Tailored Trousers",
      "Loafers"
    ];

    dna.signatureColors = [
      "Navy",
      "Camel",
      "Olive"
    ];

    dna.strengths = [
      "Classic",
      "Refined",
      "Confident"
    ];
  }

  // Clean Minimal
  else if (dna.styleIdentity === "Clean Minimal") {
    dna.archetype = "The Minimalist";

    dna.recommendedCategories = [
      "Minimal Tees",
      "Straight Trousers",
      "White Sneakers"
    ]

    dna.signatureColors = [
      "White",
      "Grey",
      "Beige"
    ]

    dna.strengths = [
      "Clean",
      "Modern",
      "Effortless"
    ]
  }

  else if (dna.styleIdentity === "Active Lifestyle") {
    dna.archetype = "The Performer";

    dna.recommendedCategories = [
      "Joggers",
      "Performance Tees",
      "Training Shoes"
    ];

    dna.signatureColors = [
      "Black",
      "Grey",
      "Electric Blue"
    ];

    dna.strengths = [
      "Energetic",
      "Focused",
      "Confident"
    ];
  }

  else {
    dna.archetype = "The Sophisticated Leader";

    dna.recommendedCategories = [
      "Suits",
      "Dress Shirts",
      "Leather Shoes"
    ];

    dna.signatureColors = [
      "Black",
      "Burgundy",
      "Midnight Blue"
    ];

    dna.strengths = [
      "Elegant",
      "Powerful",
      "Sophisticated"
    ];
  }

  console.log("DNA OBJECT")
  console.log(dna)

  // Occasion

  if (user.occasionPreference === "College") {
    dna.lifestyle = "Campus";
  }

  else if (user.occasionPreference === "Office") {
    dna.lifestyle = "Corporate";
  }

  else if (user.occasionPreference === "Party") {
    dna.lifestyle = "Social";
  }

  else if (user.occasionPreference === "Travel") {
    dna.lifestyle = "Explorer";
  }

  else {
    dna.lifestyle = "Balanced";
  }

  // Fit Preference

  if (user.stylePreference === "Smart Casual") {
    dna.fitPreference = "Comfort + Style";
    }

    else if (user.stylePreference === "Streetwear") {
    dna.fitPreference = "Relaxed Fit";
    }

    else if (user.stylePreference === "Classic") {
    dna.fitPreference = "Tailored Fit";
    }

    else if (user.stylePreference === "Minimalist") {
    dna.fitPreference = "Clean Slim Fit";
    }

    else if (user.stylePreference === "Athleisure") {
    dna.fitPreference = "Athletic Fit";
    }

    else {
    dna.fitPreference = "Structured Fit";
    }

  return dna;
}