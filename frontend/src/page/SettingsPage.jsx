import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp  } from "../context/AppContext";

export const TRANSLATIONS = {
  en: {
    settings:"Settings", subtitle:"Manage your account and preferences",
    profile:"Profile", appearance:"Appearance", language:"Language",
    notifications:"Notifications", about:"About", darkMode:"Dark Mode",
    darkModeDesc:"Switch between dark and light theme", accentColor:"Accent Color",
    accentColorDesc:"Choose your preferred accent color", selectLanguage:"Select Language",
    languageDesc:"Change the display language", pushNotifications:"Push Notifications",
    pushNotificationsDesc:"Receive notifications for new songs", emailUpdates:"Email Updates",
    emailUpdatesDesc:"Get weekly music digest in your email", playbackQuality:"Playback Quality",
    playbackQualityDesc:"Set your preferred streaming quality", autoplay:"Autoplay",
    autoplayDesc:"Automatically play similar songs", privateSession:"Private Session",
    privateSessionDesc:"Listen without affecting your history", dataUsage:"Data Saver",
    dataUsageDesc:"Reduce data usage on mobile networks", version:"Version",
    termsOfService:"Terms of Service", privacyPolicy:"Privacy Policy", helpCenter:"Help Center",
    logout:"Log Out", logoutDesc:"Sign out of your account", editProfile:"Edit Profile",
    changePassword:"Change Password", high:"High", medium:"Medium", low:"Low",
    saved:"Settings saved!", playback:"Playback", account:"Account", sound:"Sound",
    deleteAccount:"Delete Account", deleteAccountDesc:"Permanently remove your account",
    clearCache:"Clear Cache", clearCacheDesc:"Free up local storage space",
    shareProfile:"Share Profile", shareProfileDesc:"Copy your profile link",
    twoFactor:"Two-Factor Auth", twoFactorDesc:"Add extra security to your account",
    newRelease:"New Releases", newReleaseDesc:"Get notified about new music",
    equalizer:"Equalizer", equalizerDesc:"Customize your audio experience",
    crossfade:"Crossfade", crossfadeDesc:"Smooth transitions between songs",
    storage:"Storage", privacySecurity:"Privacy & Security",
  },
  hi: {
    settings:"सेटिंग्स", subtitle:"अपना अकाउंट और प्राथमिकताएं प्रबंधित करें",
    profile:"प्रोफ़ाइल", appearance:"दिखावट", language:"भाषा",
    notifications:"सूचनाएं", about:"के बारे में", darkMode:"डार्क मोड",
    darkModeDesc:"डार्क और लाइट थीम स्विच करें", accentColor:"एक्सेंट रंग",
    accentColorDesc:"पसंदीदा रंग चुनें", selectLanguage:"भाषा चुनें",
    languageDesc:"डिस्प्ले भाषा बदलें", pushNotifications:"पुश सूचनाएं",
    pushNotificationsDesc:"नए गानों की सूचना पाएं", emailUpdates:"ईमेल अपडेट",
    emailUpdatesDesc:"साप्ताहिक म्यूज़िक डाइजेस्ट पाएं", playbackQuality:"प्लेबैक गुणवत्ता",
    playbackQualityDesc:"स्ट्रीमिंग गुणवत्ता सेट करें", autoplay:"ऑटोप्ले",
    autoplayDesc:"समान गाने अपने आप चलाएं", privateSession:"प्राइवेट सेशन",
    privateSessionDesc:"इतिहास प्रभावित किए बिना सुनें", dataUsage:"डेटा सेवर",
    dataUsageDesc:"मोबाइल पर डेटा कम करें", version:"संस्करण",
    termsOfService:"सेवा की शर्तें", privacyPolicy:"गोपनीयता नीति", helpCenter:"सहायता केंद्र",
    logout:"लॉग आउट", logoutDesc:"अकाउंट से साइन आउट", editProfile:"प्रोफ़ाइल संपादित करें",
    changePassword:"पासवर्ड बदलें", high:"उच्च", medium:"मध्यम", low:"कम",
    saved:"सेटिंग्स सहेजी गई!", playback:"प्लेबैक", account:"अकाउंट", sound:"ध्वनि",
    deleteAccount:"अकाउंट हटाएं", deleteAccountDesc:"अकाउंट हमेशा के लिए हटाएं",
    clearCache:"कैश साफ़ करें", clearCacheDesc:"लोकल स्टोरेज खाली करें",
    shareProfile:"प्रोफ़ाइल शेयर", shareProfileDesc:"प्रोफ़ाइल लिंक कॉपी करें",
    twoFactor:"दो-चरण प्रमाणीकरण", twoFactorDesc:"अतिरिक्त सुरक्षा जोड़ें",
    newRelease:"नई रिलीज़", newReleaseDesc:"नए संगीत की सूचना पाएं",
    equalizer:"इक्वलाइज़र", equalizerDesc:"ऑडियो अनुभव अनुकूलित करें",
    crossfade:"क्रॉसफेड", crossfadeDesc:"गानों के बीच स्मूद ट्रांज़िशन",
    storage:"स्टोरेज", privacySecurity:"गोपनीयता और सुरक्षा",
  },
  mr: {
    settings:"सेटिंग्ज", subtitle:"खाते आणि प्राधान्ये व्यवस्थापित करा",
    profile:"प्रोफाइल", appearance:"देखावा", language:"भाषा",
    notifications:"सूचना", about:"बद्दल", darkMode:"डार्क मोड",
    darkModeDesc:"डार्क आणि लाइट थीम बदला", accentColor:"उच्चारण रंग",
    accentColorDesc:"पसंतीचा रंग निवडा", selectLanguage:"भाषा निवडा",
    languageDesc:"प्रदर्शन भाषा बदला", pushNotifications:"पुश सूचना",
    pushNotificationsDesc:"नवीन गाण्यांसाठी सूचना मिळवा", emailUpdates:"ईमेल अपडेट",
    emailUpdatesDesc:"साप्ताहिक संगीत डायजेस्ट मिळवा", playbackQuality:"प्लेबॅक गुणवत्ता",
    playbackQualityDesc:"स्ट्रीमिंग गुणवत्ता सेट करा", autoplay:"ऑटोप्ले",
    autoplayDesc:"समान गाणी आपोआप चालवा", privateSession:"खाजगी सत्र",
    privateSessionDesc:"इतिहास न बदलता ऐका", dataUsage:"डेटा सेव्हर",
    dataUsageDesc:"मोबाइलवर डेटा कमी करा", version:"आवृत्ती",
    termsOfService:"सेवेच्या अटी", privacyPolicy:"गोपनीयता धोरण", helpCenter:"मदत केंद्र",
    logout:"लॉग आउट", logoutDesc:"खात्यातून साइन आउट", editProfile:"प्रोफाइल संपादित करा",
    changePassword:"पासवर्ड बदला", high:"उच्च", medium:"मध्यम", low:"कमी",
    saved:"सेटिंग्ज जतन केल्या!", playback:"प्लेबॅक", account:"खाते", sound:"आवाज",
    deleteAccount:"खाते हटवा", deleteAccountDesc:"खाते कायमचे काढा",
    clearCache:"कॅश साफ करा", clearCacheDesc:"लोकल स्टोरेज मोकळी करा",
    shareProfile:"प्रोफाइल शेअर", shareProfileDesc:"प्रोफाइल लिंक कॉपी करा",
    twoFactor:"द्वि-घटक प्रमाणीकरण", twoFactorDesc:"अतिरिक्त सुरक्षा जोडा",
    newRelease:"नवीन रिलीज", newReleaseDesc:"नवीन संगीताची सूचना मिळवा",
    equalizer:"इक्वलायझर", equalizerDesc:"ऑडिओ अनुभव सानुकूलित करा",
    crossfade:"क्रॉसफेड", crossfadeDesc:"गाण्यांमध्ये स्मूद ट्रांझिशन",
    storage:"स्टोरेज", privacySecurity:"गोपनीयता आणि सुरक्षा",
  },
  te: {
    settings:"సెట్టింగులు", subtitle:"ఖాతా మరియు ప్రాధాన్యతలను నిర్వహించండి",
    profile:"ప్రొఫైల్", appearance:"రూపం", language:"భాష",
    notifications:"నోటిఫికేషన్లు", about:"గురించి", darkMode:"డార్క్ మోడ్",
    darkModeDesc:"డార్క్ మరియు లైట్ థీమ్ మార్చండి", accentColor:"యాక్సెంట్ రంగు",
    accentColorDesc:"ఇష్టమైన రంగు ఎంచుకోండి", selectLanguage:"భాష ఎంచుకోండి",
    languageDesc:"డిస్‌ప్లే భాషను మార్చండి", pushNotifications:"పుష్ నోటిఫికేషన్లు",
    pushNotificationsDesc:"కొత్త పాటల నోటిఫికేషన్లు పొందండి", emailUpdates:"ఇమెయిల్ అప్‌డేట్లు",
    emailUpdatesDesc:"వారపు మ్యూజిక్ డైజెస్ట్ పొందండి", playbackQuality:"ప్లేబ్యాక్ నాణ్యత",
    playbackQualityDesc:"స్ట్రీమింగ్ నాణ్యత సెట్ చేయండి", autoplay:"ఆటోప్లే",
    autoplayDesc:"సారూప్య పాటలు స్వయంచాలకంగా ప్లే చేయండి", privateSession:"ప్రైవేట్ సెషన్",
    privateSessionDesc:"చరిత్రను ప్రభావితం చేయకుండా వినండి", dataUsage:"డేటా సేవర్",
    dataUsageDesc:"మొబైల్‌లో డేటా తగ్గించండి", version:"వెర్షన్",
    termsOfService:"సేవా నిబంధనలు", privacyPolicy:"గోప్యతా విధానం", helpCenter:"సహాయ కేంద్రం",
    logout:"లాగ్ అవుట్", logoutDesc:"ఖాతా నుండి సైన్ అవుట్", editProfile:"ప్రొఫైల్ సవరించండి",
    changePassword:"పాస్‌వర్డ్ మార్చండి", high:"అధిక", medium:"మధ్యమ", low:"తక్కువ",
    saved:"సెట్టింగులు సేవ్ చేయబడ్డాయి!", playback:"ప్లేబ్యాక్", account:"ఖాతా", sound:"శబ్దం",
    deleteAccount:"ఖాతా తొలగించు", deleteAccountDesc:"ఖాతాను శాశ్వతంగా తీసివేయండి",
    clearCache:"కాష్ క్లియర్", clearCacheDesc:"లోకల్ స్టోరేజ్ ఖాళీ చేయండి",
    shareProfile:"ప్రొఫైల్ షేర్", shareProfileDesc:"ప్రొఫైల్ లింక్ కాపీ చేయండి",
    twoFactor:"రెండు-కారకాల ప్రమాణీకరణ", twoFactorDesc:"అదనపు భద్రత జోడించండి",
    newRelease:"కొత్త విడుదలలు", newReleaseDesc:"కొత్త సంగీతం నోటిఫికేషన్లు పొందండి",
    equalizer:"ఈక్వలైజర్", equalizerDesc:"ఆడియో అనుభవం అనుకూలీకరించండి",
    crossfade:"క్రాస్‌ఫేడ్", crossfadeDesc:"పాటల మధ్య స్మూత్ ట్రాన్సిషన్లు",
    storage:"నిల్వ", privacySecurity:"గోప్యత మరియు భద్రత",
  },
};

