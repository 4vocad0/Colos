'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, RefObject } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Hook do zamykania menu po kliknięciu poza nim
function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Profil', href: '/profile' },
  { label: 'Plany treningowe', href: '/plans' },
  { label: 'Community Feed', href: '/social' },
  { label: 'Historia treningów', href: '/workouts' },
  { label: 'Statystyki', href: '/statistics' },
  { label: 'Wiadomości', href: '/chat' },
  { label: 'Ustawienia', href: '/settings' },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 1. NAJPIERW WSZYSTKIE HOOKI (Musi być wywołane przed jakimkolwiek returnem)
  useOutsideClick(menuRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // 2. DOPIERO POTEM WCZESNE ZWROTY (Early returns)
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="
      flex
      justify-between
      items-center
      mb-12
    ">
      {/* LOGO */}
      <div 
        onClick={() => router.push('/')}
        className="
          text-3xl
          font-black
          tracking-tight
          cursor-pointer
        "
      >
        K<span className="text-yellow-400">OLOS</span>
      </div>

      {/* KONTENER PRZYCISKU I DROPDOWNU */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleMenu}
          aria-label="Otwórz menu"
          className="
            w-12
            h-12
            rounded-full
            bg-yellow-400
            text-black
            flex
            items-center
            justify-center
            font-bold
            text-xl
            transition-all
            duration-200
            active:scale-95
            hover:bg-yellow-300
            cursor-pointer
          "
        >
          {isOpen ? '✕' : 'P'}
        </button>

        {isOpen && (
          <nav className="
            absolute
            right-0
            top-14
            w-64
            bg-[#1b1e21]
            border
            border-neutral-800
            rounded-2xl
            p-2
            shadow-[0_10px_30px_rgba(0,0,0,0.5)]
            z-50
            flex
            flex-col
            gap-1
          ">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="
                  px-4
                  py-3
                  rounded-xl
                  font-semibold
                  text-gray-300
                  hover:text-black
                  hover:bg-yellow-400
                  transition-all
                  duration-150
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}