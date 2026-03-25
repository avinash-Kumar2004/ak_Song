import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [accent,       setAccentState]  = useState(() => localStorage.getItem("sw_accent")              ?? "#6c63ff");
  const [lang,         setLangState]    = useState(() => localStorage.getItem("sw_lang")                ?? "en");
  const [isDark,       setIsDarkState]  = useState(() => JSON.parse(localStorage.getItem("sw_dark")     ?? "true"));
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem("sw_profile_img")         ?? null);
  const [displayName,  setDisplayName]  = useState(() => localStorage.getItem("sw_display_name")        ?? "");

  // Apply accent globally to :root
  useEffect(() => {
    let el = document.getElementById("sw-global-vars");
    if (!el) { el = document.createElement("style"); el.id = "sw-global-vars"; document.head.appendChild(el); }
    el.textContent = `:root { --sw-accent: ${accent}; }`;
    localStorage.setItem("sw_accent", accent);
  }, [accent]);

  // Apply dark/light to body
  useEffect(() => {
    document.body.style.background = isDark ? "#0a0c12" : "#f0f2f5";
    localStorage.setItem("sw_dark", JSON.stringify(isDark));
  }, [isDark]);

  useEffect(() => { localStorage.setItem("sw_lang",         lang);         }, [lang]);
  useEffect(() => { localStorage.setItem("sw_profile_img",  profileImage ?? ""); }, [profileImage]);
  useEffect(() => { localStorage.setItem("sw_display_name", displayName);  }, [displayName]);

  const setAccent  = (c) => setAccentState(c);
  const setLang    = (l) => setLangState(l);
  const setIsDark  = (v) => setIsDarkState(v);

  return (
    <AppContext.Provider value={{
      accent, setAccent,
      lang, setLang,
      isDark, setIsDark,
      profileImage, setProfileImage,
      displayName, setDisplayName,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}