export default function generateOutfits(styleDNA) {
  const categories =
  styleDNA?.recommendedCategories || [];

  const colors =
    styleDNA?.signatureColors || [];

  return categories.map(
    (category, index) => ({
      name: `${colors[index % colors.length]} ${category}`,
      color: colors[index % colors.length],
      occasion: "Everyday",
      style: styleDNA?.styleIdentity,
      aiGenerated: true
    })
  );
}