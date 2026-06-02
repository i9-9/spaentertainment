"use client";

type SceneLoaderProps = {
  progress: number;
  visible?: boolean;
};

export default function SceneLoader({ progress, visible = true }: SceneLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-60 flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-live="polite"
      aria-busy={visible}
    >
      <p
        className="text-white/40 text-xs tracking-[0.3em] uppercase mb-10"
        style={{ fontFamily: "gotham, sans-serif" }}
      >
        Spa Entertainment
      </p>

      <div className="flex items-end gap-1">
        <span
          className="text-white text-7xl lg:text-9xl font-bold tabular-nums leading-none"
          style={{ fontFamily: "gotham, sans-serif" }}
        >
          {Math.round(progress)}
        </span>
        <span
          className="text-white/30 text-2xl lg:text-3xl font-bold pb-2 lg:pb-3"
          style={{ fontFamily: "gotham, sans-serif" }}
        >
          %
        </span>
      </div>

      <div className="mt-10 h-px w-48 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/50 transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