const LANGUAGES = [
  { code:"en", label:"English", native:"English", flag:"🇺🇸" },
  { code:"hi", label:"Hindi",   native:"हिंदी",   flag:"🇮🇳" },
  { code:"mr", label:"Marathi", native:"मराठी",   flag:"🇮🇳" },
  { code:"te", label:"Telugu",  native:"తెలుగు",  flag:"🇮🇳" },
];

const ACCENTS = [
  { id:"purple", color:"#6c63ff" },
  { id:"pink",   color:"#ff4d6d" },
  { id:"cyan",   color:"#00d4ff" },
  { id:"green",  color:"#1db954" },
  { id:"orange", color:"#ff6b35" },
];

const Toggle = ({ checked, onChange, accent }) => (
  <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
    style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
      background: checked ? accent : "rgba(255,255,255,0.15)",
      position:"relative", transition:"background 0.25s", flexShrink:0, outline:"none",
      boxShadow: checked ? `0 0 10px ${accent}55` : "none" }}>
    <span style={{ position:"absolute", top:3, left:checked?23:3,
      width:18, height:18, borderRadius:"50%", background:"#fff",
      transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.35)" }} />
  </button>
);

const Section = ({ title, accent, children }) => (
  <div style={{ background:"var(--sw-card)", borderRadius:16,
    border:"1px solid var(--sw-border)", marginBottom:16, overflow:"visible" }}>
    <div style={{ padding:"14px 20px 8px", fontSize:11, fontWeight:700,
      letterSpacing:"0.09em", textTransform:"uppercase", color:accent }}>{title}</div>
    {children}
  </div>
);

