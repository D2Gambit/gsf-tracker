import type { HaveItem } from "../../types/list";
import ItemDescriptionRenderer from "./ItemDescriptionRenderer";
import { normalizeDescriptionForModal } from "../../utils/strings";
import type { LootItem } from "../../types/loot";
import { useLayoutEffect, useRef, useState } from "react";

type HoverPreviewProps = {
  item: HaveItem | LootItem;
  position: { x: number; y: number };
};

export function HoverPreview({ item, position }: HoverPreviewProps) {
  const normalized = normalizeDescriptionForModal(item.description, item.name);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const offset = 16;

  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [item]);

  const left = Math.min(
    position.x + offset,
    window.innerWidth - size.width - offset
  );

  const top = Math.min(
    position.y + offset,
    window.innerHeight - size.height - offset
  );
  return (
    <div
      className="fixed z-50 pointer-events-none"
      ref={ref}
      style={{
        left,
        top,
      }}
    >
      <div className="rounded-lg shadow-xl border border-gray-300 p-3 max-w-xs relative md:max-w-[500px] w-[600px] max-h-[600px] z-10 bg-black/85 rounded-lg overflow-hidden">
        <div className="p-2 border border-yellow-900/70 shadow-[inset_0_0_0_1px_black,0_0_20px_rgba(0,0,0,0.9)]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="rounded-md max-h-500 object-contain"
            />
          ) : (
            <ItemDescriptionRenderer
              description={normalized.description}
              itemName={item.name}
              foundBy={item.foundBy}
              quality={item.quality}
              className="font-serif text-md leading-snug bg-gradient-radial from-zinc-800 via-zinc-900 to-black px-4 py-3 min-w-[360px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
