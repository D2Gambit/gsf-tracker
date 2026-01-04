import { useEffect, useRef, useState } from "react";

type ImageTooltipProps = {
  imageUrl: string | null;
};

export default function ImageTooltip({ imageUrl }: ImageTooltipProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [imageWidth, setImageWidth] = useState<number | null>(null);
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [imageUrl]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageWidth(imgRef.current.offsetWidth);
      setImageHeight(imgRef.current.offsetHeight);
    }
  };

  if (!imageUrl) return null;

  const OFFSET = 16;
  const MAX_WIDTH = 576; // max-w-xl in pixels
  const MAX_HEIGHT = 600; // max-h-[600px] in pixels

  const actualImageWidth = imageWidth || MAX_WIDTH;
  const desiredLeft = cursorPos.x + OFFSET;
  const maxLeft = window.innerWidth - actualImageWidth - 25; // 25px padding from right edge
  const left = Math.min(desiredLeft, maxLeft);

  // Calculate Vertical Position
  const actualImageHeight = imageHeight || MAX_HEIGHT;
  const desiredTop = cursorPos.y + OFFSET;
  // Calculate the lowest allowable top position (Window Height - Image Height - Padding)
  const maxTop = window.innerHeight - actualImageHeight - 20;
  // Clamp the top position so it never pushes the image off the bottom
  const top = Math.min(desiredTop, maxTop);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top,
        left,
      }}
    >
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Full preview"
        className="max-w-xl max-h-[600px] rounded-lg shadow-xl border border-gray-300 bg-black transition-opacity duration-150"
        onLoad={handleImageLoad}
      />
    </div>
  );
}
