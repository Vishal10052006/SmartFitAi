export function getLocalResponse(question) {

  const q = question.toLowerCase();

  // Identity

  if (
    q.includes("your name") ||
    q.includes("who are you")
  ) {
    return {
      handled: true,
      answer:
        "I'm Kiara, your personal AI fashion stylist inside SmartFit AI."
    };
  }

  // Greetings

  if (
    q.includes("hello") ||
    q.includes("hi")
  ) {
    return {
      handled: true,
      answer:
        "Hi, I'm Kiara. How can I help you with your style today?"
    };
  }

  // Wardrobe
  if (q.includes("open wardrobe") || q.includes("wardrobe")) {
    return {
      handled: true,
      answer: "Opening your wardrobe.",
      action: "WARDROBE"          // ✅ was "OPEN_WARDROBE"
    };
  }

  // Outfit Feed
  if (q.includes("show outfits") || q.includes("my looks") || q.includes("outfit")) {
    return {
      handled: true,
      answer: "Let me show your outfit recommendations.",
      action: "FEED"              // ✅ was "OPEN_OUTFITS"
    };
  }

  // Color Palette — add this new one
  if (q.includes("palette") || q.includes("my colors") || q.includes("color")) {
    return {
      handled: true,
      answer: "Opening your color palette.",
      action: "PALETTE"           // ✅ matches App.jsx
    };
  }

  // Upload
  if (q.includes("analyze") || q.includes("upload") || q.includes("scan")) {
    return {
      handled: true,
      answer: "Let's analyze your photo.",
      action: "UPLOAD"            // ✅ matches App.jsx
    };
  }

  // Today outfit

  if (
    q.includes("what should i wear today")
  ) {
    return {
      handled: true,
      answer:
        "I recommend a clean casual outfit with neutral colors and comfortable layering."
    };
  }

  return {
    handled: false
  };
}