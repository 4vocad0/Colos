'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-24 py-6">
      
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 pt-10">
        <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-sm font-semibold mb-2">
          🔥 Kompleksowy system treningowy
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
          Przejmij kontrolę nad <br />
          swoim <span className="text-yellow-400">treningiem</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          KOLOS to potężne narzędzie do planowania, śledzenia progresu i analizy wyników siłowych. Zbuduj swoją formę z precyzją.
        </p>

        {/* PRZYCISKI LOGOWANIA / REJESTRACJI */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-yellow-400 text-black font-extrabold text-lg hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(250,204,21,0.2)]"
          >
            Dołącz teraz – Zarejestruj się
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-neutral-700 bg-[#1b1e21] text-white font-bold text-lg hover:border-yellow-400 transition-all hover:bg-[#22262a]"
          >
            Zaloguj się
          </Link>
        </div>
      </section>

      {/* 2. CZYM JEST NASZA STRONA (O PLATFORMIE) */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl border border-neutral-800 bg-[#1b1e21]/80 backdrop-blur">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">Precyzyjne Plany</h3>
          <p className="text-gray-400 leading-relaxed">
            Twórz inteligentne plany treningowe, układaj serie, powtórzenia i progresuj z tygodnia na tydzień.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-neutral-800 bg-[#1b1e21]/80 backdrop-blur">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-bold mb-2">Analityka i Rekordy</h3>
          <p className="text-gray-400 leading-relaxed">
            Śledź łączną objętość, czas treningów oraz automatycznie rejestruj nowe rekordy życiowe (PR).
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-neutral-800 bg-[#1b1e21]/80 backdrop-blur">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-2">Społeczność</h3>
          <p className="text-gray-400 leading-relaxed">
            Dziel się swoimi wynikami, obserwuj postępy znajomych i czerp motywację z Community Feedu.
          </p>
        </div>
      </section>

      {/* 3. APLIKACJA MOBILNA */}
      <section className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-[#202428] to-[#151719] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
        <div className="space-y-6 max-w-xl">
          <div className="inline-block px-3 py-1 rounded-md bg-yellow-400/20 text-yellow-400 font-bold text-xs uppercase tracking-wider">
            Aplikacja Mobilna
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            Twój dziennik treningowy zawsze w kieszeni
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            Zabierz KOLOSa na siłownię. Dedykowana aplikacja mobilna pozwala na wygodne wprowadzanie ciężarów w trakcie serii, odliczanie czasu przerw i pracę w trybie offline.
          </p>

          {/* PRZYCISKI STORE'ÓW */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#111315] border border-neutral-700 hover:border-yellow-400 transition-all">
              <span className="text-2xl">🍏</span>
              <div className="text-left">
                <div className="text-xs text-gray-400">Pobierz w</div>
                <div className="font-bold text-sm">App Store</div>
              </div>
            </button>

            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#111315] border border-neutral-700 hover:border-yellow-400 transition-all">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <div className="text-xs text-gray-400">Pobierz w</div>
                <div className="font-bold text-sm">Google Play</div>
              </div>
            </button>
          </div>
        </div>

        {/* ATRAKCYJNA MOCKUP-KARTA APLIKACJI */}
        <div className="w-full md:w-80 h-96 bg-[#1b1e21] rounded-3xl border-4 border-neutral-800 p-6 flex flex-col justify-between shadow-2xl relative rotate-1 hover:rotate-0 transition-transform">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <span className="font-black text-yellow-400">KOLOS Mobile</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#111315] rounded-xl border border-neutral-800">
              <div className="text-xs text-gray-400">Aktualna seria</div>
              <div className="font-bold text-lg">Bench Press — 100 kg x 5</div>
            </div>
            <div className="p-3 bg-yellow-400 text-black rounded-xl font-bold text-center">
              Przerwa: 01:30 ⏱️
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            Gotowy do następnego powtórzenia?
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} KOLOS Fitness. Wszelkie prawa zastrzeżone.</p>
      </footer>

    </div>
  );
}