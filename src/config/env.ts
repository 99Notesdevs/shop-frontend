export const env = {
    API: import.meta.env.VITE_API_URL || "http://localhost:5550/api/v1",
    API_MAIN: import.meta.env.VITE_API_MAIN_URL || "http://localhost:5000/api/v1",
    MAIN_PORTAL_API: import.meta.env.VITE_MAIN_PORTAL_URL || "http://localhost:3000",
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:5550",
    REACT_APP_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "782725593034-g6v9lkkkld99ljbtma3h4bnmi8it8mmr.apps.googleusercontent.com"
};
  
