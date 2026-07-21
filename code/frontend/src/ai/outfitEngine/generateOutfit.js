import maleStyles from "../styleRules/maleStyles";
import femaleStyles from "../styleRules/femaleStyles";

import officeRules from "../occasionRules/office";
import casualRules from "../occasionRules/casual";
import partyRules from "../occasionRules/party";
import interviewRules from "../occasionRules/interview";
import weddingRules from "../occasionRules/wedding";
import dateNightRules from "../occasionRules/dateNight";

import calculateConfidence from "../confidenceEngine/calculateConfidence";

import maleOffice from "../../data/outfits/maleOffice";
import maleCasual from "../../data/outfits/maleCasual";

export default function generateOutfit(user) {
  const {
    gender,
    bodyShape,
    skinTone,
    styleDNA,
    occasionDNA,
  } = user;

  // Gender Style Data
  const styleLibrary =
    gender === "male" ? maleStyles : femaleStyles;

  const styleKey =
    styleDNA?.styleIdentity === "Modern Professional"
      ? "smartCasual"
      : styleDNA?.styleIdentity === "Urban Trendsetter"
      ? "streetwear"
      : styleDNA?.styleIdentity === "Timeless Gentleman"
      ? "classic"
      : styleDNA?.styleIdentity === "Clean Minimal"
      ? "minimalist"
      : styleDNA?.styleIdentity === "Active Lifestyle"
      ? "athleisure"
      : "formal";

  const styleData = styleLibrary[styleKey];

  console.log("STYLE DATA");
  console.log(styleData);

  // Occasion Rules
  let occasionData;

  switch (occasionDNA) {
    case "office":
      occasionData = officeRules;
      break;

    case "casual":
      occasionData = casualRules;
      break;

    case "party":
      occasionData = partyRules;
      break;

    case "interview":
      occasionData = interviewRules;
      break;

    case "wedding":
      occasionData = weddingRules;
      break;

    case "dateNight":
      occasionData = dateNightRules;
      break;

    default:
      occasionData = casualRules;
  }

  // Outfit Selection
  let selectedOutfit;

  if (occasionDNA === "office") {
    selectedOutfit =
        maleOffice[Math.floor(Math.random() * maleOffice.length)];
    } else {
    selectedOutfit =
        maleCasual[Math.floor(Math.random() * maleCasual.length)];
    }

  // Confidence Score
  const confidence = calculateConfidence({
    bodyShape,
    skinTone,
    styleDNA,
    occasionDNA,
  });

  // Final Recommendation
  return {
    outfitName: occasionData.outfitName,

    top: selectedOutfit.top,

    bottom: selectedOutfit.bottom,

    footwear: selectedOutfit.footwear,

    accessories: selectedOutfit.accessories,

    confidence,

    reason: `${bodyShape} body shape and ${skinTone} color palette were used to generate this recommendation.`,

    metadata: {
      gender,
      styleDNA,
      occasionDNA,
      styleProfile: styleData,
    },
  };
}