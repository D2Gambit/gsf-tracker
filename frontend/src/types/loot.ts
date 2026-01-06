export interface LootItem {
  id: string;
  name: string;
  imageUrl: string;
  foundBy: string;
  createdAt: string;
  description?: string;
  quality?: string;
}

export interface LootUploadItem {
  image: File | null;
  name: string;
  description: string;
  gsfGroupId: string;
  quality: string;
}
