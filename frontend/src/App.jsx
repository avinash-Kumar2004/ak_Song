import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { ToastProvider }   from "./context/ToastContext";
import Navbar              from "./components/Navbar";
import ProtectedRoute      from "./components/ProtectedRoute";
import LoginPage           from "./page/LoginPage";
import SignupPage          from "./page/SignupPage";
import ChangePasswordPage  from "./page/ChangePasswordPage";
import ProfilePage from "./page/ProfilePage";

// ── Placeholder pages (replace with real ones later) ──────────────────────
const Home = () => (
  <div style={{ minHeight: "100vh", background: "#0a0c12", paddingTop: 80,
    display: "flex", alignItems: "center", justifyContent: "center" }}>
    <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800 }}>
      Sound<span style={{ color: "#6c63ff" }}>Wave</span>
    </h1>
  </div>
);
const Placeholder = ({ name }) => (
  <div style={{ minHeight: "100vh", background: "#0a0c12", paddingTop: 80,
    display: "flex", alignItems: "center", justifyContent: "center" }}>
    <h2 style={{ color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 22 }}>{name}</h2>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            {/* ── Fully public ── */}
            <Route path="/"       element={<Home />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* ── Protected: show toast + redirect home if not logged in ── */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            }/>
            <Route path="/change-password" element={
              <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
            }/>
            <Route path="/search" element={
              <ProtectedRoute><Placeholder name="Search" /></ProtectedRoute>
            }/>
            <Route path="/library" element={
              <ProtectedRoute><Placeholder name="Library" /></ProtectedRoute>
            }/>
            <Route path="/favorite" element={
              <ProtectedRoute><Placeholder name="Favorites" /></ProtectedRoute>
            }/>
            <Route path="/settings" element={
              <ProtectedRoute><Placeholder name="Settings" /></ProtectedRoute>
            }/>
            <Route path="/download" element={
              <ProtectedRoute><Placeholder name="Download" /></ProtectedRoute>
            }/>
            <Route path="/support" element={
              <ProtectedRoute><Placeholder name="Support" /></ProtectedRoute>
            }/>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}