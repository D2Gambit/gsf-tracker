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
