export function getQualityColor(quality: string) {
  switch (quality) {
    case "Charms":
      return "bg-purple-100 text-purple-800";
    case "Materials":
      return "bg-red-100 text-red-800";
    case "Normal":
      return "bg-gray-100 text-gray-800";
    case "Magic":
      return "bg-blue-100 text-blue-800";
    case "Rare":
      return "bg-yellow-100 text-yellow-600";
    case "Set":
      return "bg-green-100 text-green-800";
    case "Unique":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getTitleColor(quality: string) {
  switch (quality) {
    case "Charms":
      return "text-purple-800";
    case "Materials":
      return "text-red-500";
    case "Normal":
      return "text-white";
    case "Magic":
      return "text-blue-800";
    case "Rare":
      return "text-yellow-400";
    case "Set":
      return "text-green-800";
    case "Unique":
      return "text-orange-300";
    default:
      return "text-white";
  }
}

// Material name arrays for color coding

export const materialName = {
  redName: [
    "Vex Rune",
    "Ohm Rune",
    "Lo Rune",
    "Sur Rune",
    "Ber Rune",
    "Jah Rune",
    "Cham Rune",
    "Zod Rune",
    "Worldstone",
    "Puzzlebox",
    "Demonic Cube",
    "Catalyst",
  ],

  whiteName: [
    "Ruby",
    "Sapphire",
    "Emerald",
    "Diamond",
    "Amethyst",
    "Skull",
    "Rejuvenation",
  ],

  tealName: ["Essence of"],

  goldName: ["Infusion", "Infused"],
};
