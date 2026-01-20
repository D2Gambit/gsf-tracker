import ItemDescriptionRenderer from "./have-list/ItemDescriptionRenderer";
import type { ParsedItem } from "../types/list";

interface Props {
  content:
    | { type: "image"; imageUrl: string }
    | {
        type: "text";
        description: string | ParsedItem;
        name?: string;
        foundBy?: string;
        quality?: string;
      };
  onClose: () => void;
}

export default function ItemModal({ content, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative md:max-w-[500px] w-[600px] max-h-[600px] z-10 bg-black/85 rounded-lg overflow-hidden">
        <div className="p-2">
          <div className="p-2 border border-yellow-900/70 shadow-[inset_0_0_0_1px_black,0_0_20px_rgba(0,0,0,0.9)]">
            {content.type === "image" ? (
              <img
                src={content.imageUrl}
                alt="item"
                className="w-full h-auto object-contain"
              />
            ) : (
              <ItemDescriptionRenderer
                description={content.description}
                itemName={content.name}
                foundBy={content.foundBy}
                quality={content.quality}
                className="
                  font-serif text-md leading-snug
                  bg-gradient-radial from-zinc-800 via-zinc-900 to-black
                  px-4 py-3
                  min-w-[360px]
                "
              />
            )}
          </div>
        </div>
        <div className="p-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-red-600 text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