const Row = ({ icon, label, desc, right, onClick, danger, badge }) => (
  <div onClick={onClick} role={onClick?"button":undefined} tabIndex={onClick?0:undefined}
    onKeyDown={onClick?(e)=>{if(e.key==="Enter")onClick();}:undefined}
    style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 20px",
      borderTop:"1px solid var(--sw-border)", cursor:onClick?"pointer":"default",
      transition:"background 0.15s" }}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
    onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
    <div style={{ width:38, height:38, borderRadius:11, flexShrink:0,
      background:danger?"rgba(255,77,109,0.12)":"rgba(255,255,255,0.06)",
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:14, fontWeight:500,
          color:danger?"#ff4d6d":"var(--sw-text)", lineHeight:1.3 }}>{label}</span>
        {badge && (
          <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100,
            background:"rgba(108,99,255,0.2)", color:"#a09aff", letterSpacing:"0.05em" }}>{badge}</span>
        )}
      </div>
      {desc&&<div style={{ fontSize:12, color:"var(--sw-muted)", marginTop:2, lineHeight:1.4 }}>{desc}</div>}
    </div>
    {right&&<div style={{ flexShrink:0, position:"relative", zIndex:10 }}>{right}</div>}
  </div>
);

// Fixed-position dropdown — never hidden by overflow:hidden parents
const LangDropdown = ({ lang, setLang, accent }) => {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top:0, right:0 });
  const btnRef = useRef(null);
  const dropRef= useRef(null);
  const current= LANGUAGES.find(l=>l.code===lang);

  useEffect(()=>{
    const close=(e)=>{
      if(dropRef.current&&!dropRef.current.contains(e.target)&&
         btnRef.current&&!btnRef.current.contains(e.target)) setOpen(false);
    };
    const esc=(e)=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("mousedown",close);
    document.addEventListener("keydown",esc);
    return()=>{document.removeEventListener("mousedown",close);document.removeEventListener("keydown",esc);};
  },[]);

  const toggle=()=>{
    if(!open&&btnRef.current){
      const r=btnRef.current.getBoundingClientRect();
      setPos({top:r.bottom+window.scrollY+8, right:window.innerWidth-r.right});
    }
    setOpen(o=>!o);
  };

  return(
    <>
      <button ref={btnRef} onClick={toggle} aria-haspopup="listbox" aria-expanded={open}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
          borderRadius:10, border:`1.5px solid ${open?accent:"rgba(255,255,255,0.12)"}`,
          background:open?`${accent}18`:"rgba(255,255,255,0.06)",
          color:"var(--sw-text)", cursor:"pointer", fontSize:13, fontWeight:500,
          transition:"all 0.15s", outline:"none", whiteSpace:"nowrap" }}>
        <span style={{fontSize:16}}>{current?.flag}</span>
        <span>{current?.native}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
          style={{transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",opacity:0.5}}>
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      {open&&(
        <div ref={dropRef} role="listbox"
          style={{ position:"fixed", top:pos.top, right:pos.right,
            background:"#1a1c28", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:14, boxShadow:"0 20px 60px rgba(0,0,0,0.75)",
            zIndex:999999, minWidth:220, overflow:"hidden",
            animation:"swFade 0.15s ease" }}>
          <div style={{ padding:"10px 16px 6px", fontSize:11, fontWeight:600,
            color:"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
            Select Language
          </div>
          {LANGUAGES.map(l=>(
            <button key={l.code} role="option" aria-selected={lang===l.code}
              onClick={()=>{setLang(l.code);setOpen(false);}}
              style={{ display:"flex", alignItems:"center", gap:12,
                width:"100%", padding:"11px 16px",
                background:lang===l.code?`${accent}22`:"transparent",
                border:"none", cursor:"pointer", transition:"background 0.1s", textAlign:"left" }}
              onMouseEnter={e=>{if(lang!==l.code)e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
              onMouseLeave={e=>{if(lang!==l.code)e.currentTarget.style.background="transparent";}}>
              <span style={{fontSize:22}}>{l.flag}</span>
              <div style={{flex:1}}>
                <div style={{ fontSize:14, fontWeight:lang===l.code?600:400,
                  color:lang===l.code?accent:"rgba(255,255,255,0.85)" }}>{l.native}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{l.label}</div>
              </div>
              {lang===l.code&&(
                <svg width="16" height="16" viewBox="0 0 24 24" fill={accent}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const Toast=({msg,accent})=>(
  <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
    background:accent, color:"#fff", padding:"11px 26px", borderRadius:100,
    fontSize:13, fontWeight:600, boxShadow:`0 4px 24px ${accent}66`,
    zIndex:999999, animation:"swSlide 0.3s ease", whiteSpace:"nowrap", pointerEvents:"none" }}>
    ✓ {msg}
  </div>
);

const CrossfadeRow=({accent,label,desc})=>{
  const [val,setVal]=useState(()=>Number(localStorage.getItem("sw_crossfade")??3));
  return(
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 20px",
      borderTop:"1px solid var(--sw-border)" }}>
      <div style={{ width:38, height:38, borderRadius:11, flexShrink:0,
        background:"rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎚️</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:500,color:"var(--sw-text)"}}>{label}</div>
        <div style={{fontSize:12,color:"var(--sw-muted)",marginTop:2}}>{desc}</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
          <input type="range" min={0} max={12} value={val}
            onChange={e=>{setVal(Number(e.target.value));localStorage.setItem("sw_crossfade",e.target.value);}}
            style={{flex:1,accentColor:accent,height:4,cursor:"pointer"}}/>
          <span style={{fontSize:13,fontWeight:600,color:accent,minWidth:28,textAlign:"right"}}>{val}s</span>
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage(){
  const navigate=useNavigate();
  const auth=useAuth?.();
  const user=auth?.user;
  const {accent,setAccent,lang,setLang,isDark,setIsDark,profileImage}=useApp();
  const t=TRANSLATIONS[lang]||TRANSLATIONS.en;
  const bg=isDark?"#0a0c12":"#f0f2f5";

  const [pushNotif,   setPushNotif]   =useState(()=>JSON.parse(localStorage.getItem("sw_push")        ??"true"));
  const [emailNotif,  setEmailNotif]  =useState(()=>JSON.parse(localStorage.getItem("sw_email")       ??"false"));
  const [newRelease,  setNewRelease]  =useState(()=>JSON.parse(localStorage.getItem("sw_newrelease")  ??"true"));
  const [autoplay,    setAutoplay]    =useState(()=>JSON.parse(localStorage.getItem("sw_autoplay")    ??"true"));
  const [privateMode, setPrivateMode] =useState(()=>JSON.parse(localStorage.getItem("sw_private")    ??"false"));
  const [dataSaver,   setDataSaver]   =useState(()=>JSON.parse(localStorage.getItem("sw_data")       ??"false"));
  const [twoFactor,   setTwoFactor]   =useState(()=>JSON.parse(localStorage.getItem("sw_2fa")        ??"false"));
  const [quality,     setQuality]     =useState(()=>localStorage.getItem("sw_quality")               ??"high");
  const [toast,       setToast]       =useState(null);

  useEffect(()=>{localStorage.setItem("sw_push",       JSON.stringify(pushNotif));},[pushNotif]);
  useEffect(()=>{localStorage.setItem("sw_email",      JSON.stringify(emailNotif));},[emailNotif]);
  useEffect(()=>{localStorage.setItem("sw_newrelease", JSON.stringify(newRelease));},[newRelease]);
  useEffect(()=>{localStorage.setItem("sw_autoplay",   JSON.stringify(autoplay));},[autoplay]);
  useEffect(()=>{localStorage.setItem("sw_private",    JSON.stringify(privateMode));},[privateMode]);
  useEffect(()=>{localStorage.setItem("sw_data",       JSON.stringify(dataSaver));},[dataSaver]);
  useEffect(()=>{localStorage.setItem("sw_2fa",        JSON.stringify(twoFactor));},[twoFactor]);
  useEffect(()=>{localStorage.setItem("sw_quality",    quality);},[quality]);

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2200);};
  const save=(setter,val)=>{setter(val);showToast(t.saved);};

  const handleLogout=async()=>{
    try{await auth?.logout?.();}catch{}
    navigate("/login");
  };
  const handleClearCache=()=>{
    const keep=["sw_dark","sw_lang","sw_accent","sw_profile_img","sw_display_name"];
    Object.keys(localStorage).forEach(k=>{if(!keep.includes(k))localStorage.removeItem(k);});
    showToast("Cache cleared!");
  };

  const avatar=(user?.displayName?.[0]||user?.email?.[0]||"U").toUpperCase();
  const vars={
    "--sw-card":  isDark?"#13151f":"#ffffff",
    "--sw-border":isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)",
    "--sw-text":  isDark?"#f0f0f0":"#111",
    "--sw-muted": isDark?"rgba(255,255,255,0.38)":"rgba(0,0,0,0.45)",
  };

  return(
    <>
      <style>{`
        @keyframes swFade{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @keyframes swSlide{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>
      <div style={{minHeight:"100vh",background:bg,paddingTop:80,paddingBottom:60,transition:"background 0.3s",...vars}}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"0 16px"}}>

          {/* Header */}
          <div style={{marginBottom:28}}>
            <h1 style={{fontSize:28,fontWeight:800,color:"var(--sw-text)",letterSpacing:"-0.5px",margin:0}}>{t.settings}</h1>
            <p style={{color:"var(--sw-muted)",fontSize:14,margin:"4px 0 0"}}>{t.subtitle}</p>
          </div>

          {/* Profile card */}
          <div style={{background:"var(--sw-card)",borderRadius:20,border:"1px solid var(--sw-border)",
            padding:20,display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:"50%",flexShrink:0,overflow:"hidden",
              boxShadow:`0 0 0 3px ${bg}, 0 0 0 5px ${accent}55`}}>
              {profileImage?(
                <img src={profileImage} alt="profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              ):(
                <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,${accent},#ff4d6d)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:26,fontWeight:800,color:"#fff"}}>{avatar}</div>
              )}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:17,fontWeight:700,color:"var(--sw-text)",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {user?.displayName||user?.email||"Guest User"}
              </div>
              <div style={{fontSize:13,color:"var(--sw-muted)",marginTop:2}}>{user?.email||""}</div>
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <span style={{fontSize:11,padding:"3px 10px",borderRadius:100,
                  background:`${accent}18`,color:accent,fontWeight:600}}>Free Plan</span>
                {privateMode&&<span style={{fontSize:11,padding:"3px 10px",borderRadius:100,
                  background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.5)",fontWeight:500}}>🔒 Private</span>}
              </div>
            </div>
            <button onClick={()=>navigate("/profile")}
              style={{padding:"9px 18px",borderRadius:100,background:`${accent}1a`,
                border:`1px solid ${accent}44`,color:accent,fontSize:13,fontWeight:600,
                cursor:"pointer",whiteSpace:"nowrap",outline:"none",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${accent}30`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${accent}1a`;}}>{t.editProfile}</button>
          </div>

          {/* Appearance */}
          <Section title={t.appearance} accent={accent}>
            <Row icon="🌙" label={t.darkMode} desc={t.darkModeDesc}
              right={<Toggle checked={isDark} onChange={v=>{setIsDark(v);showToast(t.saved);}} accent={accent}/>}/>
            <Row icon="🎨" label={t.accentColor} desc={t.accentColorDesc}
              right={
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {ACCENTS.map(({id,color})=>(
                    <button key={id} onClick={()=>{setAccent(color);showToast(t.saved);}} aria-label={id}
                      style={{width:24,height:24,borderRadius:"50%",background:color,border:"none",cursor:"pointer",
                        outline:accent===color?`2.5px solid ${color}`:"none",outlineOffset:3,
                        transform:accent===color?"scale(1.3)":"scale(1)",transition:"transform 0.15s"}}/>
                  ))}
                </div>
              }/>
          </Section>

          {/* Language */}
          <Section title={t.language} accent={accent}>
            <Row icon="🌐" label={t.selectLanguage} desc={t.languageDesc}
              right={
                <LangDropdown lang={lang}
                  setLang={v=>{setLang(v);showToast(TRANSLATIONS[v]?.saved||t.saved);}}
                  accent={accent}/>
              }/>
          </Section>

          {/* Sound */}
          <Section title={t.sound} accent={accent}>
            <Row icon="🔊" label={t.playbackQuality} desc={t.playbackQualityDesc}
              right={
                <div style={{display:"flex",gap:4}}>
                  {["high","medium","low"].map(q=>(
                    <button key={q} onClick={()=>{setQuality(q);showToast(t.saved);}}
                      style={{padding:"5px 12px",borderRadius:100,fontSize:12,fontWeight:600,border:"1px solid",
                        borderColor:quality===q?accent:"rgba(255,255,255,0.12)",
                        background:quality===q?`${accent}1a`:"transparent",
                        color:quality===q?accent:"var(--sw-muted)",
                        cursor:"pointer",outline:"none",transition:"all 0.15s"}}>{t[q]}</button>
                  ))}
                </div>
              }/>
            <CrossfadeRow accent={accent} label={t.crossfade} desc={t.crossfadeDesc}/>
            <Row icon="▶️" label={t.autoplay} desc={t.autoplayDesc}
              right={<Toggle checked={autoplay} onChange={v=>save(setAutoplay,v)} accent={accent}/>}/>
            <Row icon="🎛️" label={t.equalizer} desc={t.equalizerDesc} badge="SOON"
              right={<span style={{color:"var(--sw-muted)",fontSize:18}}>›</span>}/>
          </Section>

          {/* Notifications */}
          <Section title={t.notifications} accent={accent}>
            <Row icon="🔔" label={t.pushNotifications} desc={t.pushNotificationsDesc}
              right={<Toggle checked={pushNotif} onChange={v=>save(setPushNotif,v)} accent={accent}/>}/>
            <Row icon="🎵" label={t.newRelease} desc={t.newReleaseDesc}
              right={<Toggle checked={newRelease} onChange={v=>save(setNewRelease,v)} accent={accent}/>}/>
            <Row icon="📧" label={t.emailUpdates} desc={t.emailUpdatesDesc}
              right={<Toggle checked={emailNotif} onChange={v=>save(setEmailNotif,v)} accent={accent}/>}/>
          </Section>

          {/* Privacy & Security */}
          <Section title={t.privacySecurity} accent={accent}>
            <Row icon="🔒" label={t.privateSession} desc={t.privateSessionDesc}
              right={<Toggle checked={privateMode} onChange={v=>save(setPrivateMode,v)} accent={accent}/>}/>
            <Row icon="🛡️" label={t.twoFactor} desc={t.twoFactorDesc} badge="NEW"
              right={<Toggle checked={twoFactor} onChange={v=>save(setTwoFactor,v)} accent={accent}/>}/>
            <Row icon="📶" label={t.dataUsage} desc={t.dataUsageDesc}
              right={<Toggle checked={dataSaver} onChange={v=>save(setDataSaver,v)} accent={accent}/>}/>
          </Section>

          {/* Storage */}
          <Section title={t.storage} accent={accent}>
            <Row icon="🗑️" label={t.clearCache} desc={t.clearCacheDesc}
              right={
                <button onClick={handleClearCache}
                  style={{padding:"6px 14px",borderRadius:100,fontSize:12,fontWeight:600,
                    border:"1px solid rgba(255,255,255,0.12)",background:"transparent",
                    color:"var(--sw-muted)",cursor:"pointer",outline:"none",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.color="var(--sw-text)";e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color="var(--sw-muted)";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";}}>
                  Clear
                </button>
              }/>
            <Row icon="🔗" label={t.shareProfile} desc={t.shareProfileDesc}
              onClick={()=>{navigator.clipboard?.writeText(window.location.origin+"/profile");showToast("Link copied!");}}
              right={<span style={{color:"var(--sw-muted)",fontSize:18}}>›</span>}/>
          </Section>

          {/* About */}
          <Section title={t.about} accent={accent}>
            <Row icon="ℹ️" label={t.version}
              right={<span style={{fontSize:13,color:"var(--sw-muted)",fontWeight:500}}>1.0.0</span>}/>
            <Row icon="📄" label={t.termsOfService}
              right={<span style={{color:"var(--sw-muted)",fontSize:18}}>›</span>}
              onClick={()=>navigate("/terms")}/>
            <Row icon="🛡️" label={t.privacyPolicy}
              right={<span style={{color:"var(--sw-muted)",fontSize:18}}>›</span>}
              onClick={()=>navigate("/terms?tab=privacy")}/>
            <Row icon="❓" label={t.helpCenter}
              right={<span style={{color:"var(--sw-muted)",fontSize:18}}>›</span>}
              onClick={()=>navigate("/support")}/>
          </Section>

          {/* Account */}
          <Section title={t.account} accent={accent}>
            <Row icon="🔑" label={t.changePassword}
              right={<span style={{color:"var(--sw-muted)",fontSize:18}}>›</span>}
              onClick={()=>navigate("/change-password")}/>
            <Row icon="🚪" label={t.logout} desc={t.logoutDesc} danger onClick={handleLogout}
              right={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff4d6d">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              }/>
            <Row icon="⚠️" label={t.deleteAccount} desc={t.deleteAccountDesc} danger
              right={<span style={{color:"#ff4d6d",fontSize:18}}>›</span>}
              onClick={()=>{if(window.confirm("Are you sure? This cannot be undone."))handleLogout();}}/>
          </Section>

        </div>
      </div>
      {toast&&<Toast msg={toast} accent={accent}/>}
    </>
  );
}