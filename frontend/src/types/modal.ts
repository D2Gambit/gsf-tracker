import type { ParsedItem } from "./list";

export type ModalContent =
  | { type: "image"; imageUrl: string }
  | {
      type: "text";
      description: string | ParsedItem;
      name?: string;
      foundBy?: string;
      quality?: string;
    };
