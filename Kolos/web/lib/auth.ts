export function getUserIdFromToken(): number | null {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    // JWT składa się z nagłówka, payloadu i podpisu. Bierzemy środkową część [1]
    const payloadBase64 = token.split(".")[1];
    
    // Odkodowujemy z Base64 do zwykłego tekstu
    const decodedJson = window.atob(payloadBase64);
    
    // Parsujemy tekst do obiektu JSON
    const payload = JSON.parse(decodedJson);
    
    // Django SimpleJWT domyślnie przechowuje ID pod kluczem 'user_id'
    return payload.user_id; 
  } catch (error) {
    console.error("Nie udało się odczytać ID z tokenu:", error);
    return null;
  }
}