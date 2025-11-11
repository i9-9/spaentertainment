"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AnimatedHeroSection() {
  // Referencia al contenedor de la sección para trackear el scroll
  const containerRef = useRef<HTMLDivElement>(null);

  // useScroll nos da el progreso del scroll dentro de este contenedor
  // start: cuando el top del contenedor toca el top del viewport
  // end: cuando el bottom del contenedor toca el bottom del viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // POSICIONES INICIALES (scroll = 0)
  // Solo movimiento en eje Y, sin movimiento en X

  // "experiencias" - parte superior central
  const experienciasInitialY = -30; // arriba pero con más espacio del navbar (viewport units)

  // "Creamos" - parte inferior izquierda (visible en viewport)
  const creamosInitialY = 20; // abajo pero dentro del viewport

  // "que unen" - parte inferior derecha (visible en viewport)
  const queUnenInitialY = 20; // abajo pero dentro del viewport

  // POSICIONES FINALES (scroll = 1) - todas centradas verticalmente
  const finalY = 0;

  // Transformaciones para "experiencias"
  // Se mueve verticalmente desde top hasta el centro
  // La animación termina en 0.6 (60% del scroll) y permanece centrada
  const experienciasY = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [`${experienciasInitialY}vh`, `${finalY}vh`, `${finalY}vh`]
  );

  // Transformaciones para "Creamos"
  // Se mueve verticalmente desde bottom hasta el centro
  // La animación termina en 0.6 (60% del scroll) y permanece centrada
  const creamosY = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [`${creamosInitialY}vh`, `${finalY}vh`, `${finalY}vh`]
  );

  // Transformaciones para "que unen"
  // Se mueve verticalmente desde bottom hasta el centro
  // La animación termina en 0.6 (60% del scroll) y permanece centrada
  const queUnenY = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [`${queUnenInitialY}vh`, `${finalY}vh`, `${finalY}vh`]
  );

  return (
    <section
      ref={containerRef}
      className="relative bg-white"
      style={{ height: "400vh" }} // Altura más grande para scroll más lento y progresivo
    >
      {/* Contenedor sticky que permanece visible mientras se hace scroll */}
      {/* z-10 para estar debajo del navbar fixed (que tiene z-50) */}
      <div className="sticky top-20 h-screen w-full flex items-center justify-center overflow-hidden z-10">
        <div className="relative w-full h-full flex items-center justify-center">
          {/*
            Cada palabra está posicionada de manera absoluta y se mueve independientemente
            usando las transformaciones calculadas con useTransform
          */}

          {/* "Creamos" - palabra 1 (izquierda) */}
          <motion.div
            className="absolute left-[10%]"
            style={{
              y: creamosY,
            }}
          >
            <h1
              className="text-5xl lg:text-7xl font-bold text-black tracking-tight"
              style={{ fontFamily: "gotham, sans-serif" }}
            >
              Creamos
            </h1>
          </motion.div>

          {/* "experiencias" - palabra 2 (centro, mismo tamaño) */}
          <motion.div
            className="absolute"
            style={{
              y: experienciasY,
            }}
          >
            <h1
              className="text-5xl lg:text-7xl font-bold text-black tracking-tight"
              style={{ fontFamily: "gotham, sans-serif" }}
            >
              experiencias
            </h1>
          </motion.div>

          {/* "que unen" - palabra 3 (derecha) */}
          <motion.div
            className="absolute right-[10%]"
            style={{
              y: queUnenY,
            }}
          >
            <h1
              className="text-5xl lg:text-7xl font-bold text-black tracking-tight"
              style={{ fontFamily: "gotham, sans-serif" }}
            >
              que unen
            </h1>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
