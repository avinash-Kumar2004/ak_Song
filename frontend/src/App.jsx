import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import SettingsPage        from "./page/SettingsPage";
import Favorite            from "./page/Favorite";
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

// ── Site-wide searchable content (all pages/sections of the app) ───────────
// navigator is passed in so onClick can navigate to the page
function buildSiteContent(navigate) {
  return [
    {
      id: "home",
      label: "Home",
      description: "Main feed — your music, playlists and uploads",
      icon: "🏠",
      tags: ["feed", "main", "start"],
      onClick: () => navigate("/"),
    },
    {
      id: "search",
      label: "Search",
      description: "Search songs, artists and albums",
      icon: "🔍",
      tags: ["find", "lookup", "query"],
      onClick: () => navigate("/search"),
    },
    {
      id: "library",
      label: "Library",
      description: "All your uploaded songs in one place",
      icon: "📚",
      tags: ["songs", "uploads", "collection", "music"],
      onClick: () => navigate("/library"),
    },
    {
      id: "favorite",
      label: "Liked Songs",
      description: "Songs you have marked as favourite",
      icon: "❤️",
      tags: ["liked", "heart", "favourites", "favorites", "love"],
      onClick: () => navigate("/favorite"),
    },
    {
      id: "download",
      label: "Downloads",
      description: "Download songs for offline listening",
      icon: "⬇️",
      tags: ["offline", "save", "download"],
      onClick: () => navigate("/download"),
    },
    {
      id: "profile",
      label: "Profile",
      description: "Your account details and avatar",
      icon: "👤",
      tags: ["account", "user", "me", "avatar"],
      onClick: () => navigate("/profile"),
    },
    {
      id: "settings",
      label: "Settings",
      description: "App preferences, theme and audio settings",
      icon: "⚙️",
      tags: ["preferences", "options", "config", "theme"],
      onClick: () => navigate("/settings"),
    },
    {
      id: "support",
      label: "Support",
      description: "Help, FAQs and contact us",
      icon: "🆘",
      tags: ["help", "faq", "contact", "issue", "problem"],
      onClick: () => navigate("/support"),
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      description: "Privacy policy and terms of service",
      icon: "📄",
      tags: ["privacy", "policy", "legal", "terms", "conditions"],
      onClick: () => navigate("/terms"),
    },
    {
      id: "change-password",
      label: "Change Password",
      description: "Update your account password",
      icon: "🔒",
      tags: ["password", "security", "update", "change"],
      onClick: () => navigate("/change-password"),
    },
    {
      id: "login",
      label: "Login",
      description: "Sign in to your account",
      icon: "🔑",
      tags: ["signin", "sign in", "auth", "login"],
      onClick: () => navigate("/login"),
    },
    {
      id: "signup",
      label: "Sign Up",
      description: "Create a new account",
      icon: "✨",
      tags: ["register", "create account", "new user", "signup"],
      onClick: () => navigate("/signup"),
    },
  ];
}

// ── Wrapper so we can use useNavigate inside Routes ────────────────────────
function SearchPageWrapper({ songs, player, onFav, favorites }) {
  const navigate = useNavigate();
  const siteContent = buildSiteContent(navigate);
  return (
    <SearchPage
      songs={songs}
      siteContent={siteContent}
      player={player}
      onFav={onFav}
      favorites={favorites}
    />
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [playlists, setPlaylists] = useState(() => LS.get("sw_playlists", [
    { id: "pl1", title: "My Favorites",     songs: [], color: "#6c63ff" },
    { id: "pl2", title: "Workout Bangers",  songs: [], color: "#ff6b35" },
    { id: "pl3", title: "Late Night Vibes", songs: [], color: "#00d4ff" },
  ]));
  const [favorites, setFavorites] = useState(() => LS.get("sw_favorites", []));
  const [uploadCount, setUploadCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sw_uploads_meta") || "[]").length; } catch { return 0; }
  });

  const mobileLibraryOpenRef = useRef(null);
  const newPlaylistRef       = useRef(null);
  const fileRef              = useRef(null);
  const uploadHandlerRef     = useRef(null);

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

              {/* Search gets full site content + songs */}
              <Route path="/search" element={
                <P>
                  <SearchPageWrapper
                    songs={[
                      // your songs array here — pass from state/context if available
                      // e.g. songs={allSongs}
                    ]}
                    favorites={favorites}
                    onFav={(song) =>
                      setFavorites(prev =>
                        prev.find(f => f.id === song.id)
                          ? prev.filter(f => f.id !== song.id)
                          : [...prev, song]
                      )
                    }
                  />
                </P>
              } />

              <Route path="/library"  element={<P><LibraryPage /></P>} />
              <Route path="/favorite" element={
                <P>
                  <Favorite
                    favorites={favorites}
                    onUnfav={(song) => setFavorites(prev => prev.filter(f => f.id !== song.id))}
                  />
                </P>
              } />
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