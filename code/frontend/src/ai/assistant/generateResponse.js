import {
  saveMemory,
  getMemory
}
from "./memory";

export default function generateResponse(
  intent,
  profile
) {

  switch (intent) {

    case "OPEN_WARDROBE":
      return {
        answer: "Opening your wardrobe...",
        action: "WARDROBE"
      };

    case "SHOW_OUTFITS":
      return {
        answer: "Showing your outfit recommendations...",
        action: "FEED"
      };

    case "SHOW_COLORS":
      return {
        answer: "Opening your color palette...",
        action: "PALETTE"
      };

    case "ANALYZE_LOOK":
      return {
        answer: "Let's analyze your look.",
        action: "UPLOAD"
      };

    case "SAVE_FAVORITE_COLOR":

      saveMemory(
        "favoriteColor",
        "black"
      );

      return {
        answer:
          "Got it. I'll remember your favorite color is black."
      };

    case "GET_FAVORITE_COLOR":

      const color =
        getMemory("favoriteColor");

      return {
        answer:
          color
            ? `Your favorite color is ${color}.`
            : "I don't know your favorite color yet."
      };

    default:
      return {
        answer:
          "I can help with outfits, wardrobe, colors, and style recommendations.",
        action: null
      };
  }
}