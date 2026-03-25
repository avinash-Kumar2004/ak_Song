import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { ToastProvider }   from "./context/ToastContext";
import { AppProvider }     from "./context/AppContext";
import Navbar              from "./components/Navbar";
import ProtectedRoute      from "./components/ProtectedRoute";
import LoginPage           from "./page/LoginPage";
import SignupPage          from "./page/SignupPage";
import ChangePasswordPage  from "./page/ChangePasswordPage";
import ProfilePage         from "./page/ProfilePage";
import SearchPage          from "./page/SearchPage";
import LibraryPage         from "./page/LibraryPage";
import FavoritePage        from "./page/FavoritePage";
import SettingsPage        from "./page/SettingsPage";
import DownloadPage        from "./page/DownloadPage";
import SupportPage         from "./page/SupportPage";
import TermsPage           from "./page/TermsPage";
import Home                from "./page/Home";
import { useRef, useState, useEffect } from "react";

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

// localStorage helper
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
};

export default function App() {
  // Lift sidebar state here so Navbar can access it
  const [playlists, setPlaylists]   = useState(() => LS.get("sw_playlists", [
    { id:"pl1", title:"My Favorites",    songs:[], color:"#6c63ff" },
    { id:"pl2", title:"Workout Bangers", songs:[], color:"#ff6b35" },
    { id:"pl3", title:"Late Night Vibes",songs:[], color:"#00d4ff" },
  ]));
  const [favorites, setFavorites]   = useState(() => LS.get("sw_favorites", []));
  const [uploadCount, setUploadCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sw_uploads_meta") || "[]").length; } catch { return 0; }
  });

  // Refs/callbacks that Home will register
  const mobileLibraryOpenRef = useRef(null);
  const newPlaylistRef       = useRef(null);
  const fileRef              = useRef(null);
  const uploadHandlerRef     = useRef(null);

  // Keep uploadCount in sync when Home updates it
  useEffect(() => {
    const syncCount = () => {
      try { setUploadCount(JSON.parse(localStorage.getItem("sw_uploads_meta") || "[]").length); } catch {}
    };
    window.addEventListener("sw_uploads_updated", syncCount);
    return () => window.removeEventListener("sw_uploads_updated", syncCount);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <Navbar
              playlists={playlists}
              favorites={favorites}
              uploadCount={uploadCount}
              fileRef={fileRef}
              onUpload={(e) => uploadHandlerRef.current?.(e)}
              onMobileLibraryOpen={(view) => mobileLibraryOpenRef.current?.(view)}
              onNewPlaylist={() => newPlaylistRef.current?.()}
            />
            <Routes>
              <Route path="/" element={
                <Home
                  sharedPlaylists={playlists}
                  setSharedPlaylists={setPlaylists}
                  sharedFavorites={favorites}
                  setSharedFavorites={setFavorites}
                  sharedFileRef={fileRef}
                  onRegisterMobileOpen={(fn) => { mobileLibraryOpenRef.current = fn; }}
                  onRegisterNewPlaylist={(fn) => { newPlaylistRef.current = fn; }}
                  onRegisterUploadHandler={(fn) => { uploadHandlerRef.current = fn; }}
                  onUploadCountChange={setUploadCount}
                />
              } />
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/terms"  element={<TermsPage />} />
              <Route path="/search"          element={<P><SearchPage /></P>} />
              <Route path="/library"         element={<P><LibraryPage /></P>} />
              <Route path="/favorite"        element={<P><FavoritePage /></P>} />
              <Route path="/settings"        element={<P><SettingsPage /></P>} />
              <Route path="/download"        element={<P><DownloadPage /></P>} />
              <Route path="/support"         element={<P><SupportPage /></P>} />
              <Route path="/profile"         element={<P><ProfilePage /></P>} />
              <Route path="/change-password" element={<P><ChangePasswordPage /></P>} />
            </Routes>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}