'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsSuccess(true);
        setMessage('KONTO UTWORZONE. PRZEKIEROWANIE...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const errorData = await res.json();
        setIsSuccess(false);

        if (typeof errorData === 'object') {
          const firstErrorKey = Object.keys(errorData)[0];
          const firstErrorMsg = Array.isArray(errorData[firstErrorKey]) 
            ? errorData[firstErrorKey][0] 
            : errorData[firstErrorKey];
          setMessage(`BŁĄD (${firstErrorKey.toUpperCase()}): ${firstErrorMsg.toUpperCase()}`);
        } else {
          setMessage('BŁĄD REJESTRACJI. SPRAWDŹ DANE.');
        }
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage('BŁĄD POŁĄCZENIA Z SERWEREM.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Główny kontener
    <div className="min-h-screen bg-[#070809] text-white flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* =========================================
          GLOBALNE TŁO - KROPKI NA CAŁY EKRAN
          ========================================= */}
      <div className="absolute inset-0 bg-[radial-gradient(#262930_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none z-0" />

      {/* =========================================
          LEWA STRONA - REJESTRACJA (Formularz)
          ========================================= */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-between p-8 md:p-12 lg:p-16 z-10 min-h-screen relative backdrop-blur-[2px]">
        
        {/* LOGO W LEWYM GÓRNYM ROGU */}
        <header className="mb-12">
          <div 
            onClick={() => router.push('/')}
            className="
              inline-block
              bg-[#121417]
              border-2
              border-[#262930]
              border-r-8
              border-b-8
              border-r-[#DA9E24]
              border-b-[#DA9E24]
              px-8
              py-3
              cursor-pointer
              shadow-[0_15px_30px_rgba(0,0,0,0.9)]
              hover:translate-y-[-2px]
              hover:bg-[#181a1f]
              transition-all
              duration-200
            "
          >
            <span className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic transform -skew-x-6">
              K<span className="text-[#DA9E24]">OLOS</span>
            </span>
          </div>
        </header>

        {/* GŁÓWNA SEKCJA FORMULARZA (WYŚRODKOWANA W PIONIE) */}
        <main className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0">
          
          <div className="mb-8 border-l-4 border-[#DA9E24] pl-4">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-wider text-white uppercase transform -skew-x-6">
              INICJALIZACJA <span className="text-[#DA9E24]">PROFILU</span>
            </h1>
            <p className="text-[#888e9b] text-sm font-mono uppercase tracking-widest mt-2">
              Rejestracja w systemie. Wprowadź dane.
            </p>
          </div>

          {/* KOMUNIKAT BŁĘDU / SUKCESU */}
          {message && (
            <div
              className={`p-3 mb-6 font-mono text-xs font-bold tracking-wider uppercase border-l-4 ${
                isSuccess
                  ? 'bg-[#DA9E24]/10 border-[#DA9E24] text-[#DA9E24]'
                  : 'bg-[#ff6600]/10 border-[#ff6600] text-[#ff6600]'
              }`}
            >
              {message}
            </div>
          )}

          {/* FORMULARZ */}
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* INPUT USERNAME */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#DA9E24] uppercase tracking-wider mb-2">
                Nazwa użytkownika
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="NOWY_USER"
                className="
                  w-full
                  px-4
                  py-4
                  bg-[#121417]/90
                  border-2
                  border-[#262930]
                  border-r-4
                  border-b-4
                  border-r-[#ff6600]/40
                  border-b-[#ff6600]/40
                  text-white
                  font-mono
                  placeholder-[#3a3f4d]
                  focus:outline-none
                  focus:border-[#DA9E24]
                  focus:border-r-[#DA9E24]
                  focus:border-b-[#DA9E24]
                  transition-all
                "
              />
            </div>

            {/* INPUT EMAIL */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#DA9E24] uppercase tracking-wider mb-2">
                Adres E-mail
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@kolos.os"
                className="
                  w-full
                  px-4
                  py-4
                  bg-[#121417]/90
                  border-2
                  border-[#262930]
                  border-r-4
                  border-b-4
                  border-r-[#ff6600]/40
                  border-b-[#ff6600]/40
                  text-white
                  font-mono
                  placeholder-[#3a3f4d]
                  focus:outline-none
                  focus:border-[#DA9E24]
                  focus:border-r-[#DA9E24]
                  focus:border-b-[#DA9E24]
                  transition-all
                "
              />
            </div>

            {/* INPUT HASŁO */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#DA9E24] uppercase tracking-wider mb-2">
                Hasło
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••••••"
                className="
                  w-full
                  px-4
                  py-4
                  bg-[#121417]/90
                  border-2
                  border-[#262930]
                  border-r-4
                  border-b-4
                  border-r-[#ff6600]/40
                  border-b-[#ff6600]/40
                  text-white
                  font-mono
                  placeholder-[#3a3f4d]
                  focus:outline-none
                  focus:border-[#DA9E24]
                  focus:border-r-[#DA9E24]
                  focus:border-b-[#DA9E24]
                  transition-all
                "
              />
            </div>

            {/* PRZYCISK */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full
                  py-4
                  bg-[#DA9E24]
                  text-black
                  font-black
                  text-xl
                  italic
                  uppercase
                  tracking-wider
                  hover:bg-[#ff6600]
                  hover:text-white
                  transition-all
                  duration-300
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                {isLoading ? 'PRZETWARZANIE...' : 'UTWÓRZ PROFIL ➔'}
              </button>
            </div>
          </form>

          {/* POWRÓT DO LOGOWANIA */}
          <div className="mt-8 pt-6 border-t border-[#262930]/50 flex justify-center items-center text-xs font-mono relative">
            <span className="text-[#626875] mr-3 bg-[#070809] px-2">POSIADASZ KONTO?</span>
            <Link
              href="/login"
              className="
                text-[#DA9E24]
                font-bold
                hover:text-[#ff6600]
                underline
                decoration-2
                underline-offset-4
                transition-colors
                uppercase
                bg-[#070809]
                px-2
              "
            >
              Autoryzacja systemu
            </Link>
          </div>

        </main>

        {/* STOPKA PO LEWEJ */}
        <footer className="mt-12 text-xs font-mono text-[#3a3f4d]">
          KOLOS OS // SECURE REGISTRY PORTAL v2.0
        </footer>
      </div>

      {/* =========================================
          PRAWA STRONA - TYPOGRAFIA (Znak Wodny)
          ========================================= */}
      <div className="hidden lg:flex w-1/2 xl:w-[55%] relative flex-col justify-center items-center z-10 pointer-events-none select-none p-12">
        
        {/* Dekoracyjny kontener trzymający całość */}
        <div className="w-full max-w-3xl relative">
          
          {/* Narożniki techniczne */}
          <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#DA9E24] to-transparent"></div>
          <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-[#DA9E24] to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-l from-[#ff6600] to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-1 h-16 bg-gradient-to-t from-[#ff6600] to-transparent"></div>
          
          <div className="p-12 md:p-16">
            
            {/* Status wskaźnik */}
            <div className="flex items-center gap-3 text-sm text-[#888e9b] mb-6 font-mono tracking-widest">
              <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-[#DA9E24] shadow-[0_0_10px_#DA9E24]"></span>
              SYSTEM.STATUS // REGISTRY_OPEN
            </div>
            
            {/* OGROMNY NAPIS */}
            <h2 className="text-6xl xl:text-[7rem] 2xl:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.9] text-[#121417] drop-shadow-[0_10px_30px_rgba(0,0,0,1)]">
              FORGE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#262930] to-[#121417]">
                LEGACY
              </span>
            </h2>

            {/* Dolne indeksy dekoracyjne */}
            <div className="mt-12 text-xs font-mono text-[#262930] uppercase tracking-[0.3em] flex flex-wrap gap-x-6 gap-y-2">
               <span>NEW_NODE</span>
               <span className="text-[#121417]">//</span>
               <span>VERIFIED</span>
               <span className="text-[#121417]">//</span>
               <span>KOLOS_OS_2024</span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}