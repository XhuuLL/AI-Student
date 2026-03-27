"use client";

import { useState } from "react";

export function FlipCard({
  front,
  back,
}: {
  front: string;
  back: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      className="group perspective-[900px]"
      aria-label="Flip flashcard"
    >
      <div className="relative h-44 w-full rounded-2xl border border-white/10 bg-white/5 transition-transform duration-500 [transform-style:preserve-3d] group-active:scale-[0.99]">
        <div
          className={`absolute inset-0 flex items-center justify-center p-4 text-center [backface-visibility:hidden] rounded-2xl bg-white/5`}
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <span className="text-sm text-foreground/90">{front}</span>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center p-4 text-center [backface-visibility:hidden] rounded-2xl bg-foreground text-background`}
          style={{
            transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
          }}
        >
          <span className="text-sm font-medium">{back}</span>
        </div>
      </div>
    </button>
  );
}

