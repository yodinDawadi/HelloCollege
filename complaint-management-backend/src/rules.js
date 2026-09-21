const CATEGORY_RULES = {
  hostel: {
    department: "Hostel Administration",
    keywords: ["water", "room", "bed", "hostel", "warden"],
  },
  electricity: {
    department: "Maintenance Section",
    keywords: [
      "power",
      "electricity",
      "light",
      "short circuit",
      "shock",
      "wire",
    ],
  },
  internet: {
    department: "IT Department",
    keywords: [
      "internet",
      "wifi",
      "wi-fi",
      "network",
      "router",
      "connectivity",
    ],
  },
  sanitation: {
    department: "Sanitation Section",
    keywords: ["toilet", "garbage", "waste", "dirty", "drain", "sanitation"],
  },
  classroom: {
    department: "Maintenance Section",
    keywords: ["classroom", "desk", "bench", "projector", "fan", "board"],
  },
  laboratory: {
    department: "Laboratory Administration",
    keywords: ["lab", "laboratory", "equipment", "chemical", "computer"],
  },
  drinking_water: {
    department: "Maintenance Section",
    keywords: ["drinking water", "water filter", "tap", "water"],
  },
  other: { department: "General Administration", keywords: [] },
};

const URGENCY_KEYWORDS = {
  critical: [
    "fire",
    "smoke",
    "explosion",
    "electrocution",
    "unsafe",
    "safety",
    "danger",
    "emergency",
  ],
  high: ["leak", "flood", "no power", "broken", "blocked", "security", "theft"],
  medium: ["not working", "damaged", "repair", "slow", "dirty"],
};

function calculatePriority(category, description, similarOpenCount = 0) {
  const text = `${category} ${description}`.toLowerCase();
  let score = 1;
  let level = "low";
  for (const keyword of URGENCY_KEYWORDS.critical)
    if (text.includes(keyword)) {
      score += 5;
      level = "critical";
    }
  if (level !== "critical")
    for (const keyword of URGENCY_KEYWORDS.high)
      if (text.includes(keyword)) {
        score += 3;
        level = "high";
      }
  if (level === "low")
    for (const keyword of URGENCY_KEYWORDS.medium)
      if (text.includes(keyword)) {
        score += 2;
        level = "medium";
      }
  score += Math.min(Number(similarOpenCount) || 0, 5);
  return { score, level };
}

function routeComplaint(category) {
  const rule = CATEGORY_RULES[category];
  return { department: rule?.department || CATEGORY_RULES.other.department };
}

module.exports = { CATEGORY_RULES, calculatePriority, routeComplaint };
