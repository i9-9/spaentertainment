"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isMenuOpen && !isClosing) {
      // Pequeño delay para activar las animaciones después del montaje
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    }
    return () => {}; // Siempre retornar una función de cleanup
  }, [isMenuOpen, isClosing]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Iniciar animación de cierre
      setIsAnimating(false);
      setIsClosing(true);
      // Esperar a que termine la animación antes de cerrar
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 800); // Duración suficiente para que termine la animación de los items
    } else {
      setIsMenuOpen(true);
      setIsClosing(false);
    }
  };

  const closeMenu = () => {
    if (isMenuOpen && !isClosing) {
      // Iniciar animación de cierre
      setIsAnimating(false);
      setIsClosing(true);
      // Esperar a que termine la animación antes de cerrar
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 800); // Duración suficiente para que termine la animación de los items
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-4 lg:px-[80px] py-4">
        <Link href="/" className="flex items-center gap-6" onClick={closeMenu}>
          <Image
            src="/images/logo/2x/Asset 6@2x.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-auto w-20 lg:w-[120px]"
          />
          <div className="flex flex-col ml-2 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
            <span>Servicios de</span>
            <span>Producciones Artísticas</span>
          </div>
        </Link>
        
        {/* Menú desktop - oculto en mobile y tablet */}
        <ul className="hidden lg:flex items-center gap-6 text-sm" style={{ fontFamily: 'gotham, sans-serif', fontWeight: 500 }}>
          <li>
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">
              INTRO
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">
              QUE HACEMOS
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">
              PROYECTOS
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">
              QUIENES SOMOS
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-gray-600 transition-colors uppercase">
              MARCAS
            </Link>
          </li>
          <li>
            <Link href="#" className="bg-red-600 text-white hover:bg-red-700 transition-colors uppercase">
              CONTACTO
            </Link>
          </li>
        </ul>

        {/* Botón mobile - visible en mobile y tablet */}
        <button
          onClick={toggleMenu}
          className="lg:hidden w-12 h-12 flex items-center justify-center text-4xl font-bold transition-transform duration-300"
          style={{ transform: isMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
          aria-label="Toggle menu"
        >
          +
        </button>
      </nav>

      {/* Overlay del menú mobile */}
      {(isMenuOpen || isClosing) && (
        <div
          className={`fixed inset-0 z-40 bg-white lg:hidden transition-all duration-500 ease-out ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
          }`}
          onClick={closeMenu}
        >
          <ul
            className="flex flex-col items-center justify-center h-full gap-8 text-lg"
            style={{ fontFamily: 'gotham, sans-serif', fontWeight: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <li
              className={`transition-all duration-700 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isAnimating ? '200ms' : (isClosing ? '750ms' : '0ms') }}
            >
              <Link
                href="#"
                className="hover:text-gray-600 transition-colors uppercase"
                onClick={closeMenu}
              >
                INTRO
              </Link>
            </li>
            <li
              className={`transition-all duration-700 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isAnimating ? '350ms' : (isClosing ? '600ms' : '0ms') }}
            >
              <Link
                href="#"
                className="hover:text-gray-600 transition-colors uppercase"
                onClick={closeMenu}
              >
                QUE HACEMOS
              </Link>
            </li>
            <li
              className={`transition-all duration-700 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isAnimating ? '500ms' : (isClosing ? '450ms' : '0ms') }}
            >
              <Link
                href="#"
                className="hover:text-gray-600 transition-colors uppercase"
                onClick={closeMenu}
              >
                PROYECTOS
              </Link>
            </li>
            <li
              className={`transition-all duration-700 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isAnimating ? '650ms' : (isClosing ? '300ms' : '0ms') }}
            >
              <Link
                href="#"
                className="hover:text-gray-600 transition-colors uppercase"
                onClick={closeMenu}
              >
                QUIENES SOMOS
              </Link>
            </li>
            <li
              className={`transition-all duration-700 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isAnimating ? '800ms' : (isClosing ? '150ms' : '0ms') }}
            >
              <Link
                href="#"
                className="hover:text-gray-600 transition-colors uppercase"
                onClick={closeMenu}
              >
                MARCAS
              </Link>
            </li>
            <li
              className={`transition-all duration-700 ease-out ${
                isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isAnimating ? '950ms' : (isClosing ? '0ms' : '0ms') }}
            >
              <Link
                href="#"
                className="bg-red-600 text-white hover:bg-red-700 transition-colors uppercase px-6 py-2"
                onClick={closeMenu}
              >
                CONTACTO
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

