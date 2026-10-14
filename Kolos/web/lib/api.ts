import axios from "axios";

// Tworzymy główną instancję z domyślnym adresem Twojego backendu
const api = axios.create({
  baseURL: "http://localhost:8000",
});

// 1. Interceptor Żądań (Request) - Dokleja token przed wysłaniem
api.interceptors.request.use(
  (config) => {
    // Sprawdzamy, czy jesteśmy po stronie przeglądarki (Next.js renderuje też po stronie serwera)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor Odpowiedzi (Response) - Obsługuje błąd 401 i odświeża token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jeśli to błąd 401 i nie próbowaliśmy go jeszcze ponowić
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (refreshToken) {
          try {
            // Próbujemy pobrać nowy access_token
            const response = await axios.post("http://localhost:8000/api/token/refresh/", {
              refresh: refreshToken,
            });
            
            const newAccessToken = response.data.access;
            localStorage.setItem("access_token", newAccessToken);
            
            // Podmieniamy token w pierwotnym żądaniu i ponawiamy je
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Jeśli refresh token wygasł (np. minęło kilka dni)
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login"; // Wyrzucamy na ekran logowania
            return Promise.reject(refreshError);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;