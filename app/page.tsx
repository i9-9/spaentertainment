"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import SceneLoader from "./components/SceneLoader";
import { SKY_COLOR } from "@/lib/stage/palette";

const Scene3D = dynamic(() => import("./components/Scene3D"), {
  ssr: false,
  loading: () => <SceneLoader progress={0} />,
});

export default function Home() {
  return (
    <div className="-mt-20 relative" style={{ height: "100vh", backgroundColor: SKY_COLOR }}>
      <div className="absolute inset-0">
        <Suspense fallback={<SceneLoader progress={0} />}>
          <Scene3D />
        </Suspense>
      </div>

      <div className="absolute bottom-6 right-10 flex flex-col items-end gap-2 pointer-events-none">
        <span className="text-black/35 text-xs tracking-widest uppercase" style={{ fontFamily: "gotham, sans-serif" }}>
          Arrastrá para explorar
        </span>
        <a
          href="/?inspect=stage"
          className="text-black/30 text-[10px] tracking-wide uppercase pointer-events-auto hover:text-black/60 transition-colors"
          style={{ fontFamily: "gotham, sans-serif" }}
        >
          Marcar logo / inspector
        </a>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5">
          <path d="M4 12h16M12 4l8 8-8 8" />
        </svg>
      </div>
    </div>
  );
}
