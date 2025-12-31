import { useEffect, useState } from "react";

type ImageTooltipProps = {
  imageUrl: string | null;
};

export default function ImageTooltip({ imageUrl }: ImageTooltipProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!imageUrl) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [imageUrl]);

  if (!imageUrl) return null;

  const OFFSET = 16;
  const MAX_WIDTH = 320;

  const left = Math.min(
    cursorPos.x + OFFSET,
    window.innerWidth - MAX_WIDTH - OFFSET
  );

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: cursorPos.y + OFFSET,
        left,
      }}
    >
      <img
        src={imageUrl}
        alt="Full preview"
        className="max-w-xl max-h-[600px] rounded-lg shadow-xl border border-gray-300 bg-black transition-opacity duration-150"
      />
    </div>
  );
}
