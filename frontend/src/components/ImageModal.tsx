import React, { useEffect, useState } from "react";

type ImageModalProps = {
  imageUrl: string;
  onClose: () => void;
};

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 w-full max-w-lg rounded-lg p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            aria-label="Close image"
            className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-200 flex items-center justify-center hover:bg-zinc-600 hover:text-white transition shadow-md"
          >
            ✕
          </button>
        </div>
        <img
          src={imageUrl}
          alt="Uploaded Image"
          className="w-full rounded-md"
        />
      </div>
    </div>
  );
}
