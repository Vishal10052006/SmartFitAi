export default function detectIntent(question) {

  console.log("QUESTION RECEIVED:", question);

  const q = question.toLowerCase();

  // MEMORY

  if (
    q.includes("favorite color") ||
    q.includes("favourite colour") ||
    q.includes("favorite colour") ||
    q.includes("favourite color") ||
    q.includes("my color is") ||
    q.includes("my colour is")||
    q.includes("favourite colour")
  ) {
    console.log("INTENT DETECTED: SAVE_FAVORITE_COLOR");
    return "SAVE_FAVORITE_COLOR";
  }

  if (
    q.includes("what color do i like") ||
    q.includes("what colour do i like")
  ) {
    console.log("INTENT DETECTED: GET_FAVORITE_COLOR");
    return "GET_FAVORITE_COLOR";
  }

  // NAVIGATION

  if (
    q.includes("wardrobe") ||
    q.includes("saved looks")
  ) {
    console.log("INTENT DETECTED: OPEN_WARDROBE");
    return "OPEN_WARDROBE";
  }

  if (
    q.includes("outfits") ||
    q.includes("looks") ||
    q.includes("recommendation")
  ) {
    console.log("INTENT DETECTED: SHOW_OUTFITS");
    return "SHOW_OUTFITS";
  }

  if (
    q.includes("color") ||
    q.includes("palette")
  ) {
    console.log("INTENT DETECTED: SHOW_COLORS");
    return "SHOW_COLORS";
  }

  if (
    q.includes("analyze") ||
    q.includes("analyse") ||
    q.includes("my look")
  ) {
    console.log("INTENT DETECTED: ANALYZE_LOOK");
    return "ANALYZE_LOOK";
  }

  console.log("INTENT DETECTED: GENERAL");
  return "GENERAL";
}