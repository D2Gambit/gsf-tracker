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

export interface NeedItem {
  id: string;
  name: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  requestedBy: string;
  isActive: boolean;
  createdAt: string;
}

export type TabTypes = "all" | "mine";

export type ParsedItem = {
  name?: string;
  stats: { name: string; value?: string | number | any }[];
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
