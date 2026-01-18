export interface ListStat {
  statTitle: string;
  statValue: string;
  statColor: string;
}

export interface HaveItem {
  id: string;
  name: string;
  description: string;
  quality:
    | "Charms"
    | "Materials"
    | "Normal"
    | "Magic"
    | "Rare"
    | "Set"
    | "Unique";
  foundBy: string;
  location: string;
  createdAt: string;
  isReserved: boolean;
  reservedBy?: string;
  imageUrl: string;
}

export interface Player {
  id: string;
  gsfGroupId: string;
  role: string;
  accountName: string;
  characterName: string;
  hasPlayedGsf: boolean;
  preferredTimezone: string;
  preferredClass: string;
  preferredSecondaryClass: string;
  discordName: string;
}
export const classes = [
  "Amazon",
  "Assassin",
  "Barbarian",
  "Druid",
  "Necromancer",
  "Paladin",
  "Sorceress",
];

export const timezones = [
  "UTC-12:00 - Baker Island",
  "UTC-11:00 - American Samoa",
  "UTC-10:00 - Hawaii",
  "UTC-09:00 - Alaska",
  "UTC-08:00 - Pacific Time",
  "UTC-07:00 - Mountain Time",
  "UTC-06:00 - Central Time",
  "UTC-05:00 - Eastern Time",
  "UTC-04:00 - Atlantic Time",
  "UTC-03:00 - Argentina",
  "UTC-02:00 - South Georgia",
  "UTC-01:00 - Azores",
  "UTC+00:00 - London",
  "UTC+01:00 - Central Europe",
  "UTC+02:00 - Eastern Europe",
  "UTC+03:00 - Moscow",
  "UTC+04:00 - Dubai",
  "UTC+05:00 - Pakistan",
  "UTC+06:00 - Bangladesh",
  "UTC+07:00 - Thailand",
  "UTC+08:00 - China",
  "UTC+09:00 - Japan",
  "UTC+10:00 - Australia East",
  "UTC+11:00 - Solomon Islands",
  "UTC+12:00 - New Zealand",
];

export interface NeedItem {
  id: string;
  name: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  requestedBy: string;
  isActive: boolean;
  createdAt: string;
}

export type TabKey = "all" | "mine" | "requests";

export type TabState = {
  items: HaveItem[];
  cursor: { createdAt: string; id: number } | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  initialLoaded: boolean;
  filters: HaveFilters;
};

export type HaveFilters = {
  search?: string;
  qualities?: string[];
  reservable?: boolean;
};

export type ParsedItem = {
  name?: string;
  quantity?: string | number;
  type?: string;
  stats: {
    corrupted: any;
    name: string;
    value?: string | number | any;
  }[];
  corrupted?: boolean;
};

export type AddHaveItemRequest = {
  image?: File | null;
  gsfGroupId: string;
  name: string;
  description: string;
  foundBy: string;
  quality: string;
  location: string;
  isReserved: string;
  reservedBy: string;
};
