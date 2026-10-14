'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Sprawdzamy czy użytkownik ma token w pamięci
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');

    if (!token) {
      // Jeśli brak tokena, odsyłamy na logowanie
      router.push('/login');
    } else {
      setUsername(storedUsername || 'Użytkowniku');
    }
  }, [router]);

  const handleLogout = () => {
    // Czyszczenie pamięci i wylogowanie
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  // Zabezpieczenie przed "mignięciem" strony przed przekierowaniem
  if (!username) return null;

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Witaj, {username}! 🦾</h1>
      <p>Jesteś bezpiecznie zalogowany w systemie Kolos.</p>
      <button 
        onClick={handleLogout} 
        style={{ marginTop: '20px', padding: '10px', background: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        Wyloguj się
      </button>
    </div>
  );
}